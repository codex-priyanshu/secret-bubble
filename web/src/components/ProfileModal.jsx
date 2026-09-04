import React, { useState, useRef } from 'react';
import { X, Camera, User, Check, Sparkles, Upload } from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Mia',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sam'
];

export default function ProfileModal({ isOpen, onClose, currentUser, onUpdateProfile, backendUrl }) {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Edit Profile & DP</h3>
        <p className="text-xs text-slate-400 mb-5">Change your avatar photo and display name</p>

        <form onSubmit={handleSave} className="space-y-4">
          
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
                <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentUser.avatarColor || 'from-purple-600 to-indigo-500'} flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-slate-700`}>
                  {name.charAt(0) || currentUser.name.charAt(0)}
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
              className="mt-2 text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
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
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
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

      </div>
    </div>
  );
}