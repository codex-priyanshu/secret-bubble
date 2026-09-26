import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Users, Activity, Music, MessageSquare, Radio, 
  Search, RefreshCw, X, Lock, CheckCircle2, AlertCircle, 
  Clock, ArrowUpRight, TrendingUp, Sparkles, Filter, ShieldAlert,
  Headphones
} from 'lucide-react';

export default function AdminDashboard({ isOpen, onClose, backendUrl = '' }) {
  if (!isOpen) return null;

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('secret_bubble_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [passkeyInput, setPasskeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Analytics states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'online' | 'active_today' | 'inactive' | 'music' | 'chat'
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  const getApiBase = useCallback(() => {
    if (backendUrl) return backendUrl.replace(/\/$/, '');
    if (import.meta.env?.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
    
    const isNativeApp = typeof window !== 'undefined' && (
      Boolean(window.Capacitor?.isNativePlatform?.()) ||
      Boolean(window.Capacitor) ||
      window.location?.protocol === 'capacitor:' ||
      (window.location?.hostname === 'localhost' && !window.location?.port && !import.meta.env.DEV)
    );

    if (isNativeApp) return 'https://secret-bubble-backend.onrender.com';
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const hostname = window.location.hostname || 'localhost';
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        return `http://${hostname}:5000`;
      }
    }
    return 'https://secret-bubble-backend.onrender.com';
  }, [backendUrl]);

  // Authenticate Admin
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const clean = passkeyInput.trim();
    if (!clean) {
      setAuthError('Please enter admin passkey');
      return;
    }

    setAuthLoading(true);
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: clean })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        try {
          sessionStorage.setItem('secret_bubble_admin_auth', 'true');
        } catch {}
      } else {
        setAuthError(data.message || 'Incorrect admin passkey');
      }
    } catch (err) {
      // Local fallback for 0000 or admin1234
      if (clean === '0000' || clean === 'admin1234' || clean === 'admin') {
        setIsAuthenticated(true);
        sessionStorage.setItem('secret_bubble_admin_auth', 'true');
      } else {
        setAuthError('Verification failed. Invalid passkey.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch Dashboard Stats and Users
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const apiBase = getApiBase();

    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${apiBase}/api/admin/stats`),
        fetch(`${apiBase}/api/admin/users`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (usersData.success && Array.isArray(usersData.users)) {
          setUsersList(usersData.users);
        }
      }
      setLastRefreshed(Date.now());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getApiBase]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 15000); // Polling every 15s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchDashboardData]);

  // Filtered Users
  const filteredUsers = usersList.filter(user => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (user.username || '').toLowerCase().includes(q) ||
      (user.name || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'online') return user.status === 'online';
    if (activeTab === 'active_today') return user.status === 'online' || user.status === 'active_today';
    if (activeTab === 'inactive') return user.status === 'inactive';
    if (activeTab === 'music') return user.lastActivityType === 'music' || user.musicPlayCount > 0;
    if (activeTab === 'chat') return user.lastActivityType === 'chat' || user.messageCount > 0;
    return true;
  });

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Never';
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-hidden font-sans">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-[#1ed760] p-0.5 shadow-lg flex items-center justify-center text-black">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Admin & Telemetry Dashboard</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Real-time user engagement, music listeners & chat analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                title="Refresh stats"
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Authentication Gate */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-sm bg-slate-950/80 border border-slate-800 rounded-3xl p-7 shadow-2xl space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Admin Authentication Required</h3>
                <p className="text-xs text-slate-400 mt-1">Enter master admin passkey to view users & activity telemetry</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={passkeyInput}
                    onChange={(e) => { setPasskeyInput(e.target.value); setAuthError(''); }}
                    placeholder="Enter master passkey"
                    autoFocus
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white placeholder-slate-500 text-center tracking-widest focus:outline-none transition shadow-inner font-mono"
                  />
                  {authError && (
                    <p className="text-xs text-rose-400 mt-1.5 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : 'Unlock Admin Dashboard'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Dashboard Main View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Stat Cards Grid (6 core metrics: Registered, Online, Active, Music, Guests, Chat) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Card 1: Total Users */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {stats?.totalUsers ?? usersList.filter(u => !u.isGuestSummary).length}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Registered accounts</p>
                </div>
              </div>

              {/* Card 2: Live Online Users */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Online Now</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {stats?.onlineNow ?? usersList.filter(u => u.status === 'online').length}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Real-time connected</p>
                </div>
              </div>

              {/* Card 3: Active Today vs Inactive */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Active Today</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {(stats?.activeToday ?? 0) + (stats?.guestActiveToday ?? 0)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stats?.activeToday ?? 0} reg + {stats?.guestActiveToday ?? 0} guests
                  </p>
                </div>
              </div>

              {/* Card 4: Daily Music Listeners (Registered) */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Reg. Music</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Music className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {stats?.dailyMusicUsers ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stats?.dailyMusicPlays ?? 0} tracks played
                  </p>
                </div>
              </div>

              {/* Card 5: Guest Listeners (Anonymous) */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Guest Music</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
                    {stats?.guestMusicUsers ?? 0}
                  </p>
                  <p className="text-[10px] text-amber-400/80 mt-0.5">
                    {stats?.guestMusicPlays ?? 0} guest plays
                  </p>
                </div>
              </div>

              {/* Card 6: Daily Chat Users */}
              <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Chat Users</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {stats?.dailyChatUsers ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stats?.dailyMessages ?? 0} messages today
                  </p>
                </div>
              </div>
            </div>

            {/* Engagement Breakdown Comparison Bar */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Daily Platform Activity Distribution</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Comparing active engagement between Music streaming & Chatting</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-slate-300">Music ({stats?.dailyMusicUsers || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">Chat ({stats?.dailyChatUsers || 0})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <span className="text-slate-400">Inactive ({stats?.inactiveUsers || 0})</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {(() => {
                const total = Math.max(1, (stats?.totalUsers || usersList.length || 1));
                const musicPercent = Math.min(100, Math.round(((stats?.dailyMusicUsers || 0) / total) * 100));
                const chatPercent = Math.min(100 - musicPercent, Math.round(((stats?.dailyChatUsers || 0) / total) * 100));
                return (
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div style={{ width: `${musicPercent}%` }} className="bg-purple-500 transition-all duration-500" title={`Music: ${musicPercent}%`} />
                    <div style={{ width: `${chatPercent}%` }} className="bg-emerald-500 transition-all duration-500" title={`Chat: ${chatPercent}%`} />
                  </div>
                );
              })()}
            </div>

            {/* Filter Tabs & Search Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {[
                  { id: 'all', label: `All Users (${usersList.length})` },
                  { id: 'online', label: `Online (${usersList.filter(u => u.status === 'online').length})` },
                  { id: 'active_today', label: `Active Today (${usersList.filter(u => u.status === 'active_today' || u.status === 'online').length})` },
                  { id: 'inactive', label: `Inactive (${usersList.filter(u => u.status === 'inactive').length})` },
                  { id: 'music', label: `Music (${usersList.filter(u => u.lastActivityType === 'music' || u.musicPlayCount > 0).length})` },
                  { id: 'chat', label: `Chat (${usersList.filter(u => u.lastActivityType === 'chat' || u.messageCount > 0).length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or username..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Primary Activity</th>
                      <th className="py-3 px-4">Last Active</th>
                      <th className="py-3 px-4 text-center">Songs Played</th>
                      <th className="py-3 px-4 text-center">Messages Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => {
                      const isOnline = u.status === 'online';
                      const isActiveToday = u.status === 'active_today';
                      return (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          {/* User Avatar & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {u.isGuestSummary ? (
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30 shadow">
                                  <Headphones className="w-4 h-4" />
                                </div>
                              ) : u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700" />
                              ) : (
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${u.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow`}>
                                  {(u.name || u.username || 'U')[0].toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate">{u.name || u.username}</p>
                                <p className="text-[10px] text-slate-400 font-mono">@{u.username}</p>
                              </div>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            {isOnline ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                Online
                              </span>
                            ) : isActiveToday ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                Active Today
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium">
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Primary Activity */}
                          <td className="py-3 px-4">
                            {u.lastActivityType === 'music' ? (
                              <span className="inline-flex items-center gap-1 text-purple-400 font-semibold">
                                <Music className="w-3.5 h-3.5" />
                                <span>Listening to Music</span>
                              </span>
                            ) : u.lastActivityType === 'chat' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Using Chat</span>
                              </span>
                            ) : (
                              <span className="text-slate-500">Idle / Browsing</span>
                            )}
                          </td>

                          {/* Last Active */}
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {formatTimeAgo(u.lastActiveAt)}
                          </td>

                          {/* Songs Count */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-purple-400">
                            {u.musicPlayCount || 0}
                          </td>

                          {/* Messages Count */}
                          <td className="py-3 px-4 text-center font-mono font-bold text-indigo-400">
                            {u.messageCount || 0}
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-500 text-xs">
                          No users found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Activity Stream (Recent 15 events) */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Activity Stream</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Last 30 actions</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(stats?.recentActivities || []).map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/40 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        ev.type === 'music' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {ev.type === 'music' ? <Music className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                      </div>
                      <span className="text-slate-200 truncate font-medium">{ev.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 pl-2">
                      {formatTimeAgo(ev.timestamp)}
                    </span>
                  </div>
                ))}

                {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No activity recorded yet today. Play music or chat to start logging.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Secret-Bubble Security Operations Console</span>
          <span>Last sync: {new Date(lastRefreshed).toLocaleTimeString()}</span>
        </div>

      </div>
    </div>
  );
}
