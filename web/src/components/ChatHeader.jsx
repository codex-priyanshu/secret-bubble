import React from 'react';
import { ShieldCheck, Lock, Settings, Menu, Globe, User } from 'lucide-react';

export default function ChatHeader({
  target,
  onRelockAll,
  onOpenSettings,
  onOpenProfile,
  aiEnabled,
  isTyping,
  onToggleSidebar
}) {
  return (
    <header className="px-3.5 py-2.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 sticky top-0 z-20 backdrop-blur-md">
      
      {/* Target Info (Direct Friend or Global Room) */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          title="Toggle Friends List"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative shrink-0">
          {target?.type === 'room' ? (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              <Globe className="w-4 h-4" />
            </div>
          ) : target?.avatarUrl ? (
            <img
              src={target.avatarUrl}
              alt={target.name}
              className="w-9 h-9 rounded-full object-cover border border-purple-500/60 shadow-md"
            />
          ) : (
            <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${target?.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
              {target?.name?.charAt(0) || 'U'}
            </div>
          )}
          {target?.type !== 'room' && (
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
              target?.isOnline ? 'bg-emerald-400 ring-1 ring-emerald-400' : 'bg-slate-600'
            }`} />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 truncate">
            <span className="truncate">{target?.name || 'Global Chat'}</span>
            {target?.type !== 'room' && target?.isOnline && (
              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                online
              </span>
            )}
          </h2>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
            {isTyping ? (
              <span className="text-cyan-400 font-medium animate-pulse">typing...</span>
            ) : (
              <>
                <ShieldCheck className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                <span className="truncate">{target?.type === 'room' ? 'Public Room • Views tracked' : 'Biometric Private E2EE'}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onRelockAll}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
          title="Relock All Private Messages"
        >
          <Lock className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline text-xs">Relock</span>
        </button>

        <button
          onClick={onOpenProfile}
          className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition"
          title="My Profile & DP"
        >
          <User className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl transition relative"
          title="AI Settings"
        >
          <Settings className="w-4 h-4" />
          {aiEnabled && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full ring-1 ring-slate-900 animate-pulse" />
          )}
        </button>
      </div>

    </header>
  );
}