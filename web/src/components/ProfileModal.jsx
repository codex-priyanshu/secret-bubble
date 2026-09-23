import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Camera, User, Check, Upload, Lock, KeyRound, Eye, EyeOff, 
  AlertCircle, ShieldCheck, Music2, MessageSquare, Heart, Shield, 
  Sparkles, RefreshCw, Trash2, Calendar, Radio
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Mia',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sam',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber'
];

export default function ProfileModal({ isOpen, onClose, currentUser, onUpdateProfile, backendUrl }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'stats' | 'security'
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Stealth PIN controls
  const [stealthPin, setStealthPin] = useState(() => {
    return localStorage.getItem('secret_bubble_secret_pin') || '1234';
  });
  const [decoyPin, setDecoyPin] = useState(() => {
    return localStorage.getItem('secret_bubble_decoy_pin') || '9999';
  });
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Stats Counters
  const [stats, setStats] = useState({
    musicPlays: 0,
    likedSongs: 0,
    playlists: 0,
    messagesCount: 0
  });

  useEffect(() => {
    try {
      const musicPlays = parseInt(localStorage.getItem('secret_bubble_music_play_count') || '0', 10) || (currentUser?.musicPlayCount || 0);
      const liked = JSON.parse(localStorage.getItem('secret_bubble_liked_song_ids') || '[]').length;
      const playlists = JSON.parse(localStorage.getItem('secret_bubble_user_playlists') || '[]').length;
      const messagesCount = currentUser?.messageCount || 0;
      setStats({ musicPlays, likedSongs: liked, playlists, messagesCount });
    } catch {}
  }, [currentUser]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileSuccess('');

    try {
      const token = localStorage.getItem('secure_chat_token');
      const res = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          name: name.trim(),
          avatarUrl: avatarUrl || null
        })
      });

      const data = await res.json();
      if (data.success) {
        onUpdateProfile(data.user);
        setProfileSuccess('Profile updated successfully!');
        setTimeout(() => setProfileSuccess(''), 3000);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      // Local fallback if offline
      const updatedLocal = { ...currentUser, name: name.trim(), avatarUrl: avatarUrl || null };
      onUpdateProfile(updatedLocal);
      setProfileSuccess('Profile saved locally (Offline mode)');
      setTimeout(() => setProfileSuccess(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePins = (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (!/^\d{4,6}$/.test(stealthPin)) {
      setPinError('Secret PIN must be 4 to 6 digits.');
      return;
    }
    if (!/^\d{4,6}$/.test(decoyPin)) {
      setPinError('Decoy PIN must be 4 to 6 digits.');
      return;
    }
    if (stealthPin === decoyPin) {
      setPinError('Secret PIN and Decoy PIN cannot be the same!');
      return;
    }

    localStorage.setItem('secret_bubble_secret_pin', stealthPin);
    localStorage.setItem('secret_bubble_decoy_pin', decoyPin);
    localStorage.setItem('secret_bubble_pins_configured', 'true');
    setPinSuccess('Secret & Decoy PINs updated successfully!');
    setTimeout(() => setPinSuccess(''), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword.trim()) {
      setPassError('Please enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      setPassError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 4) {
      setPassError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match. Please re-enter.');
      return;
    }

    setPassLoading(true);

    try {
      const token = localStorage.getItem('secure_chat_token');
      const res = await fetch(`${backendUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setPassSuccess('Password successfully updated! Your account is secured.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        if (data.token) {
          localStorage.setItem('secure_chat_token', data.token);
        }
      } else {
        setPassError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPassError('Server connection error. Please try again.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear local media and offline temporary cache? Your account and login will remain intact.')) {
      try {
        localStorage.removeItem('secret_bubble_cache_room_global');
        sessionStorage.removeItem('secret_bubble_session_unlocked');
        alert('Cache cleared successfully!');
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">Account & Profile Settings</h2>
            <p className="text-xs text-slate-400">Manage display name, stealth PINs, and personal statistics</p>
          </div>
        </div>

        {/* Tab Switcher: Profile vs Stats vs Controls */}
        <div className="flex p-1 bg-slate-950/80 rounded-2xl mb-4 border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activity</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('security'); setPassError(''); setPassSuccess(''); setPinError(''); setPinSuccess(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Controls</span>
          </button>
        </div>

        {/* TAB 1: PROFILE & DP */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {profileSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {/* Avatar Preview & Upload Trigger */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="DP"
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentUser?.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-slate-700`}>
                    {(name.charAt(0) || currentUser?.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo from Device
              </button>
            </div>

            {/* Preset Avatars Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 text-center">
                Or choose an animated avatar:
              </label>
              <div className="flex justify-center gap-2 flex-wrap">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                      avatarUrl === url ? 'border-purple-500 scale-110 shadow-md shadow-purple-500/30' : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Read-Only Account Details */}
            <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Unique Username:</span>
                <strong className="text-purple-300 font-mono">@{currentUser?.username || 'user'}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>User ID:</span>
                <span className="text-slate-300 font-mono text-[11px]">{currentUser?.id?.slice(0, 16) || 'local'}...</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member Since:</span>
                </span>
                <span className="text-slate-300">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active Member'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: ACTIVITY & STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-3 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl border border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="text-xs font-bold text-white block">Current Session: Online</span>
                  <span className="text-[11px] text-slate-400">End-to-End Encrypted Session Active</span>
                </div>
              </div>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Songs Listened</span>
                  <Music2 className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-2xl font-black text-white">{stats.musicPlays}</span>
                <span className="text-[10px] text-slate-500 mt-1">Tracks streamed via stealth player</span>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Messages Sent</span>
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-2xl font-black text-white">{stats.messagesCount}</span>
                <span className="text-[10px] text-slate-500 mt-1">Encrypted messages dispatched</span>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Liked Songs</span>
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-500/20" />
                </div>
                <span className="text-2xl font-black text-white">{stats.likedSongs}</span>
                <span className="text-[10px] text-slate-500 mt-1">Saved to personal favorites</span>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">Custom Playlists</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-2xl font-black text-white">{stats.playlists}</span>
                <span className="text-[10px] text-slate-500 mt-1">Created in Music Studio</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTROLS, PINS & SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Section A: Stealth Disguise PIN Configuration */}
            <form onSubmit={handleSavePins} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-slate-800/80 pb-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Stealth Disguise PINs</span>
              </div>

              {pinSuccess && (
                <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pinSuccess}</span>
                </div>
              )}
              {pinError && (
                <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Secret PIN (Real Chat)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={stealthPin}
                    onChange={(e) => setStealthPin(e.target.value)}
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono tracking-widest text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Decoy PIN (Fake Screen)</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={decoyPin}
                    onChange={(e) => setDecoyPin(e.target.value)}
                    placeholder="e.g. 9999"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono tracking-widest text-center"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Enter your Secret PIN in the Music Player search bar or key icon to unlock your encrypted messages.
              </p>

              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Stealth PINs</span>
              </button>
            </form>

            {/* Section B: Account Password */}
            <form onSubmit={handleChangePassword} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-slate-800/80 pb-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>Change Account Password</span>
              </div>

              {passError && (
                <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setPassError(''); }}
                    placeholder="Current password"
                    className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPassError(''); }}
                    placeholder="New password (min 4 chars)"
                    className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => { setConfirmNewPassword(e.target.value); setPassError(''); }}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {passLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Update Account Password</span>
                  </>
                )}
              </button>
            </form>

            {/* Section C: Clear Cache / Storage Clean */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">Offline Storage & Cache</span>
                <span className="text-[10px] text-slate-400">Purge local temporary cached media</span>
              </div>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}