import React from 'react';
import { X, Bot, Shield, Clock, Flame, Heart, Lock, Key, CheckCircle } from 'lucide-react';

export default function PrivacySettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) {
  if (!isOpen) return null;

  const toggleMasterAI = () => {
    onUpdateSettings({ ...settings, aiEnabled: !settings.aiEnabled });
  };

  const toggleCategory = (catKey) => {
    onUpdateSettings({
      ...settings,
      categories: {
        ...settings.categories,
        [catKey]: !settings.categories[catKey]
      }
    });
  };

  const setTimer = (seconds) => {
    onUpdateSettings({ ...settings, autoRelockSeconds: seconds });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Privacy & Security Settings</h3>
            <p className="text-xs text-slate-400">Control AI auto-locking and biometric rules</p>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          
          {/* Master AI Toggle */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${settings.aiEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-500'}`}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">AI Auto-Shield (Smart Detection)</p>
                <p className="text-xs text-slate-400">
                  {settings.aiEnabled
                    ? 'AI auto-masks sensitive chats without clicking lock'
                    : 'Disabled (Only manual lock button works)'}
                </p>
              </div>
            </div>

            <button
              onClick={toggleMasterAI}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                settings.aiEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                  settings.aiEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Category Toggles (when AI is enabled) */}
          {settings.aiEnabled && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Auto-Hide Categories
              </label>

              {/* 1. Adult & Physical Intimacy */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">Adult & Physical Intimacy (Sex / Body / Romantic talks)</span>
                    <p className="text-[11px] text-slate-400">Auto-locks sex, physical relations, intimate words</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.categories.adult_intimacy !== false}
                  onChange={() => toggleCategory('adult_intimacy')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* 2. Romance & Feelings */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">Romance & Feelings (Love, Crush, Miss you)</span>
                    <p className="text-[11px] text-slate-400">Auto-locks romantic sentiments and affection</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.categories.romance_feelings !== false}
                  onChange={() => toggleCategory('romance_feelings')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* 3. Secrets & Confidential */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">Secrets & Confidential</span>
                    <p className="text-[11px] text-slate-400">"Kisi ko mat batana", confidential statements</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.categories.secrets_confidential !== false}
                  onChange={() => toggleCategory('secrets_confidential')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* 4. Financial & Passwords */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-white">Passwords, PIN & Financial</span>
                    <p className="text-[11px] text-slate-400">Auto-locks OTPs, passwords, bank cards</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.categories.financial_credentials !== false}
                  onChange={() => toggleCategory('financial_credentials')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Auto-Relock Timer Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Auto-Relock Timeout
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 30].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setTimer(sec)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    settings.autoRelockSeconds === sec
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec} Seconds
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Revealed messages will automatically hide again after this timer expires.
            </p>
          </div>

        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-2xl text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Save & Apply Settings
        </button>

      </div>
    </div>
  );
}