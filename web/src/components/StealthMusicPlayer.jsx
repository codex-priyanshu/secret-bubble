import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Disc, Sliders, Music, Radio, 
  Sparkles, Shield, X, Lock, Check, FolderPlus, List, 
  Trash2, HardDrive, Smartphone, Music2, Plus, Search, 
  Globe, Flame, ExternalLink, Loader2, Video, Eye, EyeOff
} from 'lucide-react';

const FEATURED_ONLINE_TRACKS = [
  {
    id: 'online-kesariya',
    title: "Kesariya (From Brahmastra)",
    artist: "Pritam, Arijit Singh & Amitabh Bhattacharya",
    album: "Brahmastra (Original Soundtrack)",
    duration: 268,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg",
    isOnline: true,
    color: "from-amber-950/50 via-slate-950 to-slate-950"
  },
  {
    id: 'online-chaleya',
    title: "Chaleya (From Jawan)",
    artist: "Anirudh Ravichander, Arijit Singh & Shilpa Rao",
    album: "Jawan Soundtrack",
    duration: 200,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/76/05/d9/7605d905-f631-517d-df7f-e162affcd414/mzaf_9976541859961700749.plus.aac.p.m4a",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bb/f4/f5/bbf4f511-3c12-c25e-a475-b6d06faa8c13/8902894362047_cover.jpg/600x600bb.jpg",
    isOnline: true,
    color: "from-rose-950/50 via-slate-950 to-slate-950"
  },
  {
    id: 'online-lofi',
    title: "Midnight Study Lo-Fi Beats",
    artist: "Lofi Sleep Chill & Hip-Hop Beats",
    album: "Lo-Fi Cafe 24/7",
    duration: 180,
    url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/10/0f/e6/100fe64f-0815-a9d5-9bec-e375ddd5a733/mzaf_8225005754342783380.plus.aac.p.m4a",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/71/15/c5/7115c542-cf70-35f6-e2e9-d2131ff538a2/5055803554880.png/600x600bb.jpg",
    isOnline: true,
    color: "from-purple-950/50 via-slate-950 to-slate-950"
  }
];

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function StealthMusicPlayer({
  onUnlock,
  secretPin = '1234',
  decoyPin = '9999'
}) {
  const [tracks, setTracks] = useState(FEATURED_ONLINE_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(268);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(85);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showVideoMode, setShowVideoMode] = useState(false);

  // Online Search states
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'trending' | 'phone'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

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
  const iframeRef = useRef(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Update track duration when switching
  useEffect(() => {
    setCurrentTime(0);
    setDuration(currentTrack.duration || 200);
  }, [currentTrackIndex, currentTrack]);

  // Handle Real Audio / YouTube Playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack.isYoutube) {
      audio.pause();
    } else if (currentTrack.url) {
      audio.src = currentTrack.url;
      audio.volume = isMuted ? 0 : volume / 100;
      if (isPlaying) {
        audio.play().catch(err => console.log('Playback notice:', err));
      } else {
        audio.pause();
      }
    }
  }, [currentTrack, isPlaying, isMuted]);

  // Update Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Time progression for HTML5 audio
  const handleTimeUpdate = () => {
    if (audioRef.current && !currentTrack.isYoutube) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !currentTrack.isYoutube) {
      const dur = Math.floor(audioRef.current.duration);
      if (dur > 0) {
        setDuration(dur);
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

  // Simulated timer progression for YouTube videos
  useEffect(() => {
    let timer = null;
    if (isPlaying && currentTrack.isYoutube) {
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
  }, [isPlaying, currentTrack.isYoutube, duration]);

  const togglePlay = () => {
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
    if (audioRef.current && !currentTrack.isYoutube) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Online Music Search & YouTube Link Handler
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    // Check if query is a direct YouTube URL
    const ytId = extractYouTubeId(query);
    if (ytId) {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
        const oembedData = await oembedRes.json();
        const ytTrack = {
          id: `yt-${ytId}`,
          title: oembedData.title || "YouTube Video Stream",
          artist: oembedData.author_name || "YouTube Music",
          album: "YouTube Online",
          duration: 240,
          isYoutube: true,
          youtubeId: ytId,
          artwork: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          color: "from-red-950/50 via-slate-950 to-slate-950"
        };
        playTrackNow(ytTrack);
        setIsSearching(false);
        return;
      } catch (err) {
        // Fallback youtube track
        const ytTrack = {
          id: `yt-${ytId}`,
          title: "YouTube Video Audio",
          artist: "YouTube Online Stream",
          album: "YouTube",
          duration: 240,
          isYoutube: true,
          youtubeId: ytId,
          artwork: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          color: "from-red-950/50 via-slate-950 to-slate-950"
        };
        playTrackNow(ytTrack);
        setIsSearching(false);
        return;
      }
    }

    // Otherwise, search global online music library via Apple Music / iTunes API
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=25`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const parsed = data.results.map((item, idx) => ({
          id: `itunes-${item.trackId || idx}`,
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName || 'Single',
          duration: Math.floor((item.trackTimeMillis || 180000) / 1000),
          url: item.previewUrl,
          artwork: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : null,
          isOnline: true,
          color: "from-indigo-950/50 via-slate-950 to-slate-950"
        }));
        setSearchResults(parsed);
      } else {
        setSearchError('No songs found. Try another artist or song name.');
      }
    } catch (err) {
      setSearchError('Network connection issue. Please check your internet.');
    } finally {
      setIsSearching(false);
    }
  };

  const playTrackNow = (track) => {
    setTracks(prev => {
      if (prev.some(t => t.id === track.id)) {
        return prev;
      }
      return [track, ...prev];
    });
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  // Import Local Songs from Phone Storage
  const handleFilesSelected = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks = Array.from(files).map((file, i) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      const url = URL.createObjectURL(file);
      return {
        id: `phone-${Date.now()}-${i}`,
        title: cleanName,
        artist: "Phone Audio (फोन स्टोरेज)",
        album: "Device Downloads",
        duration: 200,
        isLocal: true,
        url: url,
        artwork: null,
        color: "from-blue-900/40 via-indigo-950/60 to-slate-950"
      };
    });

    setTracks(prev => [...newTracks, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  const handleDeleteTrack = (id, e) => {
    e.stopPropagation();
    setTracks(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return filtered.length > 0 ? filtered : FEATURED_ONLINE_TRACKS;
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
      setCodeError('Preset profile applied.');
      setTimeout(() => {
        setShowCodeModal(false);
      }, 1000);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b ${currentTrack.color || 'from-indigo-950 via-slate-950 to-slate-950'} text-slate-100 select-none p-4 sm:p-7 font-sans overflow-hidden transition-colors duration-700`}>
      
      {/* Real HTML5 Audio Element for Online Streams & Phone Storage */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
      />

      {/* Hidden YouTube IFrame Embed Player */}
      {currentTrack.isYoutube && (
        <div className={showVideoMode ? "fixed top-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-md p-2" : "hidden"}>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1`}
              title={currentTrack.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Hidden File Input for Phone Local Songs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.flac"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Top Bar: Search, Library, and Equalizer */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2 gap-2">
        
        {/* Open Online Search & Library */}
        <button
          onClick={() => setShowPlaylist(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-slate-200 transition active:scale-95 shadow-sm truncate"
          title="Search YouTube & Online Songs"
        >
          <Search className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">Search Online / Library</span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* YouTube Video View Toggle if active track is YouTube */}
          {currentTrack.isYoutube && (
            <button
              onClick={() => setShowVideoMode(!showVideoMode)}
              className={`p-2 rounded-full border transition ${
                showVideoMode ? 'bg-red-600 border-red-500 text-white' : 'bg-white/10 border-white/10 text-slate-300'
              }`}
              title="Toggle YouTube Video View"
            >
              <Video className="w-4 h-4" />
            </button>
          )}

          {/* Equalizer (Secret Code Door) */}
          <button
            onClick={handleEqualizerClick}
            title="Audio Equalizer"
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition"
          >
            <Sliders className="w-4 h-4" />
          </button>
          
          {/* Discrete Help */}
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
          title="Lo-Fi Vibes (Triple-tap to unlock secret chat)"
        >
          {/* Animated Vinyl Disc with Real Album Artwork / YouTube Thumbnail */}
          <div className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-neutral-950 border-4 border-neutral-900 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-500 ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}>
            
            {/* Vinyl grooves */}
            <div className="absolute inset-3 rounded-full border border-neutral-800/80 pointer-events-none" />
            <div className="absolute inset-8 rounded-full border border-neutral-800/60 pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-neutral-800/40 pointer-events-none" />
            <div className="absolute inset-20 rounded-full border border-neutral-800/40 pointer-events-none" />

            {/* Vinyl Center Art: Real Album Artwork if available */}
            {currentTrack.artwork ? (
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-white/20 shadow-inner relative">
                <img 
                  src={currentTrack.artwork} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-neutral-950 border-2 border-neutral-800 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-1 shadow-inner flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-neutral-950 border-2 border-neutral-800 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Equalizer Live Visualizer Waveform */}
          {isPlaying && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 shadow-lg">
              <div className="w-1 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-7 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <div className="w-1 h-4 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
              <div className="w-1 h-6 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>

        {/* Track Title & Artist */}
        <div className="w-full flex items-center justify-between mt-7 px-2">
          <div className="min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
              {currentTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
              {currentTrack.isYoutube ? (
                <span className="px-1.5 py-0.2 rounded bg-red-600/30 text-red-300 text-[10px] font-bold border border-red-500/40">
                  YOUTUBE
                </span>
              ) : currentTrack.isOnline ? (
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  ONLINE STREAM
                </span>
              ) : currentTrack.isLocal ? (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  PHONE STORAGE
                </span>
              ) : null}
              <span>{currentTrack.artist}</span>
            </p>
          </div>

          <button
            onClick={handleHeartClick}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-full transition active:scale-125"
            title="Save to Favorites (Tap 3 times to unlock)"
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
              className="p-2 text-slate-300 hover:text-white transition active:scale-90 cursor-pointer"
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
              className="p-2 text-slate-300 hover:text-white transition active:scale-90 cursor-pointer"
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

      {/* Online Music & YouTube Search Modal Drawer */}
      {showPlaylist && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Online Music & YouTube Streamer</span>
              </div>
              <button
                onClick={() => setShowPlaylist(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'search'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search / YouTube</span>
              </button>

              <button
                onClick={() => setActiveTab('trending')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'trending'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Trending Hits</span>
              </button>

              <button
                onClick={() => setActiveTab('phone')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'phone'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Phone Songs</span>
              </button>
            </div>

            {/* TAB 1: Online Search & YouTube Link */}
            {activeTab === 'search' && (
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                
                {/* Search Input Bar */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search any song, artist or paste YouTube link..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
                  </button>
                </form>

                {/* Search Helper Hints */}
                <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                  <span className="opacity-70">Popular:</span>
                  {['Arijit Singh', 'Kesariya', 'Chaleya', 'Sidhu Moose Wala', 'Lofi Hindi', 'Taylor Swift'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); }}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-300 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {searchError && (
                  <p className="text-xs text-rose-400 text-center py-2">{searchError}</p>
                )}

                {/* Search Results List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => playTrackNow(item)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-800/80 border border-transparent hover:border-purple-500/30 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <img
                          src={item.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                          alt={item.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{item.artist}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition shrink-0"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}

                  {searchResults.length === 0 && !isSearching && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      <Globe className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p>Type any song name or paste a YouTube video link to stream online directly from the internet.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: Trending Online Hits */}
            {activeTab === 'trending' && (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                <p className="text-xs text-slate-400 mb-2">Curated online streaming tracks (ready to play):</p>
                {FEATURED_ONLINE_TRACKS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => playTrackNow(item)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={item.artwork}
                        alt={item.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{item.artist}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-2 rounded-xl bg-purple-600 text-white transition shrink-0 shadow-md shadow-purple-600/30"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Phone Downloaded Songs */}
            {activeTab === 'phone' && (
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Choose MP3 Songs from Phone Storage / Downloads</span>
                </button>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {tracks.filter(t => t.isLocal).map((track, idx) => (
                    <div
                      key={track.id}
                      onClick={() => playTrackNow(track)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-800/80 cursor-pointer transition text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-white truncate">{track.title}</p>
                        <p className="text-[10px] text-slate-400">{track.artist}</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteTrack(track.id, e)}
                        className="p-1.5 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {tracks.filter(t => t.isLocal).length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">
                      No local songs imported yet. Click the button above to import your downloaded songs.
                    </p>
                  )}
                </div>
              </div>
            )}

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
              <span>Real Online & YouTube Player</span>
            </div>
            
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>This player streams real songs from the internet (YouTube & Online Search) and plays phone storage downloads.</p>
              
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
