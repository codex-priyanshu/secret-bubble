import React from 'react';
import { Lock, Fingerprint, Unlock, Timer, EyeOff, Bot } from 'lucide-react';

export default function MessageItem({
  message,
  currentUser,
  isUnlocked,
  remainingSeconds,
  onUnlockClick,
  onRelockClick
}) {
  const isMe = message.senderId === currentUser.id;
  const isLockedMsg = Boolean(message.isLocked);
  const unlocked = isUnlocked(message.id);
  const secondsLeft = remainingSeconds(message.id);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
      {!isMe && (
        <span className="text-xs text-slate-400 font-medium mb-1 ml-2">
          {message.sender}
        </span>
      )}

      {!isLockedMsg ? (
        <div
          className={`max-w-md px-4 py-3 rounded-2xl shadow-sm text-sm ${
            isMe
              ? 'bg-emerald-600 text-white rounded-br-none'
              : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
          }`}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <div className={`text-[10px] mt-1.5 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
            {formattedTime}
          </div>
        </div>
      ) : unlocked ? (
        <div
          className={`relative max-w-md p-4 rounded-2xl border transition-all duration-300 shadow-xl ${
            isMe
              ? 'bg-purple-950/70 border-purple-500/80 text-purple-100 rounded-br-none'
              : 'bg-slate-900/90 border-purple-500/80 text-purple-100 rounded-bl-none'
          }`}
        >
          <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-purple-500/30 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Unlock className="w-3.5 h-3.5" />
              <span>Biometric Unlocked</span>
              {message.isAiShielded && (
                <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  <Bot className="w-2.5 h-2.5" /> AI Shield
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-mono font-bold animate-pulse">
                <Timer className="w-3 h-3" />
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

          <p className="text-sm font-medium leading-relaxed text-slate-50 whitespace-pre-wrap">
            {message.text}
          </p>

          <div className="flex items-center justify-between text-[10px] mt-3 text-purple-300/80">
            <span className="italic">🏷️ {message.category || 'Feelings & Private'}</span>
            <span>{formattedTime}</span>
          </div>
        </div>
      ) : (
        <div
          className={`relative max-w-md w-full sm:w-80 p-3.5 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-rose-950/30 shadow-lg backdrop-blur-md ${
            isMe ? 'rounded-br-none' : 'rounded-bl-none'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-semibold">
              <Lock className="w-3 h-3" />
              <span>{message.category || 'Private & Sensitive'}</span>
            </div>
            <div className="flex items-center gap-1">
              {message.isAiShielded && (
                <span className="flex items-center gap-0.5 text-[9px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">
                  <Bot className="w-2.5 h-2.5" /> AI Auto-Shield
                </span>
              )}
              <span className="text-[10px] text-slate-500">{formattedTime}</span>
            </div>
          </div>

          <div className="relative my-2 py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800 overflow-hidden">
            <p className="text-xs text-slate-500 select-none filter blur-sm">
              This message contains private feelings and intimate conversations that are hidden from unauthorized viewers.
            </p>
          </div>

          <button
            onClick={() => onUnlockClick(message)}
            className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-purple-500/20 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Fingerprint className="w-4 h-4 text-rose-200 animate-pulse" />
            <span>Tap with Fingerprint / Face ID to Read</span>
          </button>
        </div>
      )}
    </div>
  );
}