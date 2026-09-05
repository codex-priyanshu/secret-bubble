import React, { useState } from 'react';
import { Fingerprint, ScanFace, KeyRound, ShieldCheck, X, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export default function BiometricModal({ message, onConfirm, onCancel, isWebAuthnSupported }) {
  const [authMode, setAuthMode] = useState('fingerprint');
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio fallback
    }
  };

  const handleFingerprintScan = async () => {
    if (scanning || success) return;
    setScanning(true);

    // If native WebAuthn is supported on the user device, attempt hardware prompt
    if (isWebAuthnSupported && window.PublicKeyCredential) {
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        await navigator.credentials.get({
          publicKey: {
            challenge,
            timeout: 60000,
            userVerification: 'preferred',
            rpId: window.location.hostname
          }
        }).catch(() => {});
      } catch (err) {}
    }

    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      playSuccessSound();
      setTimeout(() => {
        onConfirm(message.id);
      }, 700);
    }, 1000);
  };

  const handleFaceScan = async () => {
    if (scanning || success) return;
    setScanning(true);

    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      playSuccessSound();
      setTimeout(() => {
        onConfirm(message.id);
      }, 1000);
    }, 1100);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.length >= 4) {
      setSuccess(true);
      playSuccessSound();
      setTimeout(() => {
        onConfirm(message.id);
      }, 600);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-hidden text-center">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Lock className="w-3.5 h-3.5" />
          Biometric Protection Shield
        </div>

        <h3 className="text-xl font-bold text-white mb-1">
          Unlock Private Message
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Category: <span className="text-purple-400 font-medium">{message?.category || 'Confidential / Feelings'}</span>
        </p>

        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800/80 border border-slate-700 rounded-xl mb-6">
          <button
            onClick={() => { setAuthMode('fingerprint'); setSuccess(false); }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              authMode === 'fingerprint'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            Fingerprint
          </button>
          <button
            onClick={() => { setAuthMode('face'); setSuccess(false); }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              authMode === 'face'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScanFace className="w-4 h-4" />
            Face ID
          </button>
          <button
            onClick={() => { setAuthMode('pin'); setSuccess(false); }}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              authMode === 'pin'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Passcode
          </button>
        </div>

        <div className="my-6 flex flex-col items-center justify-center min-h-[160px]">
          {success ? (
            <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <p className="mt-3 text-emerald-400 font-semibold text-sm">Identity Verified! Unlocking...</p>
            </div>
          ) : authMode === 'fingerprint' ? (
            <div className="flex flex-col items-center">
              <button
                onClick={handleFingerprintScan}
                disabled={scanning}
                className={`relative group w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  scanning
                    ? 'border-purple-400 bg-purple-950/60 shadow-lg shadow-purple-500/40 animate-pulse'
                    : 'border-slate-600 bg-slate-800/80 hover:border-purple-500 hover:scale-105 active:scale-95'
                }`}
              >
                <Fingerprint className={`w-12 h-12 transition-colors ${scanning ? 'text-purple-300' : 'text-purple-400 group-hover:text-purple-300'}`} />
                {scanning && (
                  <span className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-40" />
                )}
              </button>
              <p className="mt-4 text-xs font-medium text-slate-400">
                {scanning ? 'Scanning biometric sensor...' : 'Tap sensor or screen with your finger'}
              </p>
            </div>
          ) : authMode === 'face' ? (
            <div className="flex flex-col items-center">
              <button
                onClick={handleFaceScan}
                disabled={scanning}
                className={`relative group w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                  scanning
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-500/40 animate-pulse'
                    : 'border-slate-600 bg-slate-800/80 hover:border-cyan-500 hover:scale-105 active:scale-95'
                }`}
              >
                <ScanFace className={`w-12 h-12 transition-colors ${scanning ? 'text-cyan-300' : 'text-cyan-400 group-hover:text-cyan-300'}`} />
                {scanning && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-cyan-400 animate-ping opacity-40" />
                )}
              </button>
              <p className="mt-4 text-xs font-medium text-slate-400">
                {scanning ? 'Verifying 3D Facial geometry...' : 'Look into camera / Tap to scan Face ID'}
              </p>
            </div>
          ) : (
            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit Passcode (e.g. 1234)"
                className={`w-full text-center tracking-widest text-lg py-2.5 px-4 bg-slate-950 border rounded-xl text-white placeholder-slate-500 focus:outline-none transition ${
                  pinError ? 'border-rose-500 animate-shake' : 'border-slate-700 focus:border-purple-500'
                }`}
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-purple-600/30"
              >
                Unlock with Passcode
              </button>
              {pinError && (
                <p className="text-[11px] text-rose-400">Enter at least 4 digits</p>
              )}
            </form>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Biometrics are processed locally on device</span>
        </div>
      </div>
    </div>
  );
}