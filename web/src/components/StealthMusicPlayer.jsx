import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Disc, Sliders, Music, Radio, 
  Sparkles, Shield, X, Lock, Check, FolderPlus, List, 
  HardDrive, Smartphone, Music2, Plus, Search, 
  Globe, Flame, ExternalLink, Loader2, Video, Eye, EyeOff,
  Headphones, ChevronDown, ChevronUp, RadioTower, KeyRound, AlertCircle, Download
} from 'lucide-react';

const FEATURED_ONLINE_TRACKS = [
  {
    id: 'track-rjkrTnma',
    title: "Kesariya - Brahmāstra",
    artist: "Pritam, Arijit Singh, Amitabh Bhattacharya",
    album: "Brahmāstra Soundtrack",
    duration: 268,
    durationText: "4:28",
    url: "https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4",
    artwork: "https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg",
    isAudioStream: true,
    color: "from-amber-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-faloMmjX',
    title: "Chaleya - Jawan",
    artist: "Anirudh Ravichander, Arijit Singh, Shilpa Rao",
    album: "Jawan Soundtrack",
    duration: 200,
    durationText: "3:20",
    url: "https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4",
    artwork: "https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.jpg",
    isAudioStream: true,
    color: "from-rose-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-qZtKBMZ_',
    title: "Apna Bana Le - Bhediya",
    artist: "Sachin-Jigar, Arijit Singh",
    album: "Bhediya Soundtrack",
    duration: 261,
    durationText: "4:21",
    url: "https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_320.mp4",
    artwork: "https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg",
    isAudioStream: true,
    color: "from-indigo-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-H2r9PnvA',
    title: "295 - Moosetape",
    artist: "Sidhu Moose Wala",
    album: "Moosetape",
    duration: 270,
    durationText: "4:30",
    url: "https://aac.saavncdn.com/609/852628435c98083dfe217c1cfa731bb5_320.mp4",
    artwork: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg",
    isAudioStream: true,
    color: "from-blue-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-NIidiD9g',
    title: "Heeriye (feat. Arijit Singh)",
    artist: "Jasleen Royal, Arijit Singh, Dulquer Salmaan",
    album: "Single",
    duration: 194,
    durationText: "3:14",
    url: "https://aac.saavncdn.com/022/a192e8d320ea5630db314d04fedf0aa5_320.mp4",
    artwork: "https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230928050405-500x500.jpg",
    isAudioStream: true,
    color: "from-teal-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-aRZbUYD7',
    title: "Tum Hi Ho - Aashiqui 2",
    artist: "Mithoon, Arijit Singh",
    album: "Aashiqui 2",
    duration: 262,
    durationText: "4:22",
    url: "https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4",
    artwork: "https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg",
    isAudioStream: true,
    color: "from-blue-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-mPTrDSun',
    title: "Raataan Lambiyan - Shershaah",
    artist: "Tanishk Bagchi, Jubin Nautiyal, Asees Kaur",
    album: "Shershaah",
    duration: 230,
    durationText: "3:50",
    url: "https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4",
    artwork: "https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg",
    isAudioStream: true,
    color: "from-pink-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-M7k5t7vw',
    title: "Lover - MoonChild Era",
    artist: "Diljit Dosanjh",
    album: "MoonChild Era",
    duration: 190,
    durationText: "3:10",
    url: "https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4",
    artwork: "https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.jpg",
    isAudioStream: true,
    color: "from-amber-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-1e0En7YX',
    title: "Pehle Bhi Main - ANIMAL",
    artist: "Vishal Mishra, Raj Shekhar",
    album: "ANIMAL",
    duration: 250,
    durationText: "4:10",
    url: "https://aac.saavncdn.com/092/81b52beea90f186f27cf5c5eead972c8_320.mp4",
    artwork: "https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg",
    isAudioStream: true,
    color: "from-purple-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-xzUVX40K',
    title: "Brown Munde",
    artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon",
    album: "Brown Munde",
    duration: 254,
    durationText: "4:14",
    url: "https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4",
    artwork: "https://c.saavncdn.com/973/Brown-Munde-English-2020-20260520131422-500x500.jpg",
    isAudioStream: true,
    color: "from-orange-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-VQp1eXug',
    title: "Zara Sa - Jannat",
    artist: "Sayeed Quadri, Pritam, KK",
    album: "Jannat",
    duration: 302,
    durationText: "5:02",
    url: "https://aac.saavncdn.com/801/571617f7810fb699ed56bc8a7d9e40d9_320.mp4",
    artwork: "https://c.saavncdn.com/801/Jannat-Hindi-2008-20190629135803-500x500.jpg",
    isAudioStream: true,
    color: "from-cyan-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-4mHUvJ4u',
    title: "Satranga - ANIMAL",
    artist: "Arijit Singh, Shreyas Puranik",
    album: "ANIMAL",
    duration: 271,
    durationText: "4:31",
    url: "https://aac.saavncdn.com/092/86b1368e104225e0bfbc69cda4ab8580_320.mp4",
    artwork: "https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20260724191152-500x500.jpg",
    isAudioStream: true,
    color: "from-red-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-dF_dPijA',
    title: "Pappu Can't Dance",
    artist: "Benny Dayal, Naresh Iyer, Blaaze, A.R. Rahman",
    album: "Jaane Tu... Ya Jaane Na",
    duration: 264,
    durationText: "4:24",
    url: "https://aac.saavncdn.com/033/52742623b9d7580aef311375416f8744_320.mp4",
    artwork: "https://c.saavncdn.com/033/Jaane-Tu-Ya-Jaane-Na-Hindi-2008-20221128173303-500x500.jpg",
    isAudioStream: true,
    color: "from-emerald-950/60 via-slate-950 to-slate-950"
  },
  {
    id: 'track-lofi-stream',
    title: "Lofi Chill Radio - Relax / Study",
    artist: "24/7 Continuous Background Stream",
    album: "Chillhop 24/7",
    duration: 7200,
    durationText: "2:00:00",
    url: "https://play.streamafrica.net/lofiradio",
    artwork: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80",
    isAudioStream: true,
    color: "from-purple-950/60 via-slate-950 to-slate-950"
  }
];

