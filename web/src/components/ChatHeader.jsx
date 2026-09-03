import React from 'react';
import { ShieldCheck, Lock, Settings, Menu, Globe, Users } from 'lucide-react';

export default function ChatHeader({
  target,
  onRelockAll,
  onOpenSettings,
  aiEnabled,
  isTyping,
  onToggleSidebar
}) {
  return (
    <header className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-20 backdrop-blur-md">
      
      {/* Target Info (Direct Friend or Global Room) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative shrink-0">
          {target?.type === 'room' ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <Globe className="w-5 h-5" />
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${target?.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              {target?.name?.charAt(0) || 'U'}
            </div>
          )}
          {target?.type !== 'room' && (
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
              target?.isOnline ? 'bg-emerald-400' : 'bg-slate-600'
            }`} />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 truncate">
            <span className="truncate">{target?.name || 'Global Chat'}</span>
            {target?.type !== 'room' && target?.isOnline && (
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                Online
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
            {isTyping ? (
              <span className="text-cyan-400 font-medium animate-pulse">typing message...</span>
            ) : (
              <>
                <ShieldCheck className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="truncate">Biometric Protected {aiEnabled ? '+ AI Auto-Shield' : ''}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRelockAll}
          className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          title="Instantly re-hide all private messages on screen"
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Relock All</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs transition relative cursor-pointer"
          title="Privacy & AI Auto-Shield Settings"
        >
          <Settings className="w-4 h-4" />
          {aiEnabled && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
          )}
        </button>
      </div>

    </header>
  );
}