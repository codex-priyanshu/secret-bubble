import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Disc, Sliders, Music, Radio, 
  Sparkles, Shield, X, Lock, Check 
} from 'lucide-react';

const TRACKS = [
  {
    title: "Midnight Memories (Lo-Fi Chill)",
    artist: "Aura & Chillhop Beats",
    album: "Focus & Serenity Vol. 4",
    duration: 218, // 3:38
    color: "from-purple-900/40 via-indigo-950/60 to-slate-950",
    accent: "text-purple-400"
  },
  {
    title: "Rainy Cafe Dreams",
    artist: "Komorebi Lofi",
    album: "Coffee & Rain Sounds",
    duration: 194, // 3:14
    color: "from-teal-900/40 via-slate-950 to-slate-950",
    accent: "text-teal-400"
  },
  {
    title: "Stargazing at 3 AM",
    artist: "Lunar Echoes",
    album: "Deep Sleep & Study 432Hz",
    duration: 245, // 4:05
    color: "from-rose-950/40 via-slate-950 to-slate-950",
    accent: "text-rose-400"
  }
];

export default function StealthMusicPlayer({
  onUnlock,
  secretPin = '1234',
  decoyPin = '9999'
}) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(42);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(80);
  
  // Secret unlock state
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [heartTapCount, setHeartTapCount] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Synthesizer / Ambient generator with Web Audio API (real soothing ambient audio)
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // Simulated song progression
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            // Next track
            setCurrentTrackIndex(i => (i + 1) % TRACKS.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack.duration]);

  // Optional real soothing ambient hum using Web Audio API
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gainNodeRef.current = gain;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(108, ctx.currentTime); // Relaxing warm sub-bass hum
      gain.gain.setValueAtTime(isPlaying && !isMuted ? 0.015 : 0.0001, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      return () => {
        try {
          osc.stop();
          ctx.close();
        } catch {}
      };
    } catch {}
  }, []);

  // Update ambient volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = isPlaying && !isMuted ? (volume / 100) * 0.025 : 0.00001;
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.2);
    }
  }, [isPlaying, isMuted, volume]);

  const togglePlay = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsPlaying(p => !p);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex(i => (i + 1) % TRACKS.length);
    setCurrentTime(0);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex(i => (i - 1 + TRACKS.length) % TRACKS.length);
    setCurrentTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Secret Unlock Trigger 1: Triple-tap on Vinyl / Album Art
  const handleCoverTap = () => {
    const now = Date.now();
    if (now - lastTapTime < 500) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 3) {
        // Unlock Vault!
        if (onUnlock) onUnlock(false);
      }
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);
  };

  // Secret Unlock Trigger 2: Tapping Heart 3 times in quick succession
  const handleHeartClick = () => {
    setIsLiked(l => !l);
    setHeartTapCount(c => {
      const next = c + 1;
      if (next >= 3) {
        if (onUnlock) onUnlock(false);
        return 0;
      }
      return next;
    });
    setTimeout(() => setHeartTapCount(0), 1000);
  };

  // Secret Unlock Trigger 3: Clicking Equalizer / Sliders opens "Equalizer Preset" (Code Dialog)
  const handleEqualizerClick = () => {
    setShowCodeModal(true);
    setInputCode('');
    setCodeError('');
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (clean === secretPin) {
      if (onUnlock) onUnlock(false);
    } else if (clean === decoyPin) {
      if (onUnlock) onUnlock(true); // Decoy mode
    } else {
      setCodeError('Preset profile not found. Applying standard EQ.');
      setTimeout(() => {
        setShowCodeModal(false);
      }, 1200);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b ${currentTrack.color} text-slate-100 select-none p-5 sm:p-8 font-sans overflow-hidden transition-colors duration-700`}>
      
      {/* Top Bar: Looks 100% like Spotify / Apple Music */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 tracking-wider uppercase">
          <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>Lo-Fi Radio • Live Stream</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleEqualizerClick}
            title="Audio Equalizer"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
          >
            <Sliders className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowHelpModal(true)}
            title="Info"
            className="text-[11px] text-slate-500 hover:text-slate-300 underline transition"
          >
            Help
          </button>
        </div>
      </div>

      {/* Center: Vinyl Disc & Album Art Cover */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-md mx-auto">
        <div 
          onClick={handleCoverTap}
          className="relative group cursor-pointer"
          title="Lo-Fi Vibes"
        >
          {/* Animated Vinyl Disc peeking out */}
          <div className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-neutral-950 border-4 border-neutral-900 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-500 ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}>
            
            {/* Vinyl grooves styling */}
            <div className="absolute inset-3 rounded-full border border-neutral-800/80 pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-neutral-800/60 pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-neutral-800/40 pointer-events-none" />
            <div className="absolute inset-20 rounded-full border border-neutral-800/40 pointer-events-none" />

            {/* Vinyl Center Art */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-1 shadow-inner flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-neutral-950 border-2 border-neutral-800 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
              </div>
            </div>
          </div>

          {/* Equalizer Live Visualizer Waveform at the bottom of artwork */}
          {isPlaying && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
              <div className="w-1 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-7 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <div className="w-1 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
              <div className="w-1 h-6 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>

        {/* Track Title & Artist */}
        <div className="w-full flex items-center justify-between mt-8 px-2">
          <div className="min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {currentTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate">
              {currentTrack.artist} • <span className="text-slate-500">{currentTrack.album}</span>
            </p>
          </div>

          <button
            onClick={handleHeartClick}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-full transition active:scale-125"
            title="Save to Favorites"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-md mx-auto space-y-4 pb-4">
        
        {/* Progress Bar & Timestamps */}
        <div className="space-y-1">
          <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        {/* Playback Controls (Previous, Play/Pause, Next) */}
        <div className="flex items-center justify-between px-2">
          
          <button
            onClick={() => setIsShuffle(s => !s)}
            className={`p-2 rounded-full transition ${
              isShuffle ? 'text-purple-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevTrack}
              className="p-2 text-slate-300 hover:text-white transition active:scale-90"
              title="Previous Track"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={handleNextTrack}
              className="p-2 text-slate-300 hover:text-white transition active:scale-90"
              title="Next Track"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          <button
            onClick={() => setIsRepeat(r => !r)}
            className={`p-2 rounded-full transition ${
              isRepeat ? 'text-purple-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>

        </div>

        {/* Volume Slider Bar */}
        <div className="flex items-center gap-3 px-3 pt-2 text-slate-400">
          <button 
            onClick={() => setIsMuted(m => !m)}
            className="hover:text-white transition"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseInt(e.target.value, 10));
              if (isMuted) setIsMuted(false);
            }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

      </div>

      {/* Secret Code Dialog (Disguised as Audio Equalizer Preset) */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs tracking-wider uppercase">
                <Sliders className="w-4 h-4" />
                <span>EQ Sound Profile</span>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Enter customized acoustic preset code or studio key:
            </p>

            <form onSubmit={handleCodeSubmit} className="space-y-3">
              <input
                type="password"
                value={inputCode}
                onChange={(e) => { setInputCode(e.target.value); setCodeError(''); }}
                placeholder="Enter preset code..."
                autoFocus
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white font-mono text-center tracking-widest focus:outline-none"
              />

              {codeError && (
                <p className="text-[11px] text-amber-400 text-center font-medium animate-shake">
                  {codeError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/30"
                >
                  Apply EQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Camouflage Help Guide */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Music className="w-4 h-4" />
              <span>Lo-Fi Music Camouflage</span>
            </div>
            
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>This screen is a complete disguise player to protect your chat privacy from bystanders.</p>
              
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                <p className="text-purple-300">⚡ <strong>Quick Unlock:</strong></p>
                <p>• <strong>Triple-tap</strong> the rotating Vinyl Disc</p>
                <p>• Or tap the <strong>Heart ❤️</strong> icon 3 times</p>
                <p>• Or tap <strong>EQ icon</strong> and enter PIN <span className="text-amber-400">{secretPin}</span></p>
                <p className="text-cyan-300 pt-1">• <strong>Decoy Mode:</strong> EQ PIN <span className="text-cyan-400">{decoyPin}</span></p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-white transition"
            >
              Close & Enjoy Music
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