// Continuous procedural fallback pool to guarantee non-stop songs even if offline
const BACKUP_STREAM_POOL = [
  {
    title: "O Maahi - Dunki",
    artist: "Pritam, Arijit Singh, Irshad Kamil",
    album: "Dunki",
    duration: 233,
    durationText: "3:53",
    url: "https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4",
    artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
    isAudioStream: true
  },
  {
    title: "Ve Kamleya - Rocky Aur Rani",
    artist: "Pritam, Arijit Singh, Shreya Ghoshal",
    album: "Rocky Aur Rani Kii Prem Kahaani",
    duration: 247,
    durationText: "4:07",
    url: "https://aac.saavncdn.com/022/a192e8d320ea5630db314d04fedf0aa5_320.mp4",
    artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80",
    isAudioStream: true
  },
  {
    title: "Shayad - Love Aaj Kal",
    artist: "Pritam, Arijit Singh",
    album: "Love Aaj Kal",
    duration: 248,
    durationText: "4:08",
    url: "https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_320.mp4",
    artwork: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80",
    isAudioStream: true
  },
  {
    title: "Dil Diyan Gallan",
    artist: "Atif Aslam, Vishal-Shekhar",
    album: "Tiger Zinda Hai",
    duration: 260,
    durationText: "4:20",
    url: "https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4",
    artwork: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&q=80",
    isAudioStream: true
  },
  {
    title: "Tere Hawaale - Laal Singh Chaddha",
    artist: "Arijit Singh, Shilpa Rao, Pritam",
    album: "Laal Singh Chaddha",
    duration: 334,
    durationText: "5:34",
    url: "https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4",
    artwork: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80",
    isAudioStream: true
  },
  {
    title: "Beete Lamhein - The Train",
    artist: "KK, Mithoon",
    album: "The Train",
    duration: 275,
    durationText: "4:35",
    url: "https://aac.saavncdn.com/801/571617f7810fb699ed56bc8a7d9e40d9_320.mp4",
    artwork: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80",
    isAudioStream: true
  },
  {
    title: "Excuses - Intense",
    artist: "AP Dhillon, Gurinder Gill",
    album: "Excuses",
    duration: 176,
    durationText: "2:56",
    url: "https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4",
    artwork: "https://images.unsplash.com/photo-1445985543470-41fdd6ce388d?w=500&q=80",
    isAudioStream: true
  },
  {
    title: "Agar Tum Saath Ho - Tamasha",
    artist: "A.R. Rahman, Alka Yagnik, Arijit Singh",
    album: "Tamasha",
    duration: 341,
    durationText: "5:41",
    url: "https://aac.saavncdn.com/047/d1366530468931703ac909e82a3ee788_320.mp4",
    artwork: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&q=80",
    isAudioStream: true
  }
];

function getProceduralBatch(page) {
  const batchSize = 6;
  return BACKUP_STREAM_POOL.map((item, idx) => ({
    ...item,
    id: `stream-page-${page}-song-${idx}`,
    title: page > 1 ? `${item.title} (Live Mix ${page})` : item.title,
    color: "from-purple-950/60 via-slate-950 to-slate-950"
  }));
}

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

