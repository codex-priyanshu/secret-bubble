import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Disc, Sliders, Music, Radio, 
  Sparkles, Shield, X, Lock, Check, FolderPlus, List, 
  Trash2, HardDrive, Smartphone, Music2, Plus
} from 'lucide-react';

const INITIAL_DEMO_TRACKS = [
  {
    id: 'demo-1',
    title: "Midnight Memories (Lo-Fi Chill)",
    artist: "Aura & Chillhop Beats",
    album: "Focus & Serenity Vol. 4",
    duration: 218, // 3:38
    isLocal: false,
    url: null,
    color: "from-purple-900/40 via-indigo-950/60 to-slate-950",
    accent: "text-purple-400"
  },
  {
    id: 'demo-2',
    title: "Rainy Cafe Dreams",
    artist: "Komorebi Lofi",
    album: "Coffee & Rain Sounds",
    duration: 194, // 3:14
    isLocal: false,
    url: null,
    color: "from-teal-900/40 via-slate-950 to-slate-950",
    accent: "text-teal-400"
  },
  {
    id: 'demo-3',
    title: "Stargazing at 3 AM",
    artist: "Lunar Echoes",
    album: "Deep Sleep & Study 432Hz",
    duration: 245, // 4:05
    isLocal: false,
    url: null,
    color: "from-rose-950/40 via-slate-950 to-slate-950",
    accent: "text-rose-400"
  }
];

