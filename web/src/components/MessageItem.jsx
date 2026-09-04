import React, { useState } from 'react';
import { Lock, Fingerprint, Unlock, Timer, EyeOff, Bot, MoreVertical, Edit2, Trash2, Check, X, Eye } from 'lucide-react';

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
  const isLockedMsg = Boolean(message.isLocked);
  const unlocked = isUnlocked(message.id);
  const secondsLeft = remainingSeconds(message.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showMenu, setShowMenu] = useState(false);

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

  return (
    <div className={`flex flex-col mb-3 group relative ${isMe ? 'items-end' : 'items-start'}`}>
      
      {/* Sender Header for others */}
      {!isMe && (
        <span className="text-[11px] text-slate-400 font-medium mb-1 ml-2 flex items-center gap-1.5">
          {message.sender}
        </span>
      )}

      <div className="relative max-w-[88%] sm:max-w-md">
        
        {/* Message Actions Menu (Edit / Delete) on Hover or Tap for author */}
        {isMe && !isEditing && (
          <div className="absolute -top-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5 shadow-md z-10">
            <button
              onClick={() => { setIsEditing(true); setEditText(message.text); }}
              title="Edit Message"
              className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white rounded"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDeleteMessage(message.id)}
              title="Delete Message"
              className="p-1 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Case 1: Normal Unlocked Message */}
        {!isLockedMsg ? (
          <div
            className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-sm ${
              isMe
                ? 'bg-emerald-600 text-white rounded-br-none'
                : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
            }`}
          >
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-2 min-w-[200px]">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none"
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
                <div className={`text-[10px] mt-1 flex items-center justify-end gap-2 ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {message.isEdited && <span className="italic text-[9px]">edited</span>}
                  <span>{formattedTime}</span>
                  {/* Telegram-style View Count */}
                  <span className="flex items-center gap-0.5 opacity-80" title={`${viewsCount} viewers seen`}>
                    <Eye className="w-3 h-3" />
                    <span>{viewsCount}</span>
                  </span>
                </div>
              </>
            )}
          </div>
        ) : unlocked ? (
          /* Case 2: Private Message Revealed via Biometrics */
          <div
            className={`relative p-3.5 rounded-2xl border transition-all duration-300 shadow-xl ${
              isMe
                ? 'bg-purple-950/70 border-purple-500/80 text-purple-100 rounded-br-none'
                : 'bg-slate-900/90 border-purple-500/80 text-purple-100 rounded-bl-none'
            }`}
          >
            <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-purple-500/30 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <Unlock className="w-3 h-3" />
                <span>Biometric Unlocked</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold animate-pulse">
                  <Timer className="w-2.5 h-2.5" />
                  {secondsLeft}s
                </span>
                <button
                  onClick={() => onRelockClick(message.id)}
                  title="Hide message immediately"
                  className="p-1 rounded bg-slate-800 hover:bg-purple-800 text-slate-300 hover:text-white transition"
                >
                  <EyeOff className="w-3 h-3" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-2 min-w-[200px]">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none"
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
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Case 3: Private Message Locked (Masked Card) */
          <div
            className={`relative w-72 sm:w-80 p-3 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-rose-950/30 shadow-lg backdrop-blur-md ${
              isMe ? 'rounded-br-none' : 'rounded-bl-none'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-semibold">
                <Lock className="w-3 h-3" />
                <span>{message.category || 'Private Message'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span>{formattedTime}</span>
                <span className="flex items-center gap-0.5 opacity-70">
                  <Eye className="w-3 h-3" />
                  <span>{viewsCount}</span>
                </span>
              </div>
            </div>

            <div className="relative my-1.5 py-1.5 px-2.5 rounded-lg bg-slate-950/60 border border-slate-800 overflow-hidden">
              <p className="text-xs text-slate-500 select-none filter blur-sm">
                This message contains private conversations protected by biometrics.
              </p>
            </div>

            <button
              onClick={() => onUnlockClick(message)}
              className="w-full mt-1.5 py-1.5 px-2.5 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition cursor-pointer"
            >
              <Fingerprint className="w-3.5 h-3.5 text-rose-200 animate-pulse" />
              <span>Tap with Fingerprint / Face ID to Read</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}