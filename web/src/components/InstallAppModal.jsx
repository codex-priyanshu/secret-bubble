import React, { useState, useEffect } from 'react';
import { Download, X, Shield, Music, Sparkles, CheckCircle2, Share, PlusSquare, Smartphone, ArrowRight, ExternalLink } from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (onClose) onClose();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [onClose]);

  if (!isOpen || isInstalled) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          onClose();
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for Android/Chrome when beforeinstallprompt is pending or not supported
      setShowIOSGuide(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none font-sans">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Neon Ambient Background Glows */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4 pt-1">
          
          {/* Copyright-free Music & Chat App Logo */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 opacity-70 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-950 shadow-2xl flex items-center justify-center">
              <img
                src="/app-logo.png"
                alt="App Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-lg">
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* App Title & Tagline */}
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-wide uppercase mb-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Official Fast Web App</span>
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Secret-Bubble App
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Music Player Camouflage • Private E2EE Vault
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 space-y-2 text-left text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <div className="p-1 rounded-lg bg-purple-600/20 text-purple-400 shrink-0">
                <Music className="w-3.5 h-3.5" />
              </div>
              <span><strong>Full Offline & Background Music</strong> (Screen off par bhi chalega)</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <div className="p-1 rounded-lg bg-cyan-600/20 text-cyan-400 shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span><strong>Zero-Trace Secret Chat</strong> (Stealth disguise & PIN lock)</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <div className="p-1 rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span><strong>Direct 1-Tap Install</strong> (Fast, Free & uses under 2MB)</span>
            </div>
          </div>

          {/* iOS / Manual Guide Step Box if clicked */}
          {showIOSGuide && (
            <div className="w-full bg-purple-950/40 border border-purple-500/30 rounded-2xl p-3 text-left text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
              <p className="font-bold text-purple-300 flex items-center gap-1.5 text-[11px]">
                <Smartphone className="w-4 h-4" />
                <span>How to Install on your Phone:</span>
              </p>
              {isIOS ? (
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Tap the <strong>Share</strong> button <Share className="w-3 h-3 inline text-cyan-400 mx-0.5" /> in Safari browser.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline text-purple-400 mx-0.5" />.</li>
                  <li>Tap <strong>Add</strong> at top-right to download.</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>Tap the <strong>Menu (3 dots ⋮)</strong> in your browser.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>App icon will appear on your phone home screen!</li>
                </ol>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download / Install App (डाउनलोड करें)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              Continue in Browser (ब्राउज़र में चलाएं)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