export default function StealthMusicPlayer({
  onUnlock,
  secretPin = '1234',
  decoyPin = '9999'
}) {
  const [tracks, setTracks] = useState(INITIAL_DEMO_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(218);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(85);
  const [showPlaylist, setShowPlaylist] = useState(false);

  // Secret unlock state
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [heartTapCount, setHeartTapCount] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Audio elements
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const synthCtxRef = useRef(null);
  const synthIntervalRef = useRef(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Update track duration when switching
  useEffect(() => {
    setCurrentTime(0);
    if (currentTrack.isLocal && currentTrack.duration > 0) {
      setDuration(currentTrack.duration);
    } else {
      setDuration(currentTrack.duration || 180);
    }
  }, [currentTrackIndex, currentTrack]);

  // Handle Real Audio Playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack.isLocal && currentTrack.url) {
      audio.src = currentTrack.url;
      audio.volume = isMuted ? 0 : volume / 100;
      if (isPlaying) {
        audio.play().catch(err => console.log('Playback error:', err));
      } else {
        audio.pause();
      }
      stopSynthAudio();
    } else {
      // Demo Track: Use Web Audio API synthesizer so real audio comes out of speakers
      audio.pause();
      if (isPlaying && !isMuted) {
        startSynthAudio();
      } else {
        stopSynthAudio();
      }
    }
  }, [currentTrack, isPlaying, isMuted]);

  // Update Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Web Audio API Synthesizer (Generates warm, gentle lofi chords for demo tracks)
  const startSynthAudio = () => {
    try {
      if (synthIntervalRef.current) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!synthCtxRef.current) {
        synthCtxRef.current = new AudioCtx();
      }
      const ctx = synthCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const chords = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00]  // G7
      ];
      let chordIndex = 0;

      const playChord = () => {
        if (!synthCtxRef.current) return;
        const currentChord = chords[chordIndex % chords.length];
        chordIndex++;

        currentChord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const now = ctx.currentTime + (i * 0.08);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime((volume / 100) * 0.025, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.00001, now + 2.8);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 2.9);
        });
      };

      playChord();
      synthIntervalRef.current = setInterval(playChord, 3000);
    } catch (e) {}
  };

  const stopSynthAudio = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSynthAudio();
      if (synthCtxRef.current) {
        try { synthCtxRef.current.close(); } catch {}
      }
    };
  }, []);

  // Time progression for simulated or local audio
  const handleTimeUpdate = () => {
    if (audioRef.current && currentTrack.isLocal) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && currentTrack.isLocal) {
      const dur = Math.floor(audioRef.current.duration);
      if (dur > 0) {
        setDuration(dur);
        setTracks(prev => prev.map((t, idx) => idx === currentTrackIndex ? { ...t, duration: dur } : t));
      }
    }
  };

  const handleTrackEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNextTrack();
    }
  };

  // Fallback progression timer for demo tracks
  useEffect(() => {
    let timer = null;
    if (isPlaying && !currentTrack.isLocal) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTrack.isLocal, duration]);

  const togglePlay = () => {
    if (synthCtxRef.current && synthCtxRef.current.state === 'suspended') {
      synthCtxRef.current.resume();
    }
    setIsPlaying(p => !p);
  };

  const handleNextTrack = () => {
    if (isShuffle && tracks.length > 1) {
      let nextIndex = Math.floor(Math.random() * tracks.length);
      while (nextIndex === currentTrackIndex) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      }
      setCurrentTrackIndex(nextIndex);
    } else {
      setCurrentTrackIndex(i => (i + 1) % tracks.length);
    }
    setCurrentTime(0);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex(i => (i - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = Math.floor(percentage * duration);
    setCurrentTime(newTime);
    if (audioRef.current && currentTrack.isLocal) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Import Real Songs from Phone / Device
  const handleFilesSelected = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks = Array.from(files).map((file, i) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
      const url = URL.createObjectURL(file);
      return {
        id: `phone-${Date.now()}-${i}`,
        title: cleanName,
        artist: "Phone Audio (फोन स्टोरेज)",
        album: "Device Downloads",
        duration: 240, // default placeholder until metadata loads
        isLocal: true,
        file: file,
        url: url,
        color: "from-blue-900/40 via-indigo-950/60 to-slate-950",
        accent: "text-cyan-400"
      };
    });

    setTracks(prev => [...newTracks, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    setShowPlaylist(true);
  };

  const handleDeleteTrack = (id, e) => {
    e.stopPropagation();
    setTracks(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return filtered.length > 0 ? filtered : INITIAL_DEMO_TRACKS;
    });
    if (currentTrack.id === id) {
      setCurrentTrackIndex(0);
    }
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
        if (onUnlock) onUnlock(false);
      }
    } else {
      setTapCount(1);
    }
    setLastTapTime(now);
  };

  // Secret Unlock Trigger 2: Tapping Heart 3 times
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

  // Secret Unlock Trigger 3: Clicking Equalizer / Sliders opens Code Dialog
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
      setCodeError('Equalizer preset applied.');
      setTimeout(() => {
        setShowCodeModal(false);
      }, 1000);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b ${currentTrack.color || 'from-purple-900/40 via-indigo-950/60 to-slate-950'} text-slate-100 select-none p-5 sm:p-8 font-sans overflow-hidden transition-colors duration-700`}>
      
      {/* Hidden real HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
      />

      {/* Hidden Native File Input for Phone / Downloads */}
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.flac"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Top Bar: Looks 100% like Spotify / Apple Music */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2">
        
        {/* Device Music / Playlist Library Button */}
        <button
          onClick={() => setShowPlaylist(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-slate-200 transition active:scale-95 shadow-sm"
          title="Open Device Music Library"
        >
          <List className="w-3.5 h-3.5 text-purple-400" />
          <span>My Songs ({tracks.length})</span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Add Song from Device Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition active:scale-95"
            title="Import Downloaded Songs from Phone"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Songs</span>
          </button>

          {/* Equalizer (Secret Code Door) */}
          <button
            onClick={handleEqualizerClick}
            title="Audio Equalizer"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
          >
            <Sliders className="w-4 h-4" />
          </button>
          
          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            title="Info"
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition text-[11px] underline"
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
          title="Lo-Fi Vibes (Triple-tap to unlock)"
        >
          {/* Animated Vinyl Disc */}
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
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
              {currentTrack.isLocal ? (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
                  PHONE STORAGE
                </span>
              ) : null}
              <span>{currentTrack.artist}</span>
              <span className="text-slate-500">• {currentTrack.album}</span>
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
      <div className="w-full max-w-md mx-auto space-y-4 pb-2">
        
        {/* Progress Bar & Timestamps */}
        <div className="space-y-1">
          <div 
            onClick={handleSeek}
            className="relative w-full h-2 bg-white/10 hover:bg-white/20 rounded-full overflow-hidden cursor-pointer group transition"
          >
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full transition-all duration-150"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
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
              className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
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
        <div className="flex items-center gap-3 px-3 pt-1 text-slate-400">
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

      {/* Playlist / Songs Library Modal Drawer */}
      {showPlaylist && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Music2 className="w-4 h-4 text-purple-400" />
                <span>Device Music Library</span>
                <span className="text-xs text-slate-400 font-normal">({tracks.length} songs)</span>
              </div>
              <button
                onClick={() => setShowPlaylist(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prominent Import from Phone Downloads Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-98 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Open Songs from Phone Storage / Downloads</span>
            </button>

            {/* Songs List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {tracks.map((track, idx) => {
                const isSelected = idx === currentTrackIndex;
                return (
                  <div
                    key={track.id || idx}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                      setShowPlaylist(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-purple-950/60 border border-purple-500/40 text-purple-200 shadow-md'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSelected && isPlaying ? (
                          <Radio className="w-4 h-4 animate-pulse" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {track.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {formatTime(track.duration || 0)}
                      </span>
                      {track.isLocal && (
                        <button
                          onClick={(e) => handleDeleteTrack(track.id, e)}
                          className="p-1 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 rounded-lg transition"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

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
              <span>Real Music Player Disguise</span>
            </div>
            
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>This screen is a real audio music player that plays actual downloaded songs from your phone storage.</p>
              
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px] font-mono">
                <p className="text-purple-300">⚡ <strong>How to unlock secret chat:</strong></p>
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
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
