import React, { useState } from 'react';
import { 
  Lock, Unlock, EyeOff, Bot, Edit2, Trash2, 
  Check, X, Eye, CheckCheck, Flame, Smile, KeyRound, AlertCircle, Loader2 
} from 'lucide-react';
import { analyzeMessageSensitivity } from '../utils/aiPrivacyDetector';

const EMOJI_REACTIONS = ['❤️', '👍', '🔥', '😂', '👏', '😮'];

export default function MessageItem({
  message,
  currentUser,
  isUnlocked,
  remainingSeconds,
  onUnlockClick,
  onRelockClick,
  onEditMessage,
  onDeleteMessage,
  unlockedPasscodeTexts = {},
  onUnlockPasscode,
  onRelockPasscode
}) {
  const isMe = message.senderId === currentUser.id;
  const isMetaAi = message.senderId === 'user-meta-ai';

  // AI Sensitivity scanning fallback: Ensures sensitive words (sex, love, intimate, etc.) are always locked
  const sensitivity = analyzeMessageSensitivity(message.text);
  const isSensitive = sensitivity.isSensitive;
  const isLockedMsg = Boolean(message.isLocked || message.hasPasscode || isSensitive);

  const [senderRevealed, setSenderRevealed] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputPasscode, setInputPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [showPasscodeText, setShowPasscodeText] = useState(false);

  // Check if message is currently unlocked/revealed
  const isPasscodeUnlocked = Boolean(unlockedPasscodeTexts && unlockedPasscodeTexts[message.id]);
  const isBioUnlocked = isUnlocked ? isUnlocked(message.id) : false;
  const isRevealed = Boolean(
    (isMe && senderRevealed) ||
    isPasscodeUnlocked ||
    isBioUnlocked
  );

  const displayText = isPasscodeUnlocked
    ? unlockedPasscodeTexts[message.id]
    : message.text;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [reactions, setReactions] = useState([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const viewsCount = message.viewers ? message.viewers.length : 1;

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    if (!inputPasscode.trim()) return;
    setPasscodeLoading(true);
    setPasscodeError('');

    try {
      if (onUnlockPasscode) {
        const res = await onUnlockPasscode(message.id, inputPasscode.trim());
        if (res && res.success) {
          setShowPasswordModal(false);
          setInputPasscode('');
        } else {
          setPasscodeError(res?.message || 'Incorrect password. Access denied.');
        }
      }
    } catch (err) {
      setPasscodeError('Verification failed. Please try again.');
    } finally {
      setPasscodeLoading(false);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editText.trim() && editText !== message.text) {
      onEditMessage(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleAddReaction = (emoji) => {
    setReactions(prev => {
      if (prev.includes(emoji)) return prev.filter(e => e !== emoji);
      return [...prev, emoji];
    });
    setShowReactionPicker(false);
  };

  return (
    <div className={`flex flex-col mb-3.5 group relative ${isMe ? 'items-end' : 'items-start'} font-sans`}>
      
      {/* Sender Header for group chats or Meta AI */}
      {!isMe && (
        <div className="flex items-center gap-1.5 mb-1 ml-2 text-[11px] font-semibold">
          {isMetaAi ? (
            <span className="text-cyan-400 flex items-center gap-1">
              <Bot className="w-3 h-3" /> Meta AI
            </span>
          ) : (
            <span className="text-purple-300">{message.sender}</span>
          )}
        </div>
      )}

      <div className="relative max-w-[88%] sm:max-w-md">
        
        {/* Telegram Action Bar (Edit / Delete / React) on Hover */}
        <div className={`absolute -top-3.5 ${isMe ? 'right-2' : 'left-2'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-lg z-10`}>
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            title="Add Reaction"
            className="p-1 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded transition"
          >
            <Smile className="w-3 h-3" />
          </button>

          {isMe && !isEditing && (
            <>
              <button
                onClick={() => { setIsEditing(true); setEditText(message.text); }}
                title="Edit Message"
                className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDeleteMessage(message.id)}
                title="Delete Message"
                className="p-1 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 rounded transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Floating Quick Reaction Picker */}
        {showReactionPicker && (
          <div className={`absolute -top-10 ${isMe ? 'right-0' : 'left-0'} z-20 flex gap-1 p-1 bg-slate-800 border border-slate-700 rounded-full shadow-2xl animate-in zoom-in-95 duration-100`}>
            {EMOJI_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(emoji)}
                className="p-1 text-sm hover:scale-125 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Case 1: Normal Unlocked / Public Message */}
        {!isLockedMsg ? (
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm relative ${
              isMe
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm'
                : isMetaAi
                ? 'bg-slate-900 border border-cyan-500/40 text-slate-100 rounded-bl-sm shadow-cyan-900/10'
                : 'bg-slate-800/90 text-slate-100 rounded-bl-sm border border-slate-700/60'
            }`}
          >
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-2 min-w-[220px]">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-600 rounded-lg text-sm text-white focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="submit"
                    className="p-1 rounded bg-emerald-500 hover:bg-emerald-400 text-white text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                
                {/* Telegram Footer: Timestamp, Viewers & Delivered Checkmarks */}
                <div className={`text-[10px] mt-1.5 flex items-center justify-end gap-2 select-none ${
                  isMe ? 'text-purple-200' : 'text-slate-400'
                }`}>
                  {message.selfDestructSecs && (
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold" title="Self-destruct message">
                      <Flame className="w-3 h-3" />
                      <span>{message.selfDestructSecs}s</span>
                    </span>
                  )}
                  {message.isEdited && <span className="italic text-[9px]">edited</span>}
                  <span>{formattedTime}</span>
                  
                  {/* Telegram View Count */}
                  <span className="flex items-center gap-0.5 opacity-80" title={`${viewsCount} views`}>
                    <Eye className="w-3 h-3" />
                    <span>{viewsCount}</span>
                  </span>

                  {/* Telegram Double Checks for sender */}
                  {isMe && (
                    <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                  )}
                </div>
              </>
            )}
          </div>
        ) : isRevealed ? (
          /* ======================================================== */
          /* CASE 2: Message Unlocked with Password (Unblurred) */
          /* ======================================================== */
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-md text-sm relative border animate-in zoom-in-95 duration-150 ${
              isMe
                ? 'bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-br-sm border-purple-500/50'
                : 'bg-slate-900 border-emerald-500/50 text-slate-100 rounded-bl-sm'
            }`}
          >
            {/* Unlocked status chip with re-lock button */}
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/10 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Unlock className="w-3 h-3" />
                <span>Password Unlocked • {message.category || sensitivity.category || 'Secret'}</span>
              </span>
              <button
                onClick={() => {
                  if (isMe) setSenderRevealed(false);
                  if (onRelockPasscode) onRelockPasscode(message.id);
                  if (onRelockClick) onRelockClick(message.id);
                }}
                title="Blur & Lock message again"
                className="px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[9px]"
              >
                <EyeOff className="w-3 h-3" />
                <span>Blur again</span>
              </button>
            </div>

            <p className="leading-relaxed whitespace-pre-wrap font-medium">{displayText}</p>

            {/* Footer */}
            <div className={`text-[10px] mt-1.5 flex items-center justify-between select-none ${
              isMe ? 'text-purple-200/80' : 'text-slate-400'
            }`}>
              <span className="text-[9px] opacity-70">
                {message.passcodeHint ? `💡 Hint: ${message.passcodeHint}` : '🔒 Password Protected'}
              </span>
              <div className="flex items-center gap-2">
                {message.selfDestructSecs && (
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Flame className="w-3 h-3" />
                    <span>{message.selfDestructSecs}s</span>
                  </span>
                )}
                <span>{formattedTime}</span>
                <span className="flex items-center gap-0.5 opacity-80">
                  <Eye className="w-3 h-3" />
                  <span>{viewsCount}</span>
                </span>
                {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />}
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CASE 3: Message Locked & Blurred (Telegram Privacy Spoiler) */
          /* Sleek, normal bubble size, blurred text with Tap to Unlock */
          /* ======================================================== */
          <div
            className={`relative px-4 py-2.5 rounded-2xl shadow-md text-sm border overflow-hidden transition-all duration-200 ${
              isMe
                ? 'bg-purple-950/70 border-purple-500/40 text-purple-200 rounded-br-sm'
                : 'bg-slate-900/90 border-slate-700/80 hover:border-amber-500/50 text-slate-200 rounded-bl-sm'
            }`}
          >
            {/* Blurred message text body */}
            <div className="filter blur-[6px] select-none pointer-events-none opacity-40 py-1 leading-relaxed">
              <p className="whitespace-pre-wrap">
                {isMe 
                  ? message.text 
                  : (message.text && !message.text.startsWith('[🔒') 
                      ? message.text 
                      : 'This message is password-protected. Tap to unlock and read.')}
              </p>
            </div>

            {/* Center Tap to Unlock Overlay */}
            <div 
              onClick={() => {
                setShowPasswordModal(true);
                setInputPasscode('');
                setPasscodeError('');
              }}
              className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-slate-950/40 backdrop-blur-[2px] hover:bg-slate-950/20 cursor-pointer transition select-none"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-amber-500/50 text-amber-300 text-xs font-semibold shadow-xl hover:scale-105 active:scale-95 transition">
                <KeyRound className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Tap to unlock with password</span>
                {message.category && (
                  <span className="text-[10px] text-amber-300/70 font-normal">
                    ({message.category})
                  </span>
                )}
              </div>
              {message.passcodeHint && (
                <span className="text-[10px] text-amber-200/90 mt-1 font-mono">
                  💡 Hint: {message.passcodeHint}
                </span>
              )}
            </div>

            {/* Sender Quick View & Footer */}
            {isMe ? (
              <div className="relative z-10 flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-purple-500/20 text-purple-300">
                <button
                  type="button"
                  onClick={() => setSenderRevealed(true)}
                  className="flex items-center gap-1 text-[10px] text-purple-200 hover:text-white underline cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Quick View (You sent this)</span>
                </button>
                <div className="flex items-center gap-2">
                  <span>{formattedTime}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex items-center justify-end text-[10px] mt-1 text-slate-500">
                <span>{formattedTime}</span>
              </div>
            )}
          </div>
        )}

        {/* Emoji Reactions Pill Bar */}
        {reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-800/80 border border-slate-700 rounded-full text-xs shadow-sm">
              {reactions.map((r, i) => (
                <span key={i}>{r}</span>
              ))}
              <span className="text-[10px] text-slate-400 font-bold">{reactions.length}</span>
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* Sleek Password Unlock Dialog Modal */}
      {/* ======================================================== */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Unlock Secret Message</span>
              </div>
              <button
                onClick={() => { setShowPasswordModal(false); setPasscodeError(''); }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>This message was locked by <strong className="text-purple-300">{message.sender}</strong>.</p>
              <p className="text-slate-400">Enter the password set by the sender to read this message.</p>
            </div>

            {message.passcodeHint && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                <span>💡 <strong>Hint:</strong> {message.passcodeHint}</span>
              </div>
            )}

            {passcodeError && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{passcodeError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type={showPasscodeText ? "text" : "password"}
                  value={inputPasscode}
                  onChange={(e) => { setInputPasscode(e.target.value); setPasscodeError(''); }}
                  placeholder="Enter secret password..."
                  className="w-full pl-3 pr-9 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  autoFocus
                  disabled={passcodeLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscodeText(!showPasscodeText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  {showPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPasscodeError(''); }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passcodeLoading || !inputPasscode.trim()}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {passcodeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}