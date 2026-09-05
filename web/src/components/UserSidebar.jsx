import React, { useState } from 'react';
import { 
  Users, User, Search, MessageSquare, Globe, Shield, LogOut, Camera, 
  Pin, Bot, CheckCheck, Menu, Moon, Lock, Settings as SettingsIcon, Sparkles, Plus, Brain 
} from 'lucide-react';

export default function UserSidebar({
  currentUser,
  users,
  selectedTarget,
  onSelectTarget,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  onLockApp,
  onOpenAiTraining,
  unreadCounts = {}
}) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'direct', 'channels', 'bots'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Separate Meta AI Bot, Public Channel, and real users
  const metaAiBot = users.find(u => u.id === 'user-meta-ai' || u.isBot);
  const realUsers = users.filter(u => u.id !== currentUser.id && u.id !== 'user-meta-ai' && !u.isBot);

  const filteredUsers = realUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800/90 flex flex-col h-full select-none relative font-sans">
      
      {/* Telegram-style Top Header */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Telegram Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Telegram Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)} 
              />
              <div className="absolute left-0 top-12 z-50 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2.5 border-b border-slate-800 flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-xs`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenProfile(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span>My Profile & DP</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onLockApp && onLockApp(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Passcode Lock Screen</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenAiTraining && onOpenAiTraining(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-cyan-300">Train AI Bot Studio</span>
                </button>

                <button
                  onClick={() => { setIsMenuOpen(false); onOpenSettings && onOpenSettings(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2.5 transition"
                >
                  <SettingsIcon className="w-4 h-4 text-cyan-400" />
                  <span>Privacy & AI Shield</span>
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={() => { setIsMenuOpen(false); onLogout(); }}
                  className="w-full p-2 text-left rounded-xl hover:bg-rose-950/60 text-rose-400 flex items-center gap-2.5 transition font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Telegram Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Telegram chats..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Lock Screen Shortcut */}
        <button
          onClick={onLockApp}
          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition"
          title="Instant Passcode Lock"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs (All, Direct, Channels, Bots) */}
      <div className="flex gap-1 px-3 py-2 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto text-[11px] font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full transition shrink-0 ${
            activeFilter === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          All Chats
        </button>
        <button
          onClick={() => setActiveFilter('direct')}
          className={`px-3 py-1 rounded-full transition shrink-0 ${
            activeFilter === 'direct'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Direct ({realUsers.length})
        </button>
        <button
          onClick={() => setActiveFilter('channels')}
          className={`px-3 py-1 rounded-full transition shrink-0 ${
            activeFilter === 'channels'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Public Channel
        </button>
        <button
          onClick={() => setActiveFilter('bots')}
          className={`px-3 py-1 rounded-full transition shrink-0 ${
            activeFilter === 'bots'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          AI Bot 🤖
        </button>
      </div>

      {/* Chat List Feed */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        
        {/* PINNED SECTION */}
        {(activeFilter === 'all' || activeFilter === 'channels') && (
          <>
            {/* 1. Global Public Chat Channel (Pinned Top) */}
            <button
              onClick={() => onSelectTarget({ type: 'room', id: 'global', name: '🌍 Global Public Chat' })}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group relative ${
                selectedTarget?.type === 'room' && selectedTarget?.id === 'global'
                  ? 'bg-purple-600/20 border border-purple-500/60 text-purple-100 shadow-md'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">Global Public Channel</p>
                    <span className="p-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold shrink-0">PIN</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Public community chat • Views tracking
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 ml-2">
                <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-[10px] text-slate-500 mt-1 font-mono">Live</span>
              </div>
            </button>
          </>
        )}

        {/* 2. Meta AI Assistant Bot (Pinned) */}
        {(activeFilter === 'all' || activeFilter === 'bots') && metaAiBot && (
          <button
            onClick={() => onSelectTarget({ type: 'user', ...metaAiBot })}
            className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group relative ${
              selectedTarget?.type === 'user' && selectedTarget?.id === metaAiBot.id
                ? 'bg-indigo-600/25 border border-indigo-500/60 text-indigo-100 shadow-md'
                : 'hover:bg-slate-800/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full text-cyan-400 ring-1 ring-cyan-400">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate">Meta AI Assistant</p>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-bold shrink-0">BOT</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  AI Privacy & Intelligence Assistant
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 ml-2">
              <span className="text-[10px] text-cyan-400 font-bold">24/7 AI</span>
            </div>
          </button>
        )}

        {/* SECTION DIVIDER: DIRECT USERS */}
        {(activeFilter === 'all' || activeFilter === 'direct') && (
          <div className="pt-3 pb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Direct Messages ({filteredUsers.length})</span>
          </div>
        )}

        {/* Real Users List */}
        {(activeFilter === 'all' || activeFilter === 'direct') && filteredUsers.map((user) => {
          const isSelected = selectedTarget?.type === 'user' && selectedTarget?.id === user.id;
          const unread = unreadCounts[user.id] || 0;

          return (
            <button
              key={user.id}
              onClick={() => onSelectTarget({ type: 'user', ...user })}
              className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition group ${
                isSelected
                  ? 'bg-purple-600/20 border border-purple-500/60 text-purple-100 shadow-md'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-700 shadow-sm"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${user.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    user.isOnline ? 'bg-emerald-400 ring-1 ring-emerald-400' : 'bg-slate-600'
                  }`} />
                </div>

                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    {user.isOnline && (
                      <span className="text-[9px] font-medium text-emerald-400">online</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user.bio || `@${user.username}`}
                  </p>
                </div>
              </div>

              {unread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold shadow-md animate-bounce ml-2">
                  {unread}
                </span>
              )}
            </button>
          );
        })}

        {filteredUsers.length === 0 && (activeFilter === 'all' || activeFilter === 'direct') && (
          <div className="text-center py-8 text-slate-500 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No other users online yet.</p>
            <p className="text-[10px] mt-1 text-slate-600">Share your app link to start chatting!</p>
          </div>
        )}

      </div>

      {/* Current User Bottom Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
          title="Edit Profile & DP"
        >
          <div className="relative shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="DP"
                className="w-9 h-9 rounded-full object-cover border border-purple-500 shadow-md group-hover:scale-105 transition"
              />
            ) : (
              <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-xs shadow-md group-hover:scale-105 transition`}>
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full text-purple-400">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="truncate text-left">
            <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition truncate">{currentUser.name}</h4>
            <span className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Log Out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}