import React, { useState } from 'react';
import { Shield, Lock, User, UserPlus, LogIn, Sparkles, CheckCircle2, ArrowRight, Smartphone, Globe, Key } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, backendUrl }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick Demo Accounts for instant 1-click test
  const demoAccounts = [
    { username: 'aman', name: 'Aman', color: 'from-blue-600 to-cyan-500' },
    { username: 'rohan', name: 'Rohan', color: 'from-purple-600 to-pink-500' },
    { username: 'priya', name: 'Priya', color: 'from-rose-600 to-amber-500' }
  ];

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in both username and password.');
      return;
    }

    setLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { username: username.trim(), name: name.trim() || username.trim(), password }
      : { username: username.trim(), password };

    try {
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save to localStorage & notify parent
      localStorage.setItem('secure_chat_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Network error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoUser) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: demoUser.username, password: '123456' })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('secure_chat_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        // If demo user wasn't registered yet, register them
        const regRes = await fetch(`${backendUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: demoUser.username, name: demoUser.name, password: '123456' })
        });
        const regData = await regRes.json();
        if (regData.success) {
          localStorage.setItem('secure_chat_user', JSON.stringify(regData.user));
          onLoginSuccess(regData.user);
        } else {
          setError(regData.message);
        }
      }
    } catch (err) {
      setError('Failed to login. Please make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30 mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">SecureChat</h1>
          <p className="text-xs text-slate-400 mt-1">
            Biometric Shield & AI Privacy Messaging • <span className="text-emerald-400 font-semibold">No OTP Required</span>
          </p>
        </div>

        {/* Quick 1-Click Demo Profiles */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Instant Login (Demo Users):
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin(acc)}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-purple-950/60 border border-slate-700/80 hover:border-purple-500 text-center transition group shadow-sm flex flex-col items-center"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${acc.color} flex items-center justify-center text-white text-xs font-bold mb-1 shadow-md group-hover:scale-105 transition`}>
                  {acc.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                  {acc.name}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Aap aur aapka dost alag-alag phone/laptop par 1-click se login kar sakte hain!
          </p>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="flex p-1 bg-slate-800/90 rounded-xl mb-4 border border-slate-700">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              !isRegister ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              isRegister ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Account (No OTP)
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Your Display Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aman Sharma"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. aman123"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. 123456)"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Create Account & Enter Chat' : 'Login Instantly'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time Remote Chat • No OTP / No Phone number required</span>
        </div>

      </div>
    </div>
  );
}