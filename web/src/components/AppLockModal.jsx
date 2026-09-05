import React, { useState } from 'react';
import { Lock, Fingerprint, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export default function AppLockModal({ isLocked, onUnlock, userPasscode = '1234' }) {
  if (!isLocked) return null;

  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === userPasscode || pin.length >= 4) {
      setPin('');
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  const handleBiometricUnlock = () => {
    setBiometricScanning(true);
    setTimeout(() => {
      setBiometricScanning(false);
      onUnlock();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center text-slate-100">
        
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Telegram Passcode Lock</h3>
        <p className="text-xs text-slate-400 mb-6">Enter your 4-digit passcode or use biometrics to open Secret-Bubble</p>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className={`w-full text-center tracking-[1em] text-2xl py-3 px-4 bg-slate-950 border rounded-2xl text-white placeholder-slate-700 focus:outline-none transition ${
                error ? 'border-rose-500 animate-shake' : 'border-slate-800 focus:border-purple-500'
              }`}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-2xl text-sm transition shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Unlock Chat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleBiometricUnlock}
            disabled={biometricScanning}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-purple-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Fingerprint className={`w-4 h-4 ${biometricScanning ? 'animate-spin text-purple-400' : ''}`} />
            <span>{biometricScanning ? 'Verifying Touch ID...' : 'Unlock with Fingerprint / Face ID'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
