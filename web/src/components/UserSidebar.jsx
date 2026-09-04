import React, { useState } from 'react';
import { Users, User, Search, MessageSquare, Globe, Shield, LogOut, Camera } from 'lucide-react';

export default function UserSidebar({
  currentUser,
  users,
  selectedTarget,
  onSelectTarget,
  onLogout,
  onOpenProfile,
  unreadCounts = {}
}) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.id !== currentUser.id && 
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      
      {/* Current User Header with DP and Edit Profile button */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
          title="Click to change DP & Profile"
        >
          <div className="relative shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="DP"
                className="w-10 h-10 rounded-full object-cover border border-purple-500 shadow-md group-hover:scale-105 transition"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition`}>
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-0.5 bg-slate-900 rounded-full text-purple-400">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="truncate text-left">
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition truncate">{currentUser.name}</h3>
            <span className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Logout"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Search Friends */}
      <div className="p-2.5 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Channels / Users List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        
        {/* Global Group Room */}
        <button
          onClick={() => onSelectTarget({ type: 'room', id: 'global', name: 'Global Group Room' })}
          className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition ${
            selectedTarget?.type === 'room' && selectedTarget?.id === 'global'
              ? 'bg-purple-600/20 border border-purple-500/60 text-purple-200 shadow-sm'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white">Global Friends Room</p>
              <p className="text-[10px] text-slate-400">Public group chat</p>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">All</span>
        </button>

        <div className="pt-2 pb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Direct Friends ({filteredUsers.length})</span>
        </div>

        {filteredUsers.map((user) => {
          const isSelected = selectedTarget?.type === 'user' && selectedTarget?.id === user.id;
          const unread = unreadCounts[user.id] || 0;

          return (
            <button
              key={user.id}
              onClick={() => onSelectTarget({ type: 'user', ...user })}
              className={`w-full p-2 rounded-2xl flex items-center justify-between transition ${
                isSelected
                  ? 'bg-purple-600/20 border border-purple-500/60 text-purple-200 shadow-sm'
                  : 'hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700 shadow-sm"
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${user.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                    user.isOnline ? 'bg-emerald-400 ring-1 ring-emerald-400' : 'bg-slate-600'
                  }`} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.isOnline ? (
                      <span className="text-emerald-400 font-medium">online</span>
                    ) : (
                      <span>offline</span>
                    )}
                  </p>
                </div>
              </div>

              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold shadow-md animate-bounce">
                  {unread}
                </span>
              )}
            </button>
          );
        })}

      </div>
    </div>
  );
}