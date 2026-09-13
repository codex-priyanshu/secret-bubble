import React, { useState, useRef } from 'react';
import { X, Camera, User, Check, Sparkles, Upload, Lock, KeyRound, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Mia',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sam'
];

export default function ProfileModal({ isOpen, onClose, currentUser, onUpdateProfile, backendUrl }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

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

    try {
      const token = localStorage.getItem('secure_chat_token');
      const res = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: currentUser.id,
          name: name.trim(),
          avatarUrl: avatarUrl || null
        })
      });

      const data = await res.json();
      if (data.success) {
        onUpdateProfile(data.user);
        onClose();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      alert('Error saving profile');
    } finally {
      setLoading(false);
    }
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
      setPassError('New passwords do not match. Please re-enter identical password.');
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
          userId: currentUser.id,
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setPassSuccess('✅ Password successfully updated! Your account is secured.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher: Profile vs Password Security */}
        <div className="flex p-1 bg-slate-950/80 rounded-2xl mb-4 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Profile & DP
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('security'); setPassError(''); setPassSuccess(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Set Password
          </button>
        </div>

        {activeTab === 'profile' ? (
          /* TAB 1: PROFILE & DP */
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="text-center mb-1">
              <h3 className="text-base font-bold text-white">Edit Profile & DP</h3>
              <p className="text-xs text-slate-400">Manage your avatar and display name</p>
            </div>

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
              <label className="block text-xs font-semibold text-slate-400 mb-2 text-center">
                Or pick an animated avatar:
              </label>
              <div className="flex justify-center gap-2">
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

            {/* Name Field */}
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

            <div className="text-[11px] text-slate-400 font-mono bg-slate-950/60 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
              <span>Username:</span>
              <strong className="text-purple-300">@{currentUser?.username}</strong>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </form>
        ) : (
          /* TAB 2: SET / CHANGE ACCOUNT PASSWORD */
          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div className="text-center mb-1">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <span>Account Password Security</span>
              </h3>
              <p className="text-xs text-slate-400">Set or change your login password</p>
            </div>

            {passError && (
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{passSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPassError(''); }}
                  placeholder="Enter current account password"
                  className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPassError(''); }}
                  placeholder="Enter new password (min 4 chars)"
                  className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => { setConfirmNewPassword(e.target.value); setPassError(''); }}
                  placeholder="Re-type identical new password"
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {passLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Account Password</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}