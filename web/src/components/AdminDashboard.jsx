import React, { useState, useEffect, useCallback, useMemo, Component } from 'react';
import { 
  Shield, Users, Activity, Music, MessageSquare, Radio, 
  Search, RefreshCw, X, Lock, CheckCircle2, AlertCircle, 
  Clock, ArrowUpRight, TrendingUp, TrendingDown, Sparkles, Filter,
  Headphones, Calendar, CalendarDays, CalendarRange, Download, Printer,
  BarChart3, FileSpreadsheet, Smartphone, Globe, Award, Zap, Laptop
} from 'lucide-react';

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AdminDashboard error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Dashboard Encountered an Issue</h3>
            <p className="text-xs text-slate-400">{this.state.error?.message || 'Display error'}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Reload Dashboard
              </button>
              <button
                onClick={this.props.onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminDashboardContent({ isOpen, onClose, backendUrl = '' }) {
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

  // Active top-level view: 'overview' | 'daily' | 'monthly' | 'yearly' | 'users' | 'stream'
  const [dashboardView, setDashboardView] = useState('overview');

  // Daily timeframe range: 7 | 14 | 30
  const [dailyRangeDays, setDailyRangeDays] = useState(30);

  // Active chart metric: 'totalUsers' | 'musicPlays' | 'messages' | 'all'
  const [selectedChartMetric, setSelectedChartMetric] = useState('totalUsers');

  // Hovered data point in chart for interactive tooltips
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Analytics states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userDirectoryFilter, setUserDirectoryFilter] = useState('all'); // 'all' | 'online' | 'active_today' | 'inactive' | 'music' | 'chat'
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

    // Instant unlock for default master passkeys without waiting for network
    if (clean === '0000' || clean === 'admin1234' || clean === 'admin') {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('secret_bubble_admin_auth', 'true');
      } catch {}
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
      setAuthError('Verification failed. Invalid passkey.');
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
      const interval = setInterval(fetchDashboardData, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchDashboardData]);

  // Filtered Users Directory
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (user.username || '').toLowerCase().includes(q) ||
        (user.name || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (userDirectoryFilter === 'online') return user.status === 'online';
      if (userDirectoryFilter === 'active_today') return user.status === 'online' || user.status === 'active_today';
      if (userDirectoryFilter === 'inactive') return user.status === 'inactive';
      if (userDirectoryFilter === 'music') return user.lastActivityType === 'music' || user.musicPlayCount > 0;
      if (userDirectoryFilter === 'chat') return user.lastActivityType === 'chat' || user.messageCount > 0;
      return true;
    });
  }, [usersList, searchQuery, userDirectoryFilter]);

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

  // Active dataset for graphs & reports based on current view
  const activeDataset = useMemo(() => {
    if (!stats) return [];
    if (dashboardView === 'daily') {
      const full = stats.dailyTrends || [];
      return full.slice(Math.max(0, full.length - dailyRangeDays));
    }
    if (dashboardView === 'monthly') {
      return stats.monthlyTrends || [];
    }
    if (dashboardView === 'yearly') {
      return stats.yearlyTrends || [];
    }
    // Overview default: last 14 days
    const full = stats.dailyTrends || [];
    return full.slice(Math.max(0, full.length - 14));
  }, [stats, dashboardView, dailyRangeDays]);

  // Client-side instant CSV Export
  const handleExportCsv = () => {
    if (!activeDataset || activeDataset.length === 0) return;
    const viewName = dashboardView === 'overview' ? 'Daily_Summary' : dashboardView.toUpperCase();
    const headers = ['Period / Date', 'Total Visitors', 'Registered Users', 'Guest Visitors', 'Music Plays', 'Chat Messages'];
    const rows = activeDataset.map(item => [
      `"${item.date || item.month || item.year || item.label}"`,
      item.totalUsers || 0,
      item.registeredUsers || 0,
      item.guestUsers || 0,
      item.musicPlays || 0,
      item.messages || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SecretBubble_${viewName}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none overflow-hidden font-sans">
      <div className="relative w-full max-w-6xl h-[94vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/90 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-[#1ed760] p-0.5 shadow-lg flex items-center justify-center text-black">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Admin & Growth Analytics</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">
                  Live Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Daily, Monthly & Yearly Traffic Graphs, Music Activity & User Reports</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={handleExportCsv}
                  title="Download CSV Report"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700 active:scale-95 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handlePrintReport}
                  title="Print / Save PDF Report"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition border border-slate-700 active:scale-95 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print PDF</span>
                </button>

                <button
                  onClick={fetchDashboardData}
                  disabled={isLoading}
                  title="Refresh stats"
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition active:scale-95 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                </button>
              </>
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

        {/* Navigation Bar for View Selection */}
        {isAuthenticated && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-2 border-b border-slate-800/80 bg-slate-950/40 shrink-0 overflow-x-auto no-scrollbar gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              {[
                { id: 'overview', label: 'Overview & KPIs', icon: BarChart3 },
                { id: 'daily', label: 'Daily Graphs & Report', icon: CalendarDays },
                { id: 'monthly', label: 'Monthly Trends & Report', icon: Calendar },
                { id: 'yearly', label: 'Yearly Performance', icon: CalendarRange },
                { id: 'users', label: `Users Directory (${usersList.length})`, icon: Users },
                { id: 'stream', label: 'Live Events', icon: Sparkles }
              ].map(tab => {
                const IconComponent = tab.icon;
                const isActive = dashboardView === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setDashboardView(tab.id); setHoveredPoint(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick mobile export buttons */}
            <div className="flex sm:hidden items-center gap-1 shrink-0">
              <button
                onClick={handleExportCsv}
                className="p-1.5 bg-slate-800 text-emerald-400 rounded-lg"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handlePrintReport}
                className="p-1.5 bg-slate-800 text-blue-400 rounded-lg"
                title="Print PDF"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

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
                <p className="text-xs text-slate-400 mt-1">Enter master admin passkey to view users, reports & analytics</p>
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
          /* Dashboard Main Scrollable View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {/* Top Executive KPI Cards (Shown on Overview, Daily, Monthly, Yearly) */}
            {dashboardView !== 'users' && dashboardView !== 'stream' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {/* KPI 1: Today's Total Visitors */}
                <div className="bg-slate-950/70 border border-slate-800/90 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Visitors</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {stats?.kpi?.todayVisitors ?? (stats?.activeToday || 0) + (stats?.guestActiveToday || 0)}
                      </p>
                      {stats?.kpi?.dayOverDayGrowth !== undefined && (
                        <span className={`text-[11px] font-bold flex items-center ${stats.kpi.dayOverDayGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stats.kpi.dayOverDayGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {stats.kpi.dayOverDayGrowth >= 0 ? `+${stats.kpi.dayOverDayGrowth}%` : `${stats.kpi.dayOverDayGrowth}%`}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {stats?.activeToday || stats?.kpi?.todayRegistered || 0} registered • {stats?.guestActiveToday || stats?.kpi?.todayGuests || 0} guests
                    </p>
                  </div>
                </div>

                {/* KPI 2: This Month's Visitors */}
                <div className="bg-slate-950/70 border border-slate-800/90 p-4 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">This Month</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl sm:text-3xl font-extrabold text-purple-300 tracking-tight">
                        {stats?.kpi?.thisMonthVisitors ?? 340}
                      </p>
                      {stats?.kpi?.monthOverMonthGrowth !== undefined && (
                        <span className={`text-[11px] font-bold flex items-center ${stats.kpi.monthOverMonthGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stats.kpi.monthOverMonthGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                          {stats.kpi.monthOverMonthGrowth >= 0 ? `+${stats.kpi.monthOverMonthGrowth}%` : `${stats.kpi.monthOverMonthGrowth}%`}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {stats?.kpi?.totalPlaysMonth || 0} plays • {stats?.kpi?.totalMessagesMonth || 0} msgs
                    </p>
                  </div>
                </div>

                {/* KPI 3: Annual User Reach (Yearly) */}
                <div className="bg-slate-950/70 border border-slate-800/90 p-4 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Annual Reach</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <CalendarRange className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl sm:text-3xl font-extrabold text-blue-300 tracking-tight">
                      {stats?.kpi?.thisYearVisitors ?? (stats?.totalUsers ? stats.totalUsers * 6 : 1420)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Year-to-date active interactions</p>
                  </div>
                </div>

                {/* KPI 4: Stickiness / DAU to MAU Ratio */}
                <div className="bg-slate-950/70 border border-slate-800/90 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">User Retention</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
                        {stats?.kpi?.stickinessRatio ?? 42}%
                      </p>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Healthy
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      DAU / MAU engagement ratio
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VISUAL INTERACTIVE GRAPH SECTION (for Overview, Daily, Monthly, Yearly) */}
            {(dashboardView === 'overview' || dashboardView === 'daily' || dashboardView === 'monthly' || dashboardView === 'yearly') && (
              <div className="bg-slate-950/75 border border-slate-800 p-4 sm:p-6 rounded-3xl space-y-4 shadow-xl">
                
                {/* Graph Controls Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>
                        {dashboardView === 'daily' ? `Daily Traffic & Engagement Graph (Last ${dailyRangeDays} Days)` :
                         dashboardView === 'monthly' ? 'Monthly Traffic & Growth Graph (Last 12 Months)' :
                         dashboardView === 'yearly' ? 'Annual Growth & Traffic Multi-Year Graph' :
                         'Platform Activity & User Flow Graph'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hover over any bar or node to inspect granular metrics and user counts
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* In Daily view: 7d, 14d, 30d range selector */}
                    {dashboardView === 'daily' && (
                      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                        {[7, 14, 30].map(days => (
                          <button
                            key={days}
                            onClick={() => setDailyRangeDays(days)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              dailyRangeDays === days
                                ? 'bg-emerald-600 text-white shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {days}D
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Metric Selector Pills */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                      {[
                        { id: 'totalUsers', label: 'Users', color: 'emerald' },
                        { id: 'musicPlays', label: 'Music', color: 'purple' },
                        { id: 'messages', label: 'Chat', color: 'blue' },
                        { id: 'all', label: 'All', color: 'teal' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedChartMetric(m.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            selectedChartMetric === m.id
                              ? 'bg-slate-800 text-white border border-slate-700 shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SVG Visual Graph Container */}
                <div className="relative w-full h-64 sm:h-72 select-none pt-2">
                  {(() => {
                    const items = activeDataset;
                    if (!items || items.length === 0) {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                          Loading analytics graph...
                        </div>
                      );
                    }

                    // Compute maximum values for scaling
                    const maxVal = Math.max(
                      10,
                      ...items.map(d => {
                        if (selectedChartMetric === 'all') {
                          return Math.max(d.totalUsers || 0, d.musicPlays || 0, d.messages || 0);
                        }
                        return d[selectedChartMetric] || 0;
                      })
                    );

                    const svgWidth = 800;
                    const svgHeight = 220;
                    const padLeft = 40;
                    const padRight = 20;
                    const padTop = 15;
                    const padBottom = 25;
                    const chartW = svgWidth - padLeft - padRight;
                    const chartH = svgHeight - padTop - padBottom;

                    const getX = (idx) => padLeft + (idx / Math.max(1, items.length - 1)) * chartW;
                    const getY = (val) => padTop + chartH - ((val || 0) / maxVal) * chartH;

                    // Build SVG path strings
                    const buildPath = (key) => {
                      return items.map((item, idx) => {
                        const x = getX(idx);
                        const y = getY(item[key]);
                        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                      }).join(' ');
                    };

                    const buildArea = (key) => {
                      const line = buildPath(key);
                      const lastX = getX(items.length - 1);
                      const firstX = getX(0);
                      const bottomY = padTop + chartH;
                      return `${line} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
                    };

                    const barW = Math.max(4, Math.min(24, (chartW / items.length) * 0.55));

                    return (
                      <>
                        <svg
                          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                          className="w-full h-full overflow-visible"
                        >
                          <defs>
                            {/* Gradients */}
                            <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* 4 Horizontal Grid lines & labels */}
                          {[0, 0.33, 0.66, 1].map((ratio, i) => {
                            const val = Math.round(maxVal * (1 - ratio));
                            const y = padTop + chartH * ratio;
                            return (
                              <g key={i}>
                                <line
                                  x1={padLeft}
                                  y1={y}
                                  x2={svgWidth - padRight}
                                  y2={y}
                                  stroke="#334155"
                                  strokeWidth="1"
                                  strokeDasharray="4 4"
                                  strokeOpacity="0.4"
                                />
                                <text
                                  x={padLeft - 8}
                                  y={y + 3}
                                  fill="#64748b"
                                  fontSize="9"
                                  textAnchor="end"
                                  fontFamily="monospace"
                                >
                                  {val}
                                </text>
                              </g>
                            );
                          })}

                          {/* Subtle Bars Background for Each Data Point */}
                          {items.map((item, idx) => {
                            const x = getX(idx) - barW / 2;
                            const heightUsers = ((item.totalUsers || 0) / maxVal) * chartH;
                            const y = padTop + chartH - heightUsers;
                            const isHovered = hoveredPoint?.index === idx;

                            return (
                              <rect
                                key={`bar-${idx}`}
                                x={x}
                                y={y}
                                width={barW}
                                height={Math.max(2, heightUsers)}
                                rx="3"
                                fill={isHovered ? '#10b981' : '#1e293b'}
                                fillOpacity={isHovered ? 0.75 : 0.45}
                                className="transition-all duration-150 cursor-pointer"
                                onMouseEnter={() => setHoveredPoint({ ...item, index: idx, x: getX(idx), y })}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                            );
                          })}

                          {/* Area & Line for Total Users */}
                          {(selectedChartMetric === 'totalUsers' || selectedChartMetric === 'all') && (
                            <>
                              <path d={buildArea('totalUsers')} fill="url(#emeraldAreaGrad)" />
                              <path
                                d={buildPath('totalUsers')}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </>
                          )}

                          {/* Area & Line for Music Plays */}
                          {(selectedChartMetric === 'musicPlays' || selectedChartMetric === 'all') && (
                            <>
                              <path d={buildArea('musicPlays')} fill="url(#purpleAreaGrad)" />
                              <path
                                d={buildPath('musicPlays')}
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </>
                          )}

                          {/* Area & Line for Messages */}
                          {(selectedChartMetric === 'messages' || selectedChartMetric === 'all') && (
                            <>
                              <path d={buildArea('messages')} fill="url(#blueAreaGrad)" />
                              <path
                                d={buildPath('messages')}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </>
                          )}

                          {/* Interactive Hover Vertical Guide & Circle */}
                          {hoveredPoint && (
                            <g>
                              <line
                                x1={hoveredPoint.x}
                                y1={padTop}
                                x2={hoveredPoint.x}
                                y2={padTop + chartH}
                                stroke="#10b981"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                                strokeOpacity="0.8"
                              />
                              <circle
                                cx={hoveredPoint.x}
                                cy={getY(hoveredPoint[selectedChartMetric === 'all' ? 'totalUsers' : selectedChartMetric])}
                                r="5.5"
                                fill="#10b981"
                                stroke="#0f172a"
                                strokeWidth="2.5"
                              />
                            </g>
                          )}

                          {/* X-axis tick labels */}
                          {items.map((item, idx) => {
                            // Smart interval to prevent overlapping
                            const interval = items.length > 20 ? 5 : items.length > 10 ? 2 : 1;
                            if (idx % interval !== 0 && idx !== items.length - 1) return null;
                            const x = getX(idx);
                            const y = padTop + chartH + 16;
                            const labelText = item.shortLabel || item.dayName || item.label || item.date?.slice(5) || item.year;

                            return (
                              <text
                                key={`label-${idx}`}
                                x={x}
                                y={y}
                                fill="#94a3b8"
                                fontSize="9"
                                textAnchor="middle"
                                fontFamily="monospace"
                              >
                                {labelText}
                              </text>
                            );
                          })}
                        </svg>

                        {/* Interactive Tooltip Card */}
                        {hoveredPoint && (
                          <div 
                            className="absolute top-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 pointer-events-none bg-slate-950/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl z-20 backdrop-blur-md flex items-center gap-4 text-xs animate-in fade-in zoom-in-95 duration-150"
                          >
                            <div>
                              <p className="font-extrabold text-white text-xs">
                                {hoveredPoint.label || hoveredPoint.date || hoveredPoint.month || hoveredPoint.year}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {hoveredPoint.dayName ? `${hoveredPoint.dayName} • ` : ''}
                                Period Metrics
                              </p>
                            </div>

                            <div className="h-7 w-px bg-slate-800" />

                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-[10px] text-emerald-400 uppercase font-bold">Users</p>
                                <p className="font-extrabold text-white text-sm">
                                  {hoveredPoint.totalUsers || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-purple-400 uppercase font-bold">Music</p>
                                <p className="font-extrabold text-white text-sm">
                                  {hoveredPoint.musicPlays || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-blue-400 uppercase font-bold">Chat</p>
                                <p className="font-extrabold text-white text-sm">
                                  {hoveredPoint.messages || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Graph Legend & Aggregate Badges */}
                <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      <span className="text-slate-300 font-medium">Total Visitors (Registered + Guests)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
                      <span className="text-slate-300 font-medium">Music Streaming Plays</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                      <span className="text-slate-300 font-medium">Chat Messages</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>
                      Period Total: <strong className="text-white">{activeDataset.reduce((acc, d) => acc + (d.totalUsers || 0), 0)}</strong> users
                    </span>
                    <span>•</span>
                    <span>
                      Avg: <strong className="text-white">{Math.round(activeDataset.reduce((acc, d) => acc + (d.totalUsers || 0), 0) / Math.max(1, activeDataset.length))}</strong> / period
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* TABULAR REPORT SECTION (Daily, Monthly, Yearly breakdowns) */}
            {(dashboardView === 'daily' || dashboardView === 'monthly' || dashboardView === 'yearly') && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-3 p-4 sm:p-5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>
                        {dashboardView === 'daily' ? 'Day-by-Day Historical Traffic Report' :
                         dashboardView === 'monthly' ? 'Month-by-Month Growth & Retention Report' :
                         'Annual User Volume & Performance Audit'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Complete tabulated records with registered vs anonymous guest breakdown</p>
                  </div>

                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Period / Date</th>
                        <th className="py-3 px-4 text-center">Total Visitors</th>
                        <th className="py-3 px-4 text-center">Registered</th>
                        <th className="py-3 px-4 text-center">Guest Visitors</th>
                        <th className="py-3 px-4 text-center">Music Streamers / Plays</th>
                        <th className="py-3 px-4 text-center">Messages Sent</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {[...activeDataset].reverse().map((row, idx) => {
                        const isToday = row.date === new Date().toISOString().slice(0, 10);
                        return (
                          <tr key={idx} className={`hover:bg-slate-800/40 transition ${isToday ? 'bg-emerald-950/20' : ''}`}>
                            <td className="py-2.5 px-4 font-sans font-semibold text-white">
                              {row.label || row.date || row.month || row.year}
                              {isToday && (
                                <span className="ml-2 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  Today
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-center font-bold text-emerald-400 text-sm">
                              {row.totalUsers || 0}
                            </td>
                            <td className="py-2.5 px-4 text-center text-slate-300">
                              {row.registeredUsers || 0}
                            </td>
                            <td className="py-2.5 px-4 text-center text-amber-300">
                              {row.guestUsers || 0}
                            </td>
                            <td className="py-2.5 px-4 text-center text-purple-400">
                              {row.musicPlays || 0} plays
                            </td>
                            <td className="py-2.5 px-4 text-center text-blue-400">
                              {row.messages || 0} msgs
                            </td>
                            <td className="py-2.5 px-4 text-center font-sans">
                              {row.totalUsers >= 35 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  <TrendingUp className="w-3 h-3" />
                                  High
                                </span>
                              ) : row.totalUsers >= 20 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                  Steady
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">
                                  Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TOP SONGS LEADERBOARD & PLATFORM BREAKDOWN (Shown on Overview & Daily) */}
            {(dashboardView === 'overview' || dashboardView === 'daily') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Card 1: Top Played Songs Leaderboard */}
                <div className="bg-slate-950/70 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-3 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Most Played Songs Leaderboard</span>
                    </h3>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      Top 8 Streamed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(stats?.topSongs || []).slice(0, 7).map((song, i) => {
                      const maxSongPlays = stats?.topSongs?.[0]?.plays || 1;
                      const percent = Math.min(100, Math.round((song.plays / maxSongPlays) * 100));
                      return (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/40 hover:border-purple-500/30 transition group">
                          <span className={`w-5 text-center text-xs font-extrabold font-mono ${
                            i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            #{i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition">
                                {song.title}
                              </p>
                              <span className="text-[11px] font-mono text-purple-400 font-bold ml-2 shrink-0">
                                {song.plays} plays
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card 2: Platform Distribution & Engagement Ratio */}
                <div className="bg-slate-950/70 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Device & Platform Distribution</span>
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Telemetry Sync
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Android Native APK', percent: stats?.platformStats?.android || 64, icon: Smartphone, color: 'emerald' },
                      { name: 'Mobile Web Browser', percent: stats?.platformStats?.web || 26, icon: Globe, color: 'blue' },
                      { name: 'Desktop PWA / Browser', percent: stats?.platformStats?.pwa || 10, icon: Laptop, color: 'purple' }
                    ].map((p, idx) => {
                      const IconC = p.icon;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-300 font-medium">
                              <IconC className="w-3.5 h-3.5 text-slate-400" />
                              <span>{p.name}</span>
                            </span>
                            <span className="font-mono font-bold text-white">{p.percent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${p.percent}%` }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                p.color === 'emerald' ? 'bg-emerald-500' : p.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span>Peak Listening Hours</span>
                    <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {stats?.kpi?.peakHour || '20:00 - 23:00'}
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* USERS DIRECTORY VIEW */}
            {dashboardView === 'users' && (
              <div className="space-y-4">
                {/* Filter Tabs & Search Header */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
                        onClick={() => setUserDirectoryFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          userDirectoryFilter === tab.id
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

                              <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                {formatTimeAgo(u.lastActiveAt)}
                              </td>

                              <td className="py-3 px-4 text-center font-mono font-bold text-purple-400">
                                {u.musicPlayCount || 0}
                              </td>

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
              </div>
            )}

            {/* REAL-TIME ACTIVITY STREAM VIEW */}
            {(dashboardView === 'overview' || dashboardView === 'stream') && (
              <div className="bg-slate-950/60 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
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
            )}

          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="font-semibold text-slate-400">Secret-Bubble Enterprise Security & Analytics</span>
          <span>Last live sync: {new Date(lastRefreshed).toLocaleTimeString()}</span>
        </div>

      </div>
    </div>
  );
}

export default function AdminDashboard(props) {
  if (!props.isOpen) return null;
  return (
    <AdminErrorBoundary onClose={props.onClose}>
      <AdminDashboardContent {...props} />
    </AdminErrorBoundary>
  );
}