// Inaudible 1-second silent WAV base64 loop to prevent mobile browsers from suspending background audio thread
const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export default function StealthMusicPlayer({
  onUnlock,
  secretPin = '1234',
  decoyPin = '9999',
  backendUrl = '',
  onOpenInstall
}) {
  const [tracks, setTracks] = useState(FEATURED_ONLINE_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(268);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(90);
  const [viewMode, setViewMode] = useState('list'); // 'list' (default on launch) | 'nowPlaying'
  const [showVideoMode, setShowVideoMode] = useState(false);

  // Infinite non-stop streaming & feed states
  const [feedPage, setFeedPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const listScrollRef = useRef(null);

  // Online Search states
  const [activeTab, setActiveTab] = useState('playlist'); // 'playlist' | 'search' | 'trending' | 'phone'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  // Secret unlock & PINs setup state
  const [isPinSetupDone, setIsPinSetupDone] = useState(() => {
    try {
      return localStorage.getItem('secret_bubble_pins_configured') === 'true';
    } catch {
      return false;
    }
  });
  const [activeSecretPin, setActiveSecretPin] = useState(() => {
    try {
      return localStorage.getItem('secret_bubble_secret_pin') || secretPin || '1234';
    } catch {
      return secretPin || '1234';
    }
  });
  const [activeDecoyPin, setActiveDecoyPin] = useState(() => {
    try {
      return localStorage.getItem('secret_bubble_decoy_pin') || decoyPin || '9999';
    } catch {
      return decoyPin || '9999';
    }
  });

  // First-time PIN creation modal
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [setupSecretPin, setSetupSecretPin] = useState('');
  const [setupDecoyPin, setSetupDecoyPin] = useState('');
  const [showSetupSecretEye, setShowSetupSecretEye] = useState(false);
  const [showSetupDecoyEye, setShowSetupDecoyEye] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Returning user PIN modal
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [heartTapCount, setHeartTapCount] = useState(0);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [showCodeEye, setShowCodeEye] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Audio elements
  const audioRef = useRef(null);
  const backgroundKeepAliveRef = useRef(null);
  const fileInputRef = useRef(null);
  const iframeRef = useRef(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Helper for Next/Previous tracks
  const handleNextTrack = useCallback(() => {
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
  }, [isShuffle, tracks.length, currentTrackIndex]);

  const handlePrevTrack = useCallback(() => {
    setCurrentTrackIndex(i => (i - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  }, [tracks.length]);

  // Update track duration when switching
  useEffect(() => {
    setCurrentTime(0);
    setDuration(currentTrack.duration || 220);
  }, [currentTrackIndex, currentTrack]);

  // =========================================================================
  // Background Keep-Alive Audio & OS MediaSession Integration (Phone Lock Screen)
  // =========================================================================
  useEffect(() => {
    // 1. Maintain background media session so phone notification bar & lock screen work
    if ('mediaSession' in navigator && currentTrack) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title || "Secret Music Player",
          artist: currentTrack.artist || "Online Stream",
          album: currentTrack.album || "Lo-Fi Audio",
          artwork: [
            {
              src: currentTrack.artwork || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=512",
              sizes: '512x512',
              type: 'image/jpeg'
            }
          ]
        });

        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
        navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
        navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack());
        navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevTrack());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (typeof details.seekTime === 'number') {
            setCurrentTime(Math.floor(details.seekTime));
            if (audioRef.current && currentTrack?.url) {
              audioRef.current.currentTime = details.seekTime;
            }
          }
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          if (audioRef.current && currentTrack?.url) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
            setCurrentTime(Math.floor(audioRef.current.currentTime));
          }
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
          if (audioRef.current && currentTrack?.url) {
            audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
            setCurrentTime(Math.floor(audioRef.current.currentTime));
          }
        });

        if ('setPositionState' in navigator.mediaSession && duration > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: Math.max(1, duration),
              playbackRate: 1,
              position: Math.min(Math.max(0, currentTime), duration)
            });
          } catch (e) {}
        }
      } catch (e) {}
    }

    // 2. Silent keep-alive loop to prevent phone from sleeping background audio
    const bgAudio = backgroundKeepAliveRef.current;
    if (bgAudio) {
      bgAudio.volume = 0.01;
      if (isPlaying) {
        bgAudio.play().catch(() => {});
      } else {
        bgAudio.pause();
      }
    }
  }, [currentTrack, isPlaying, currentTime, duration, handleNextTrack, handlePrevTrack]);


  const getBackendApiUrl = useCallback(() => {
    if (backendUrl) return backendUrl.replace(/\/$/, '');
    if (import.meta.env?.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname || 'localhost';
      return `http://${hostname}:5000`;
    }
    return '';
  }, [backendUrl]);

  // Handle Real Audio / YouTube Playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.url) {
      // Direct full-length audio stream mode (Native HTML5 audio enables continuous background playback)
      if (!audio.src || (!audio.src.endsWith(currentTrack.url) && !currentTrack.url.endsWith(audio.src))) {
        audio.src = currentTrack.url;
      }
      audio.muted = isMuted;
      audio.volume = isMuted ? 0 : volume / 100;
      if (isPlaying) {
        audio.play().catch(err => console.log('Audio playback notice:', err));
      } else {
        audio.pause();
      }
    } else if (currentTrack?.isYoutube) {
      // YouTube fallback mode: HTML5 audio pauses, iframe streams
      audio.pause();
      if (iframeRef.current?.contentWindow) {
        try {
          const cmd = isPlaying ? 'playVideo' : 'pauseVideo';
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: cmd, args: [] }),
            '*'
          );
        } catch (e) {}
      }
    }
  }, [currentTrack, isPlaying, isMuted]);

  // Update Volume
  useEffect(() => {
    if (audioRef.current && !currentTrack?.isYoutube) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
    if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
      try {
        const vol = isMuted ? 0 : volume;
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [vol] }),
          '*'
        );
      } catch (e) {}
    }
  }, [volume, isMuted, currentTrack]);

  // Listen to YouTube Iframe events (infoDelivery for real time/duration & onStateChange for auto-next)
  useEffect(() => {
    const handleYtMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // Synchronize duration & current time from real YouTube player
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(Math.floor(data.info.currentTime));
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 30) {
            setDuration(Math.floor(data.info.duration));
          }
        }

        // Handle video playback states: 0 = ENDED, 1 = PLAYING, 2 = PAUSED
        if (data.event === 'onStateChange') {
          if (data.info === 0) {
            // Full song ended -> smoothly play next track
            handleNextTrack();
          } else if (data.info === 1) {
            setIsPlaying(true);
          } else if (data.info === 2) {
            setIsPlaying(false);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleYtMessage);
    return () => window.removeEventListener('message', handleYtMessage);
  }, [handleNextTrack]);

  // Time progression for HTML5 audio
  const handleTimeUpdate = () => {
    if (audioRef.current && !currentTrack?.isYoutube) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !currentTrack?.isYoutube) {
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

  // Continuous timer for UI progress (fallback in case iframe messages are delayed)
  useEffect(() => {
    let timer = null;
    if (isPlaying && currentTrack?.isYoutube) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (duration > 0 && prev >= duration) {
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
  }, [isPlaying, currentTrack?.isYoutube, duration, handleNextTrack]);

  const togglePlay = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);
    if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
      try {
        const cmd = nextPlay ? 'playVideo' : 'pauseVideo';
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: cmd, args: [] }),
          '*'
        );
      } catch (e) {}
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = Math.floor(percentage * duration);
    setCurrentTime(newTime);
    if (audioRef.current && currentTrack?.url) {
      audioRef.current.currentTime = newTime;
    } else if (currentTrack?.isYoutube && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [newTime, true] }),
          '*'
        );
      } catch (e) {}
    }
  };

  // =========================================================================
  // Unified Full-Song Search (Direct Background Audio Streams & YouTube Fallback)
  // =========================================================================
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    // 1. Check if direct YouTube URL was pasted
    const ytId = extractYouTubeId(query);
    if (ytId) {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
        const oembedData = await oembedRes.json();
        const ytTrack = {
          id: `yt-${ytId}`,
          youtubeId: ytId,
          title: oembedData.title || "YouTube Full Song",
          artist: oembedData.author_name || "YouTube Music",
          album: "YouTube Online",
          duration: 260,
          durationText: "Full Song",
          isYoutube: true,
          artwork: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          color: "from-red-950/60 via-slate-950 to-slate-950"
        };
        playTrackNow(ytTrack);
        setIsSearching(false);
        return;
      } catch (err) {
        const ytTrack = {
          id: `yt-${ytId}`,
          youtubeId: ytId,
          title: "YouTube Audio Stream",
          artist: "YouTube Online",
          album: "YouTube",
          duration: 260,
          durationText: "Full Song",
          isYoutube: true,
          artwork: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          color: "from-red-950/60 via-slate-950 to-slate-950"
        };
        playTrackNow(ytTrack);
        setIsSearching(false);
        return;
      }
    }

    // 2. Full-Length Direct Audio Song Search via Backend API
    try {
      const apiBase = getBackendApiUrl();
      let backendData = null;

      try {
        const res = await fetch(`${apiBase}/api/music/search?q=${encodeURIComponent(query)}`);
        if (res.ok) backendData = await res.json();
      } catch (err) {
        try {
          const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
          if (res.ok) backendData = await res.json();
        } catch (e) {}
      }

      const fullSongResults = [];

      if (backendData?.success && Array.isArray(backendData.results) && backendData.results.length > 0) {
        backendData.results.forEach(item => {
          fullSongResults.push({
            id: item.id || `track-${item.youtubeId || Math.random()}`,
            title: item.title,
            artist: item.artist,
            album: item.album || "Full Song",
            duration: item.duration || 240,
            durationText: item.durationText || "Full Song",
            artwork: item.artwork,
            url: item.url || null,
            youtubeId: item.youtubeId || null,
            isAudioStream: Boolean(item.url),
            isYoutube: !item.url && Boolean(item.youtubeId),
            color: "from-purple-950/50 via-slate-950 to-slate-950"
          });
        });
      }

      // 3. Fallback: If 0 results, query YouTube search fallback
      if (fullSongResults.length === 0) {
        try {
          const ytRes = await fetch(`${apiBase}/api/music/youtube-search?q=${encodeURIComponent(query)}`);
          if (ytRes.ok) {
            const ytData = await ytRes.json();
            if (ytData?.success && Array.isArray(ytData.results)) {
              ytData.results.forEach(item => {
                fullSongResults.push({
                  id: item.id || `yt-${item.youtubeId}`,
                  youtubeId: item.youtubeId,
                  title: item.title,
                  artist: item.artist,
                  album: "YouTube Full Song",
                  duration: item.duration || 240,
                  durationText: item.durationText || "Full Song",
                  artwork: item.artwork,
                  isYoutube: true,
                  color: "from-red-950/50 via-slate-950 to-slate-950"
                });
              });
            }
          }
        } catch (e) {}
      }

      if (fullSongResults.length > 0) {
        setSearchResults(fullSongResults);
      } else {
        setSearchError('No songs found. Try another song title or artist name.');
      }
    } catch (err) {
      setSearchError('Network error. Please check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const playTrackNow = (track) => {
    setTracks(prev => {
      const idx = prev.findIndex(t => t.id === track.id);
      if (idx !== -1) {
        setCurrentTrackIndex(idx);
        return prev;
      }
      setCurrentTrackIndex(0);
      return [track, ...prev];
    });
    setIsPlaying(true);
  };

  // Import Local Songs from Phone Storage / Downloads
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
        color: "from-cyan-950/60 via-slate-950 to-slate-950"
      };
    });

    setTracks(prev => [...newTracks, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  // Infinite Non-Stop Music Loading (scrolling adds new hits continuously)
  const isLoadingRef = useRef(false);

  const loadMoreSongs = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoadingMore(true);

    const TOPICS = [
      'Arijit Singh Hits',
      'Sidhu Moose Wala',
      'Pritam Melodies',
      'Diljit Dosanjh Hits',
      'Anirudh Ravichander',
      'Atif Aslam Romantic',
      'Lofi Hindi Chill',
      'AP Dhillon Top',
      'Shreya Ghoshal Hits',
      'KK Evergreen Hits',
      'Darshan Raval Hits',
      'A.R. Rahman Classics',
      'Badshah Party Hits',
      'Jubin Nautiyal Hits',
      'B Praak Emotional Hits',
      'Sonu Nigam Romantic',
      'Mohit Chauhan Melodies',
      'Bollywood Top Romantic',
      'Punjabi Hits'
    ];

    try {
      const nextPage = feedPage + 1;
      const topic = TOPICS[(nextPage - 1) % TOPICS.length];
      const apiBase = getBackendApiUrl();
      let newTracks = [];

      // Try 1: Fetch via /api/music/search with topic (working on deployed Render backend!)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${apiBase}/api/music/search?q=${encodeURIComponent(topic)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data?.success && Array.isArray(data.results) && data.results.length > 0) {
            newTracks = data.results.map((item, idx) => ({
              id: item.id || `track-${topic.replace(/\s+/g, '')}-${nextPage}-${idx}`,
              title: item.title,
              artist: item.artist,
              album: item.album || "Online Stream",
              duration: item.duration || 240,
              durationText: item.durationText || "4:00",
              artwork: item.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
              url: item.url || null,
              youtubeId: item.youtubeId || null,
              isAudioStream: Boolean(item.url),
              isYoutube: !item.url && Boolean(item.youtubeId),
              color: "from-purple-950/60 via-slate-950 to-slate-950"
            }));
          }
        }
      } catch (e) {
        // Network or timeout
      }

      // If backend returned songs, append them deduplicated
      if (newTracks.length > 0) {
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const filtered = newTracks.filter(t => !existingIds.has(t.id));
          return filtered.length > 0 ? [...prev, ...filtered] : prev;
        });
        setFeedPage(nextPage);
      } else {
        // Offline / Fallback generator to guarantee continuous non-stop stream
        const fallbackBatch = getProceduralBatch(nextPage);
        setTracks(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const filtered = fallbackBatch.filter(t => !existingIds.has(t.id));
          return [...prev, ...filtered];
        });
        setFeedPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading more songs:', err);
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [feedPage, getBackendApiUrl]);

  // Observer to trigger autoload when scrolling near bottom of list container
  useEffect(() => {
    if (activeTab !== 'playlist') return;
    const scrollContainer = listScrollRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreSongs();
        }
      },
      {
        root: scrollContainer,
        rootMargin: '250px'
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [activeTab, loadMoreSongs]);

  // Secondary rock-solid scroll handler for mobile webview
  const handleContainerScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 280 && activeTab === 'playlist') {
      loadMoreSongs();
    }
  };


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Centralized Trigger for Secret Vault Unlock
  const triggerSecretUnlock = () => {
    if (!isPinSetupDone) {
      setShowSetupPinModal(true);
      setSetupSecretPin('');
      setSetupDecoyPin('');
      setSetupError('');
    } else {
      setShowCodeModal(true);
      setInputCode('');
      setCodeError('');
    }
  };

  // Secret Unlock Trigger 1: Triple-tap on Vinyl / Album Art
  const handleCoverTap = () => {
    const now = Date.now();
    if (now - lastTapTime < 600) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 3) {
        triggerSecretUnlock();
        setTapCount(0);
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
        triggerSecretUnlock();
        return 0;
      }
      return next;
    });
    setTimeout(() => setHeartTapCount(0), 1000);
  };

  // Secret Unlock Trigger 3: Clicking Equalizer / Sliders opens Vault Unlock
  const handleEqualizerClick = () => {
    triggerSecretUnlock();
  };

  // First-time PIN setup submit
  const handleSetupPinSubmit = (e) => {
    e.preventDefault();
    setSetupError('');

    const sPin = setupSecretPin.trim().replace(/\D/g, '');
    const dPin = setupDecoyPin.trim().replace(/\D/g, '');

    if (!sPin || sPin.length < 4) {
      setSetupError('Secret PIN must be at least 4 digits (e.g. 1234)');
      return;
    }

    if (dPin && dPin.length < 4) {
      setSetupError('Decoy PIN must be at least 4 digits (e.g. 9999)');
      return;
    }

    if (dPin && sPin === dPin) {
      setSetupError('Secret PIN and Decoy PIN cannot be identical! Both must be different.');
      return;
    }

    const finalDecoy = dPin || (sPin === '9999' ? '8888' : '9999');

    try {
      localStorage.setItem('secret_bubble_secret_pin', sPin);
      localStorage.setItem('secret_bubble_decoy_pin', finalDecoy);
      localStorage.setItem('secret_bubble_pins_configured', 'true');
    } catch {}

    setActiveSecretPin(sPin);
    setActiveDecoyPin(finalDecoy);
    setIsPinSetupDone(true);
    setShowSetupPinModal(false);

    // Proceed directly to vault unlock
    if (onUnlock) onUnlock(false);
  };

  // Returning user PIN submit
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    const clean = inputCode.trim().replace(/\D/g, '');

    if (!clean) {
      setCodeError('Please enter your 4-digit PIN');
      return;
    }

    if (clean === activeSecretPin) {
      setShowCodeModal(false);
      setInputCode('');
      if (onUnlock) onUnlock(false);
    } else if (clean === activeDecoyPin) {
      setShowCodeModal(false);
      setInputCode('');
      if (onUnlock) onUnlock(true); // Decoy mode
    } else {
      setCodeError('Incorrect PIN code. Disguise active.');
      setInputCode('');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b ${currentTrack.color || 'from-indigo-950 via-slate-950 to-slate-950'} text-slate-100 select-none p-4 sm:p-7 font-sans overflow-hidden transition-colors duration-700`}>
      
      {/* Background audio keep-alive (silently ensures mobile OS does not pause background stream) */}
      <audio
        ref={backgroundKeepAliveRef}
        src={SILENT_AUDIO_URI}
        loop
        playsInline
      />

      {/* Real HTML5 Audio Element for Online Streams & Phone Storage */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
        playsInline
      />

      {/* Persistent YouTube Audio/Video Frame (Kept rendered in-viewport to guarantee continuous background playback) */}
      {currentTrack.isYoutube && (
        <div 
          className={
            showVideoMode 
              ? "fixed top-14 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md p-2 animate-in zoom-in-95 duration-200" 
              : "fixed top-0 left-0 w-2 h-2 opacity-[0.001] pointer-events-none overflow-hidden -z-50"
          }
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
            <iframe
              ref={iframeRef}
              key={currentTrack.youtubeId}
              src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=${isPlaying ? 1 : 0}&enablejsapi=1&playsinline=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`}
              title={currentTrack.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
            {showVideoMode && (
              <button
                onClick={() => setShowVideoMode(false)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-black text-white text-xs"
                title="Minimize Video"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
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

      {/* =========================================================================
          VIEW 1: All Songs List & Music Browser (Default App View on Open)
          ========================================================================= */}
      {viewMode === 'list' && (
        <div className="flex-1 flex flex-col w-full max-w-lg mx-auto h-full overflow-hidden pb-20 pt-1">
          
          {/* List View Top Header */}
          <div className="flex items-center justify-between px-1 pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 overflow-hidden border border-white/20">
                <img
                  src="/app-logo.png"
                  alt="App Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                  <span>Music Lounge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h1>
                <p className="text-[10px] text-slate-400">Online Streaming & Phone Audio</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Install App Button */}
              {onOpenInstall && (
                <button
                  onClick={onOpenInstall}
                  title="Download / Install App on Phone"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Install</span>
                </button>
              )}

              {/* YouTube Video View Toggle */}
              {currentTrack.isYoutube && (
                <button
                  onClick={() => setShowVideoMode(!showVideoMode)}
                  className={`p-2 rounded-full border transition active:scale-90 ${
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
                title="Audio Equalizer / Sound Presets"
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition active:scale-95 cursor-pointer"
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

          {/* Quick Search Bar at Top */}
          <div className="pt-3 pb-2 space-y-2 shrink-0">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any song, artist or paste YouTube link..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700/80 focus:border-purple-500 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none shadow-inner"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-purple-600/30 cursor-pointer shrink-0"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Search</span>}
              </button>
            </form>

            {/* Popular Query Badges */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px] text-slate-400">
              <span className="opacity-70 shrink-0">Popular:</span>
              {['Arijit Singh', 'Kesariya', 'Chaleya', 'Sidhu Moose Wala', 'Lofi Hindi'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    setActiveTab('search');
                    setTimeout(() => handleSearchSubmit(), 50);
                  }}
                  className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-purple-300 transition shrink-0 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Category Tabs */}
          <div className="flex gap-1.5 py-2 border-b border-white/10 shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('playlist')}
              className={`py-1.5 px-3 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'playlist'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Songs ({tracks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`py-1.5 px-3 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Trending Hits</span>
            </button>

            <button
              onClick={() => setActiveTab('phone')}
              className={`py-1.5 px-3 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'phone'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Phone Storage</span>
            </button>

            {searchResults.length > 0 && (
              <button
                onClick={() => setActiveTab('search')}
                className={`py-1.5 px-3 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800/70 text-slate-400 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-purple-300" />
                <span>Results ({searchResults.length})</span>
              </button>
            )}
          </div>

          {/* Main Scrollable Song List with Infinite Non-Stop Streaming */}
          <div
            ref={listScrollRef}
            onScroll={handleContainerScroll}
            className="flex-1 overflow-y-auto space-y-1.5 pt-2 pr-0.5 pb-28"
          >
            {/* TAB 0: All Songs Queue */}
            {activeTab === 'playlist' && (
              <div className="space-y-1.5">
                {tracks.map((track, idx) => {
                  const isCurrent = idx === currentTrackIndex;
                  return (
                    <div
                      key={track.id || idx}
                      onClick={() => {
                        setCurrentTrackIndex(idx);
                        setIsPlaying(true);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition cursor-pointer active:scale-[0.99] group ${
                        isCurrent
                          ? 'bg-purple-900/40 border-purple-500/60 shadow-lg shadow-purple-950/40'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className={`text-xs font-mono w-4 text-center shrink-0 ${isCurrent ? 'text-purple-400 font-bold' : 'text-slate-500'}`}>
                          {isCurrent ? '▶' : idx + 1}
                        </span>
                        <img
                          src={track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                          alt={track.title}
                          className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10 shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isCurrent ? 'text-purple-200' : 'text-white'}`}>
                            {track.title}
                          </p>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                            {track.isYoutube ? (
                              <span className="px-1.5 py-0.2 rounded bg-red-600/30 text-red-300 text-[9px] font-bold">
                                YouTube
                              </span>
                            ) : track.isLocal ? (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-600/30 text-cyan-300 text-[9px] font-bold">
                                Phone
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-600/30 text-emerald-300 text-[9px] font-bold">
                                Online
                              </span>
                            )}
                            {track.durationText && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {track.durationText}
                              </span>
                            )}
                            <span className="truncate">{track.artist}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent && isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3 px-1">
                            <span className="w-0.5 h-full bg-purple-400 animate-bounce" />
                            <span className="w-0.5 h-2 bg-pink-400 animate-bounce delay-75" />
                            <span className="w-0.5 h-3 bg-indigo-400 animate-bounce delay-150" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-purple-300 group-hover:bg-purple-600/30 transition">
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Infinite Scroll Sentinel & Loader (Songs Keep Flowing Non-Stop) */}
                <div ref={sentinelRef} className="py-4 text-center">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-purple-400 font-medium py-3 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span>Loading more songs... (नए गाने लोड हो रहे हैं...)</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 py-2 flex items-center justify-center gap-1.5 opacity-60">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Scroll down for endless non-stop songs</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: Search Results */}
            {activeTab === 'search' && (
              <div className="space-y-2">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => playTrackNow(item)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <img
                        src={item.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                        alt={item.title}
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10"
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
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p>Type any song name or artist in the search bar above to stream songs online.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Trending Hits */}
            {activeTab === 'trending' && (
              <div className="space-y-2">
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
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10"
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

            {/* TAB 3: Phone Storage */}
            {activeTab === 'phone' && (
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-98 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Choose MP3 Songs from Phone Storage / Downloads</span>
                </button>

                <div className="space-y-1.5">
                  {tracks.filter(t => t.isLocal).map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrackNow(track)}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-white truncate">{track.title}</p>
                        <p className="text-[10px] text-slate-400">{track.artist}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
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

          {/* Sticky Bottom Mini Player (like Spotify / YouTube Music) */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-xl max-w-lg mx-auto shadow-2xl">
            {/* Top 2px live progress strip */}
            <div className="w-full h-1 bg-white/10">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-150"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            <div className="p-2.5 flex items-center justify-between gap-3">
              {/* Tap to open full vinyl player */}
              <div 
                onClick={() => setViewMode('nowPlaying')}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                title="Tap to open full player screen"
              >
                <div className="relative shrink-0">
                  <img
                    src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                    alt={currentTrack.title}
                    className={`w-11 h-11 rounded-xl object-cover border border-white/20 shadow-md ${isPlaying ? 'animate-spin-slow' : ''}`}
                  />
                  <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-slate-950 border border-white/30" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition">
                    {currentTrack.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* Controls on Mini Player */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleHeartClick}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-full transition active:scale-125"
                  title="Like (Tap 3x to unlock secret vault)"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="p-2 text-slate-300 hover:text-white transition active:scale-90 cursor-pointer"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={() => setViewMode('nowPlaying')}
                  className="p-2 text-purple-400 hover:text-purple-200 transition"
                  title="Expand Full Screen"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: Full "Now Playing" Vinyl Disc Screen (Expands on Mini-Player Tap)
          ========================================================================= */}
      {viewMode === 'nowPlaying' && (
        <div className="flex-1 flex flex-col justify-between w-full max-w-md mx-auto h-full animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Bar with "Back to Songs List" */}
          <div className="flex items-center justify-between w-full pt-1">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-slate-200 transition active:scale-95 shadow-sm cursor-pointer"
              title="Return to Songs List"
            >
              <ChevronDown className="w-4 h-4" />
              <span>All Songs</span>
            </button>

            {/* Action Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {onOpenInstall && (
                <button
                  onClick={onOpenInstall}
                  title="Download / Install App on Phone"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-[11px] shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Install</span>
                </button>
              )}

              {currentTrack.isYoutube && (
                <button
                  onClick={() => setShowVideoMode(!showVideoMode)}
                  className={`p-2 rounded-full border transition active:scale-90 ${
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

          {/* Center Vinyl Disc & Cover */}
          <div className="flex flex-col items-center justify-center my-auto w-full">
            <div 
              onClick={handleCoverTap}
              className="relative group cursor-pointer"
              title="Lo-Fi Vibes (Triple-tap to unlock secret chat)"
            >
              {/* Animated Vinyl Disc */}
              <div className={`w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-neutral-950 border-4 border-neutral-900 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-500 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}>
                <div className="absolute inset-3 rounded-full border border-neutral-800/80 pointer-events-none" />
                <div className="absolute inset-8 rounded-full border border-neutral-800/60 pointer-events-none" />
                <div className="absolute inset-14 rounded-full border border-neutral-800/40 pointer-events-none" />
                <div className="absolute inset-20 rounded-full border border-neutral-800/40 pointer-events-none" />

                {currentTrack.artwork ? (
                  <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-white/20 shadow-inner relative">
                    <img 
                      src={currentTrack.artwork} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-neutral-950 border-2 border-neutral-800 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
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
                    <span className="px-1.5 py-0.2 rounded bg-red-600/30 text-red-300 text-[10px] font-bold border border-red-500/40 shrink-0">
                      YOUTUBE FULL
                    </span>
                  ) : currentTrack.isOnline ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 shrink-0">
                      ONLINE STREAM
                    </span>
                  ) : currentTrack.isLocal ? (
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 shrink-0">
                      PHONE STORAGE
                    </span>
                  ) : null}
                  <span className="truncate">{currentTrack.artist}</span>
                </p>
              </div>

              <button
                onClick={handleHeartClick}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-full transition active:scale-125"
                title="Save to Favorites (Tap 3 times to unlock chat)"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="w-full space-y-4 pb-2">
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

            {/* Controls */}
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

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsRepeat(r => !r)}
                  className={`p-2 rounded-full transition ${
                    isRepeat ? 'text-purple-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Repeat"
                >
                  <Repeat className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 text-purple-300 hover:text-white rounded-full transition cursor-pointer"
                  title="Show Song List"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
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

        </div>
      )}

      {/* First Time Security Passcode Setup Modal */}
      {showSetupPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm tracking-wide">
                <KeyRound className="w-5 h-5" />
                <span>Security PIN Setup (पासवर्ड बनाएं)</span>
              </div>
              <button
                onClick={() => setShowSetupPinModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Set your personal PINs for disguise unlocking. You can set a real PIN and an optional decoy PIN.
            </p>

            <form onSubmit={handleSetupPinSubmit} className="space-y-4">
              {/* Secret PIN (Primary) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Secret PIN (असली पासवर्ड) <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-purple-400 font-normal">Opens Real Chat</span>
                </label>
                <div className="relative">
                  <input
                    type={showSetupSecretEye ? "text" : "password"}
                    value={setupSecretPin}
                    onChange={(e) => { setSetupSecretPin(e.target.value.replace(/\D/g, '').slice(0, 8)); setSetupError(''); }}
                    placeholder="e.g. 1234"
                    maxLength={8}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupSecretEye(!showSetupSecretEye)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showSetupSecretEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Decoy PIN (Optional / Secondary) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Decoy PIN (नकली / डिकॉय पिन)</span>
                  <span className="text-[10px] text-amber-400 font-normal">Opens Fake Notes</span>
                </label>
                <div className="relative">
                  <input
                    type={showSetupDecoyEye ? "text" : "password"}
                    value={setupDecoyPin}
                    onChange={(e) => { setSetupDecoyPin(e.target.value.replace(/\D/g, '').slice(0, 8)); setSetupError(''); }}
                    placeholder="Optional (e.g. 9999)"
                    maxLength={8}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupDecoyEye(!showSetupDecoyEye)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showSetupDecoyEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Dono PIN same nahi hone chahiye. Agar khali chhodenge to decoy 9999 rahega.
                </p>
              </div>

              {setupError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSetupPinModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/30"
                >
                  Save & Open
                </button>
              </div>
            </form>
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
              <div className="relative">
                <input
                  type={showCodeEye ? "text" : "password"}
                  value={inputCode}
                  onChange={(e) => { setInputCode(e.target.value.replace(/\D/g, '').slice(0, 8)); setCodeError(''); }}
                  placeholder="Enter preset PIN..."
                  autoFocus
                  maxLength={8}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl text-sm text-white font-mono text-center tracking-widest focus:outline-none pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCodeEye(!showCodeEye)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showCodeEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

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
              <p>This player streams real full songs from YouTube & Online Search and plays phone storage downloads.</p>
              
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
