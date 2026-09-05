import React, { useState } from 'react';
import { 
  Lock, Fingerprint, Unlock, Timer, EyeOff, Bot, Edit2, Trash2, 
  Check, X, Eye, CheckCheck, Flame, Sparkles, Smile 
} from 'lucide-react';

const EMOJI_REACTIONS = ['❤️', '👍', '🔥', '😂', '👏', '😮'];

export default function MessageItem({
  message,
  currentUser,
  isUnlocked,
  remainingSeconds,
  onUnlockClick,
  onRelockClick,
  onEditMessage,
  onDeleteMessage
}) {
  const isMe = message.senderId === currentUser.id;
  const isMetaAi = message.senderId === 'user-meta-ai';
  const isLockedMsg = Boolean(message.isLocked);
  const unlocked = isUnlocked(message.id);
  const secondsLeft = remainingSeconds(message.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [reactions, setReactions] = useState([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const viewsCount = message.viewers ? message.viewers.length : 1;

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
        ) : unlocked ? (
          /* Case 2: Private Message Revealed via Biometrics */
          <div
            className={`relative p-4 rounded-2xl border transition-all duration-300 shadow-xl ${
              isMe
                ? 'bg-purple-950/80 border-purple-500/80 text-purple-100 rounded-br-sm'
                : 'bg-slate-900/95 border-purple-500/80 text-purple-100 rounded-bl-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-purple-500/30 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <Unlock className="w-3.5 h-3.5" />
                <span>Biometric Shield Unlocked</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold animate-pulse">
                  <Timer className="w-3 h-3" />
                  {secondsLeft}s
                </span>
                <button
                  onClick={() => onRelockClick(message.id)}
                  title="Hide message immediately"
                  className="p-1 rounded bg-slate-800 hover:bg-purple-800 text-slate-300 hover:text-white transition"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

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
                  <button type="button" onClick={() => setIsEditing(false)} className="p-1 rounded bg-slate-700 text-xs"><X className="w-3.5 h-3.5" /></button>
                  <button type="submit" className="p-1 rounded bg-purple-600 text-white text-xs"><Check className="w-3.5 h-3.5" /></button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-sm font-medium leading-relaxed text-slate-50 whitespace-pre-wrap">
                  {message.text}
                </p>

                <div className="flex items-center justify-between text-[10px] mt-2 text-purple-300/80">
                  <span className="italic">🏷️ {message.category || 'Feelings & Private'}</span>
                  <div className="flex items-center gap-2">
                    {message.isEdited && <span className="italic text-[9px]">edited</span>}
                    <span>{formattedTime}</span>
                    <span className="flex items-center gap-0.5 opacity-80">
                      <Eye className="w-3 h-3" />
                      <span>{viewsCount}</span>
                    </span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Case 3: Private Message Locked (Masked Frosted Card) */
          <div
            className={`relative w-72 sm:w-80 p-3.5 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-rose-950/30 shadow-xl backdrop-blur-md ${
              isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                <Lock className="w-3 h-3" />
                <span>{message.category || 'Private Message'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span>{formattedTime}</span>
                <span className="flex items-center gap-0.5 opacity-70">
                  <Eye className="w-3 h-3" />
                  <span>{viewsCount}</span>
                </span>
                {isMe && <CheckCheck className="w-3.5 h-3.5 text-slate-500" />}
              </div>
            </div>

            <div className="relative my-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 overflow-hidden">
              <p className="text-xs text-slate-500 select-none filter blur-sm">
                This private message is protected by granular biometric encryption.
              </p>
            </div>

            <button
              onClick={() => onUnlockClick(message)}
              className="w-full mt-1.5 py-2 px-3 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-rose-200 animate-pulse" />
              <span>Verify Fingerprint / Face ID to Read</span>
            </button>
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
    </div>
  );
}