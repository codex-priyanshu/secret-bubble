import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Disc, Sliders, Music, Radio, 
  Sparkles, Shield, X, Lock, Check, FolderPlus, List, 
  HardDrive, Smartphone, Music2, Plus, Search, 
  Globe, Flame, ExternalLink, Loader2, Video, Eye, EyeOff,
  Headphones, ChevronDown, ChevronUp, RadioTower, KeyRound, AlertCircle, Download,
  ListMusic, ArrowLeft, Trash2
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

const CURATED_PLAYLISTS = [
  {
    id: 'pl-romantic',
    title: "Romantic Melodies",
    description: "Heartfelt love songs by Arijit Singh, Mithoon, Atif Aslam & Jasleen Royal",
    cover: "https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.jpg",
    gradient: "from-rose-600 to-pink-900",
    badge: "Romantic",
    songIds: ['track-rjkrTnma', 'track-qZtKBMZ_', 'track-NIidiD9g', 'track-aRZbUYD7', 'track-mPTrDSun', 'track-4mHUvJ4u', 'track-VQp1eXug']
  },
  {
    id: 'pl-punjabi',
    title: "Punjabi Bangers",
    description: "High-energy beats by Sidhu Moose Wala, AP Dhillon & Diljit Dosanjh",
    cover: "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.jpg",
    gradient: "from-amber-600 to-orange-900",
    badge: "Punjabi",
    songIds: ['track-H2r9PnvA', 'track-M7k5t7vw', 'track-xzUVX40K', 'track-faloMmjX']
  },
  {
    id: 'pl-lofi',
    title: "Lofi Chill & Study",
    description: "Calm 24/7 background beats to relax, study and focus",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80",
    gradient: "from-purple-600 to-indigo-950",
    badge: "Chill",
    songIds: ['track-lofi-stream', 'track-qZtKBMZ_', 'track-1e0En7YX', 'track-NIidiD9g']
  },
  {
    id: 'pl-bollywood',
    title: "Bollywood Evergreen & Party",
    description: "Iconic memorable hits by KK, A.R. Rahman, Anirudh & Pritam",
    cover: "https://c.saavncdn.com/801/Jannat-Hindi-2008-20190629135803-500x500.jpg",
    gradient: "from-cyan-600 to-blue-900",
    badge: "Classics",
    songIds: ['track-VQp1eXug', 'track-dF_dPijA', 'track-faloMmjX', 'track-aRZbUYD7']
  }
];

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

  // Playlist Management States
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_bubble_user_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const saved = localStorage.getItem('secret_bubble_liked_song_ids');
      return saved ? JSON.parse(saved) : ['track-rjkrTnma', 'track-aRZbUYD7'];
    } catch {
      return ['track-rjkrTnma', 'track-aRZbUYD7'];
    }
  });
  const [selectedPlaylistView, setSelectedPlaylistView] = useState(null); // null | playlist object
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState(null); // track object to add to playlist

  // Online Search states
  const [activeTab, setActiveTab] = useState('playlist'); // 'playlist' | 'playlists' | 'search' | 'trending' | 'phone'
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
        artist: "Phone Audio",
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

  // Playlist Handlers & Helpers
  const saveCustomPlaylists = (updated) => {
    setCustomPlaylists(updated);
    try {
      localStorage.setItem('secret_bubble_user_playlists', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCreatePlaylist = (e) => {
    e?.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) return;

    const newPl = {
      id: `custom-pl-${Date.now()}`,
      title: name,
      description: newPlaylistDesc.trim() || 'Custom playlist created by you',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      gradient: 'from-purple-600 via-indigo-600 to-cyan-600',
      isCustom: true,
      createdAt: Date.now(),
      songs: []
    };

    const updated = [newPl, ...customPlaylists];
    saveCustomPlaylists(updated);
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylistModal(false);
    setSelectedPlaylistView(newPl);
  };

  const handleAddSongToPlaylist = (playlistId, track) => {
    const updated = customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        const alreadyHas = (pl.songs || []).some(s => s.id === track.id);
        if (alreadyHas) return pl;
        return {
          ...pl,
          songs: [...(pl.songs || []), track]
        };
      }
      return pl;
    });
    saveCustomPlaylists(updated);
    setAddToPlaylistTrack(null);
  };

  const handleRemoveSongFromPlaylist = (playlistId, songId, e) => {
    e?.stopPropagation();
    const updated = customPlaylists.map(pl => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          songs: (pl.songs || []).filter(s => s.id !== songId)
        };
      }
      return pl;
    });
    saveCustomPlaylists(updated);
    if (selectedPlaylistView?.id === playlistId) {
      setSelectedPlaylistView(prev => ({
        ...prev,
        songs: (prev.songs || []).filter(s => s.id !== songId)
      }));
    }
  };

  const handleDeleteCustomPlaylist = (playlistId, e) => {
    e?.stopPropagation();
    const updated = customPlaylists.filter(pl => pl.id !== playlistId);
    saveCustomPlaylists(updated);
    setSelectedPlaylistView(null);
  };

  const toggleLikeTrack = (track) => {
    setLikedSongIds(prev => {
      const isCurrentlyLiked = prev.includes(track.id);
      const next = isCurrentlyLiked ? prev.filter(id => id !== track.id) : [...prev, track.id];
      try {
        localStorage.setItem('secret_bubble_liked_song_ids', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const getPlaylistSongs = (playlist) => {
    if (!playlist) return [];
    if (playlist.id === 'pl-liked') {
      const allKnown = [...tracks, ...FEATURED_ONLINE_TRACKS, ...BACKUP_STREAM_POOL];
      const seen = new Set();
      const likedList = [];
      for (const t of allKnown) {
        if (likedSongIds.includes(t.id) && !seen.has(t.id)) {
          seen.add(t.id);
          likedList.push(t);
        }
      }
      return likedList;
    }
    if (playlist.isCustom) {
      return playlist.songs || [];
    }
    const allKnown = [...tracks, ...FEATURED_ONLINE_TRACKS, ...BACKUP_STREAM_POOL];
    return (playlist.songIds || []).map(id => allKnown.find(t => t.id === id)).filter(Boolean);
  };

  const playPlaylistAll = (playlist) => {
    const playlistSongs = getPlaylistSongs(playlist);
    if (!playlistSongs || playlistSongs.length === 0) return;

    setTracks(playlistSongs);
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


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#121212] text-[#b3b3b3] select-none font-sans overflow-hidden">
      
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

      {/* Persistent YouTube Audio/Video Frame */}
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
          VIEW 1: Spotify Main Music Lounge & Browser
          ========================================================================= */}
      {viewMode === 'list' && (
        <div className="flex-1 flex flex-col w-full h-full overflow-hidden pb-20">
          
          {/* Spotify Top Header */}
          <div className="bg-[#121212]/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 border-b border-[#242424]/80 flex items-center justify-between gap-3 shrink-0">
            {/* Spotify Brand Logo */}
            <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => { setActiveTab('playlist'); setSelectedPlaylistView(null); }}>
              <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center text-black shadow-lg shadow-[#1ed760]/20">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.308c-.22.36-.684.475-1.044.255-2.862-1.748-6.463-2.144-10.707-1.173-.412.094-.823-.162-.917-.574-.094-.412.162-.823.574-.917 4.646-1.062 8.627-.615 11.84 1.365.36.22.474.684.254 1.044zm1.47-3.262c-.276.449-.865.594-1.314.318-3.276-2.013-8.27-2.597-12.145-1.421-.504.153-1.036-.134-1.189-.638-.153-.504.134-1.036.638-1.189 4.432-1.345 9.94-.7 13.692 1.616.449.276.594.865.318 1.314zm.126-3.41c-3.928-2.332-10.407-2.547-14.17-1.404-.602.183-1.24-.165-1.423-.767-.183-.602.165-1.24.767-1.423 4.331-1.314 11.488-1.062 15.992 1.613.541.321.717 1.026.396 1.567-.321.541-1.026.717-1.562.414z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-extrabold text-white tracking-tight">Spotify</span>
                <span className="text-[10px] text-[#1ed760] font-bold block -mt-1 tracking-wider uppercase">Music Lounge</span>
              </div>
            </div>

            {/* Spotify Centered Pill Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-auto">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to play?"
                  className="w-full pl-9 pr-8 py-2 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#242424] border border-transparent focus:border-white rounded-full text-xs sm:text-sm text-white placeholder-[#b3b3b3] focus:outline-none transition shadow-inner"
                />
                <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {onOpenInstall && (
                <button
                  onClick={onOpenInstall}
                  title="Install Spotify App"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs shadow transition active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Install App</span>
                </button>
              )}

              {currentTrack.isYoutube && (
                <button
                  onClick={() => setShowVideoMode(!showVideoMode)}
                  className={`p-2 rounded-full border transition active:scale-90 ${
                    showVideoMode ? 'bg-[#1ed760] border-[#1ed760] text-black' : 'bg-[#242424] border-transparent text-white hover:bg-[#2a2a2a]'
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
                className="p-2 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition active:scale-95 cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Discrete Help */}
              <button
                onClick={() => setShowHelpModal(true)}
                title="Info"
                className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full transition text-[11px]"
              >
                Help
              </button>
            </div>
          </div>

          {/* Spotify Filter Chips Row */}
          <div className="px-4 sm:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 bg-[#121212]">
            <button
              onClick={() => { setActiveTab('playlist'); setSelectedPlaylistView(null); }}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                activeTab === 'playlist'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              All
            </button>

            <button
              onClick={() => { setActiveTab('playlists'); setSelectedPlaylistView(null); }}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                activeTab === 'playlists'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Playlists
            </button>

            <button
              onClick={() => {
                const likedSongsList = getPlaylistSongs({ id: 'pl-liked' });
                setSelectedPlaylistView({
                  id: 'pl-liked',
                  title: 'Liked Songs',
                  description: 'All your favorite favorited tracks',
                  cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
                  gradient: 'from-[#1ed760] to-emerald-950',
                  badge: 'Favorites',
                  isLikedCollection: true,
                  songs: likedSongsList
                });
                setActiveTab('playlists');
              }}
              className="px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap bg-[#242424] text-white hover:bg-[#2a2a2a] flex items-center gap-1.5"
            >
              <Heart className="w-3 h-3 text-[#1ed760] fill-[#1ed760]" />
              <span>Liked Songs ({likedSongIds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                activeTab === 'trending'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Trending Hits
            </button>

            <button
              onClick={() => setActiveTab('phone')}
              className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                activeTab === 'phone'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              Phone Storage
            </button>

            {searchResults.length > 0 && (
              <button
                onClick={() => setActiveTab('search')}
                className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer font-semibold whitespace-nowrap ${
                  activeTab === 'search'
                    ? 'bg-white text-black shadow-md font-bold'
                    : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
                }`}
              >
                Search Results ({searchResults.length})
              </button>
            )}
          </div>

          {/* Main Scrollable Content */}
          <div
            ref={listScrollRef}
            onScroll={handleContainerScroll}
            className="flex-1 overflow-y-auto px-4 sm:px-8 pt-2 pb-28 space-y-6"
          >
            {/* TAB 0: Spotify Home Feed */}
            {activeTab === 'playlist' && (
              <div className="space-y-6">
                
                {/* Spotify Greeting & 6-Pack Quick Access Grid */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                    {getGreeting()}
                  </h1>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {/* Quick Card 1: Liked Songs */}
                    <div
                      onClick={() => {
                        const likedSongsList = getPlaylistSongs({ id: 'pl-liked' });
                        setSelectedPlaylistView({
                          id: 'pl-liked',
                          title: 'Liked Songs',
                          description: 'All your favorite favorited tracks',
                          cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
                          gradient: 'from-[#1ed760] to-emerald-950',
                          badge: 'Favorites',
                          isLikedCollection: true,
                          songs: likedSongsList
                        });
                        setActiveTab('playlists');
                      }}
                      className="group flex items-center bg-[#282828]/60 hover:bg-[#282828] rounded-[4px] overflow-hidden transition duration-200 cursor-pointer shadow-sm relative pr-2"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-tr from-[#1ed760] to-emerald-900 flex items-center justify-center text-white shrink-0 shadow">
                        <Heart className="w-6 h-6 fill-current" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-white px-3 truncate flex-1">Liked Songs</span>
                      <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1ed760] text-black shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 shrink-0">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    </div>

                    {/* Quick Cards 2-5: Curated Playlists */}
                    {CURATED_PLAYLISTS.slice(0, 5).map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          const plSongs = getPlaylistSongs(pl);
                          setSelectedPlaylistView({ ...pl, songs: plSongs });
                          setActiveTab('playlists');
                        }}
                        className="group flex items-center bg-[#282828]/60 hover:bg-[#282828] rounded-[4px] overflow-hidden transition duration-200 cursor-pointer shadow-sm relative pr-2"
                      >
                        <img
                          src={pl.cover}
                          alt={pl.title}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover shrink-0 shadow"
                        />
                        <span className="font-bold text-xs sm:text-sm text-white px-3 truncate flex-1">{pl.title}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            playPlaylistAll(pl);
                          }}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1ed760] text-black shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 shrink-0"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Made For You (Spotify Curated Cards) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Made For You</h2>
                    <button 
                      onClick={() => { setActiveTab('playlists'); setSelectedPlaylistView(null); }}
                      className="text-xs text-[#b3b3b3] hover:text-white font-bold hover:underline"
                    >
                      Show all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                    {CURATED_PLAYLISTS.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => {
                          const plSongs = getPlaylistSongs(pl);
                          setSelectedPlaylistView({ ...pl, songs: plSongs });
                          setActiveTab('playlists');
                        }}
                        className="bg-[#181818] hover:bg-[#282828] p-3 sm:p-3.5 rounded-lg transition-all duration-300 group cursor-pointer relative"
                      >
                        <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-lg mb-2.5 bg-[#282828]">
                          <img
                            src={pl.cover}
                            alt={pl.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playPlaylistAll(pl);
                            }}
                            className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 transition-all duration-200"
                            title="Play Playlist"
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                        </div>
                        <p className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition">{pl.title}</p>
                        <p className="text-[11px] text-[#b3b3b3] line-clamp-1 mt-0.5">{pl.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section: Today's Biggest Hits / All Songs Spotify Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Today's Biggest Hits</h2>
                      <p className="text-xs text-[#b3b3b3]">Endless non-stop streaming</p>
                    </div>
                    <span className="text-xs text-[#b3b3b3] font-mono">{tracks.length} tracks</span>
                  </div>

                  {/* Spotify Tracklist Table Header */}
                  <div className="grid grid-cols-12 text-[11px] font-semibold text-[#b3b3b3] px-3 py-2 border-b border-[#282828] uppercase tracking-wider">
                    <span className="col-span-1 text-center">#</span>
                    <span className="col-span-7 sm:col-span-6">Title</span>
                    <span className="hidden sm:block col-span-3">Album</span>
                    <span className="col-span-4 sm:col-span-2 text-right">Time</span>
                  </div>

                  {/* Track Rows */}
                  <div className="divide-y divide-transparent mt-1 space-y-0.5">
                    {tracks.map((track, idx) => {
                      const isCurrent = idx === currentTrackIndex;
                      const isTrackLiked = likedSongIds.includes(track.id);

                      return (
                        <div
                          key={track.id || idx}
                          onClick={() => {
                            setCurrentTrackIndex(idx);
                            setIsPlaying(true);
                          }}
                          className={`grid grid-cols-12 items-center px-3 py-2 rounded-md transition cursor-pointer group ${
                            isCurrent
                              ? 'bg-[#2a2a2a] text-[#1ed760]'
                              : 'hover:bg-[#2a2a2a]/70 text-[#b3b3b3]'
                          }`}
                        >
                          {/* Col 1: Index / Play Icon / Playing Equalizer */}
                          <div className="col-span-1 flex items-center justify-center text-xs font-mono">
                            {isCurrent && isPlaying ? (
                              <div className="flex items-end gap-0.5 h-3">
                                <span className="w-0.5 h-full bg-[#1ed760] animate-bounce" />
                                <span className="w-0.5 h-2 bg-[#1ed760] animate-bounce delay-75" />
                                <span className="w-0.5 h-3 bg-[#1ed760] animate-bounce delay-150" />
                              </div>
                            ) : (
                              <>
                                <span className="group-hover:hidden text-[#b3b3b3]">{idx + 1}</span>
                                <Play className="w-3.5 h-3.5 fill-current text-white hidden group-hover:block ml-0.5" />
                              </>
                            )}
                          </div>

                          {/* Col 2: Cover + Title & Artist */}
                          <div className="col-span-7 sm:col-span-6 flex items-center gap-3 min-w-0 pr-2">
                            <img
                              src={track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                              alt={track.title}
                              className="w-10 h-10 rounded object-cover shrink-0 shadow"
                            />
                            <div className="min-w-0">
                              <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white group-hover:underline'}`}>
                                {track.title}
                              </p>
                              <p className="text-[11px] text-[#b3b3b3] truncate group-hover:text-white">
                                {track.artist}
                              </p>
                            </div>
                          </div>

                          {/* Col 3: Album */}
                          <div className="hidden sm:block col-span-3 text-xs text-[#b3b3b3] truncate pr-2">
                            {track.album || (track.isLocal ? 'Phone Storage' : 'Single')}
                          </div>

                          {/* Col 4: Heart, Plus & Duration */}
                          <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-2 text-xs">
                            {/* Favorite Heart */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikeTrack(track);
                              }}
                              className={`p-1.5 rounded-full transition ${
                                isTrackLiked 
                                  ? 'text-[#1ed760] opacity-100' 
                                  : 'text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100'
                              }`}
                              title="Save to Liked Songs"
                            >
                              <Heart className={`w-4 h-4 ${isTrackLiked ? 'fill-current' : ''}`} />
                            </button>

                            {/* Add to Playlist */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddToPlaylistTrack(track);
                              }}
                              className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full transition opacity-0 group-hover:opacity-100"
                              title="Add to Playlist"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            {/* Duration */}
                            <span className="font-mono text-[#b3b3b3] w-10 text-right">
                              {track.durationText || '3:30'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Infinite Scroll Sentinel & Loader */}
                  <div ref={sentinelRef} className="py-6 text-center">
                    {isLoadingMore ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-[#1ed760] font-medium py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#1ed760]" />
                        <span>Loading more tracks...</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#757575] py-2 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
                        <span>Scroll for endless music flow</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: Playlists */}
            {activeTab === 'playlists' && (
              <div className="space-y-6 pb-6">
                {!selectedPlaylistView ? (
                  <>
                    {/* Playlists Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Library</h1>
                        <p className="text-xs text-[#b3b3b3] mt-0.5">Playlists, collections & saved music</p>
                      </div>
                      <button
                        onClick={() => setShowCreatePlaylistModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Playlist</span>
                      </button>
                    </div>

                    {/* Liked Songs Hero Banner */}
                    <div
                      onClick={() => {
                        const likedSongsList = getPlaylistSongs({ id: 'pl-liked' });
                        setSelectedPlaylistView({
                          id: 'pl-liked',
                          title: 'Liked Songs',
                          description: 'All your favorite favorited tracks',
                          cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
                          gradient: 'from-[#1ed760] to-emerald-950',
                          badge: 'Favorites',
                          isLikedCollection: true,
                          songs: likedSongsList
                        });
                      }}
                      className="p-5 sm:p-6 rounded-lg bg-gradient-to-br from-[#1ed760] via-emerald-800 to-[#181818] transition cursor-pointer flex flex-col justify-between group shadow-xl active:scale-[0.99] min-h-[140px] relative overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center text-white shrink-0">
                          <Heart className="w-6 h-6 fill-white" />
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-extrabold text-white">Liked Songs</p>
                          <p className="text-xs text-white/80">{likedSongIds.length} liked songs</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">Automatic Collection</span>
                        <div className="w-11 h-11 rounded-full bg-black text-[#1ed760] flex items-center justify-center shadow-xl group-hover:scale-105 transition">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Curated Playlists Section */}
                    <div className="space-y-3">
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Curated By Spotify</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {CURATED_PLAYLISTS.map((pl) => {
                          const plSongs = getPlaylistSongs(pl);
                          return (
                            <div
                              key={pl.id}
                              onClick={() => setSelectedPlaylistView({ ...pl, songs: plSongs })}
                              className="bg-[#181818] hover:bg-[#282828] p-3 sm:p-3.5 rounded-lg transition-all duration-300 group cursor-pointer relative"
                            >
                              <div className="relative aspect-square w-full rounded-md overflow-hidden shadow-lg mb-2.5 bg-[#282828]">
                                <img
                                  src={pl.cover}
                                  alt={pl.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider">
                                  {pl.badge}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPlaylistAll(pl);
                                  }}
                                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 transition-all duration-200"
                                  title="Play Playlist"
                                >
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </button>
                              </div>
                              <p className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition">{pl.title}</p>
                              <p className="text-[11px] text-[#b3b3b3] line-clamp-1 mt-0.5">{plSongs.length} Tracks</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom User Playlists Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Custom Playlists</h2>
                        <span className="text-xs text-[#b3b3b3] font-mono">{customPlaylists.length} created</span>
                      </div>

                      {customPlaylists.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                          {customPlaylists.map((pl) => (
                            <div
                              key={pl.id}
                              onClick={() => setSelectedPlaylistView(pl)}
                              className="bg-[#181818] hover:bg-[#282828] p-3 sm:p-3.5 rounded-lg transition-all duration-300 group cursor-pointer relative"
                            >
                              <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#242424] flex items-center justify-center text-[#b3b3b3] group-hover:text-[#1ed760] mb-2.5 shadow-inner">
                                <ListMusic className="w-10 h-10" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playPlaylistAll(pl);
                                  }}
                                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 transition-all duration-200"
                                  title="Play Playlist"
                                >
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                </button>
                              </div>
                              <p className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#1ed760] transition">{pl.title}</p>
                              <p className="text-[11px] text-[#b3b3b3] truncate mt-0.5">{pl.songs?.length || 0} Tracks</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onClick={() => setShowCreatePlaylistModal(true)}
                          className="p-8 rounded-xl border border-dashed border-[#3e3e3e] hover:border-[#1ed760] bg-[#181818]/60 text-center cursor-pointer transition group"
                        >
                          <Plus className="w-8 h-8 text-[#b3b3b3] group-hover:text-[#1ed760] mx-auto mb-2 transition" />
                          <p className="text-sm font-bold text-white">Create your first playlist</p>
                          <p className="text-xs text-[#b3b3b3] mt-1">It's easy, we'll help you collect your favorite songs.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Detail View of Selected Playlist (Spotify Album View) */
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <button
                      onClick={() => setSelectedPlaylistView(null)}
                      className="flex items-center gap-2 text-xs text-[#b3b3b3] hover:text-white font-bold transition cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Library</span>
                    </button>

                    {/* Spotify Album Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 pb-2">
                      <img
                        src={selectedPlaylistView.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80'}
                        alt={selectedPlaylistView.title}
                        className="w-36 h-36 sm:w-52 sm:h-52 rounded-md object-cover shadow-2xl shrink-0"
                      />
                      <div className="space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#b3b3b3]">
                          Playlist
                        </span>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                          {selectedPlaylistView.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-[#b3b3b3] line-clamp-2">
                          {selectedPlaylistView.description}
                        </p>
                        <p className="text-xs text-white font-semibold flex items-center gap-1.5 pt-1">
                          <span className="text-[#1ed760]">Spotify</span> • <span>{getPlaylistSongs(selectedPlaylistView).length} songs</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Bar (Giant Spotify Green Play Button) */}
                    <div className="flex items-center gap-4 py-2 border-b border-[#282828]">
                      <button
                        onClick={() => playPlaylistAll(selectedPlaylistView)}
                        disabled={getPlaylistSongs(selectedPlaylistView).length === 0}
                        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1ed760] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-2xl disabled:opacity-40 transition cursor-pointer"
                        title="Play All"
                      >
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </button>

                      {selectedPlaylistView.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomPlaylist(selectedPlaylistView.id, e)}
                          className="p-2.5 text-[#b3b3b3] hover:text-rose-400 hover:bg-[#282828] rounded-full transition cursor-pointer"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Tracklist Inside Playlist */}
                    <div className="divide-y divide-transparent space-y-0.5">
                      {getPlaylistSongs(selectedPlaylistView).map((track, idx) => {
                        const isCurrent = track.id === currentTrack.id;
                        return (
                          <div
                            key={track.id || idx}
                            onClick={() => playTrackNow(track)}
                            className={`grid grid-cols-12 items-center px-3 py-2 rounded-md transition cursor-pointer group ${
                              isCurrent ? 'bg-[#2a2a2a] text-[#1ed760]' : 'hover:bg-[#2a2a2a]/70 text-[#b3b3b3]'
                            }`}
                          >
                            <div className="col-span-1 flex items-center justify-center text-xs font-mono">
                              {isCurrent && isPlaying ? (
                                <div className="flex items-end gap-0.5 h-3">
                                  <span className="w-0.5 h-full bg-[#1ed760] animate-bounce" />
                                  <span className="w-0.5 h-2 bg-[#1ed760] animate-bounce delay-75" />
                                  <span className="w-0.5 h-3 bg-[#1ed760] animate-bounce delay-150" />
                                </div>
                              ) : (
                                <>
                                  <span className="group-hover:hidden text-[#b3b3b3]">{idx + 1}</span>
                                  <Play className="w-3.5 h-3.5 fill-current text-white hidden group-hover:block ml-0.5" />
                                </>
                              )}
                            </div>

                            <div className="col-span-8 sm:col-span-7 flex items-center gap-3 min-w-0 pr-2">
                              <img
                                src={track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                                alt={track.title}
                                className="w-10 h-10 rounded object-cover shrink-0 shadow"
                              />
                              <div className="min-w-0">
                                <p className={`text-xs sm:text-sm font-semibold truncate ${isCurrent ? 'text-[#1ed760]' : 'text-white group-hover:underline'}`}>
                                  {track.title}
                                </p>
                                <p className="text-[11px] text-[#b3b3b3] truncate group-hover:text-white">
                                  {track.artist}
                                </p>
                              </div>
                            </div>

                            <div className="col-span-3 sm:col-span-4 flex items-center justify-end gap-2 text-xs">
                              {selectedPlaylistView.isCustom && (
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveSongFromPlaylist(selectedPlaylistView.id, track.id, e)}
                                  className="p-1.5 text-[#b3b3b3] hover:text-rose-400 rounded-full transition"
                                  title="Remove from playlist"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <span className="font-mono text-[#b3b3b3]">
                                {track.durationText || '3:30'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {getPlaylistSongs(selectedPlaylistView).length === 0 && (
                        <div className="text-center py-16 text-[#b3b3b3] text-xs">
                          <ListMusic className="w-10 h-10 mx-auto mb-2 text-[#4d4d4d]" />
                          <p className="font-bold text-white text-sm">It's a bit empty here</p>
                          <p className="text-[#b3b3b3] mt-1">Search for songs or tap '+' in All Songs to add them to this playlist.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: Search Results */}
            {activeTab === 'search' && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Search Results</h2>
                <div className="divide-y divide-transparent space-y-0.5">
                  {searchResults.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => playTrackNow(item)}
                      className="grid grid-cols-12 items-center px-3 py-2 rounded-md hover:bg-[#2a2a2a]/70 cursor-pointer transition group text-[#b3b3b3]"
                    >
                      <div className="col-span-1 text-center font-mono text-xs text-[#b3b3b3]">
                        {idx + 1}
                      </div>
                      <div className="col-span-9 sm:col-span-8 flex items-center gap-3 min-w-0 pr-2">
                        <img
                          src={item.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                          alt={item.title}
                          className="w-10 h-10 rounded object-cover shrink-0 shadow"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:underline">{item.title}</p>
                          <p className="text-[11px] text-[#b3b3b3] truncate">{item.artist}</p>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddToPlaylistTrack(item);
                          }}
                          className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full transition"
                          title="Add to Playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length === 0 && !isSearching && (
                    <div className="text-center py-16 text-[#b3b3b3] text-xs">
                      <Search className="w-10 h-10 mx-auto mb-2 text-[#4d4d4d]" />
                      <p className="font-bold text-white text-sm">Play what you love</p>
                      <p className="text-[#b3b3b3] mt-1">Search for artists, songs, podcasts, or YouTube links.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Trending Hits */}
            {activeTab === 'trending' && (
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-white">Trending Hits Now</h2>
                <div className="divide-y divide-transparent space-y-0.5">
                  {FEATURED_ONLINE_TRACKS.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => playTrackNow(item)}
                      className="grid grid-cols-12 items-center px-3 py-2 rounded-md hover:bg-[#2a2a2a]/70 cursor-pointer transition group text-[#b3b3b3]"
                    >
                      <div className="col-span-1 text-center font-mono text-xs text-[#b3b3b3]">
                        {idx + 1}
                      </div>
                      <div className="col-span-9 sm:col-span-8 flex items-center gap-3 min-w-0 pr-2">
                        <img
                          src={item.artwork}
                          alt={item.title}
                          className="w-10 h-10 rounded object-cover shrink-0 shadow"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:underline">{item.title}</p>
                          <p className="text-[11px] text-[#b3b3b3] truncate">{item.artist}</p>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Phone Storage */}
            {activeTab === 'phone' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Phone Local Audio</h2>
                    <p className="text-xs text-[#b3b3b3]">Listen to downloaded MP3 files offline</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-xs flex items-center gap-2 shadow transition active:scale-95 cursor-pointer"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Import Audio Files</span>
                  </button>
                </div>

                <div className="divide-y divide-transparent space-y-0.5">
                  {tracks.filter(t => t.isLocal).map((track, idx) => (
                    <div
                      key={track.id}
                      onClick={() => playTrackNow(track)}
                      className="grid grid-cols-12 items-center px-3 py-2 rounded-md hover:bg-[#2a2a2a]/70 cursor-pointer transition group text-[#b3b3b3]"
                    >
                      <div className="col-span-1 text-center font-mono text-xs text-[#b3b3b3]">
                        {idx + 1}
                      </div>
                      <div className="col-span-9 sm:col-span-8 min-w-0 pr-2">
                        <p className="font-semibold text-xs sm:text-sm text-white truncate group-hover:underline">{track.title}</p>
                        <p className="text-[11px] text-[#b3b3b3]">{track.artist}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-3 flex items-center justify-end">
                        <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {tracks.filter(t => t.isLocal).length === 0 && (
                    <div className="text-center py-16 text-[#b3b3b3] text-xs">
                      <Smartphone className="w-10 h-10 mx-auto mb-2 text-[#4d4d4d]" />
                      <p className="font-bold text-white text-sm">No local tracks imported</p>
                      <p className="text-[#b3b3b3] mt-1">Tap 'Import Audio Files' above to load your offline songs.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Spotify Fixed Bottom Player Bar (Classic 3-column Spotify Player) */}
          <div className="fixed bottom-0 inset-x-0 z-40 bg-[#181818] border-t border-[#282828] px-3 sm:px-6 py-2 sm:py-3 shadow-2xl flex items-center justify-between gap-3 sm:gap-6 h-20 sm:h-22 select-none">
            
            {/* Column 1 (Left): Currently Playing Song Info */}
            <div className="flex items-center gap-3 min-w-0 w-[45%] sm:w-[30%]">
              <div 
                onClick={() => setViewMode('nowPlaying')}
                className="relative shrink-0 cursor-pointer group"
                title="Open Now Playing View"
              >
                <img
                  src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                  alt={currentTrack.title}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover shadow"
                />
              </div>

              <div className="min-w-0 pr-1">
                <p 
                  onClick={() => setViewMode('nowPlaying')}
                  className="text-xs sm:text-sm font-semibold text-white truncate hover:underline cursor-pointer"
                >
                  {currentTrack.title}
                </p>
                <p 
                  onClick={() => setViewMode('nowPlaying')}
                  className="text-[11px] text-[#b3b3b3] truncate hover:underline cursor-pointer"
                >
                  {currentTrack.artist}
                </p>
              </div>

              {/* Like Button */}
              <button
                onClick={handleHeartClick}
                className={`p-1.5 rounded-full transition shrink-0 ${
                  isLiked || likedSongIds.includes(currentTrack.id)
                    ? 'text-[#1ed760]'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
                title="Save to Liked Songs (Tap 3x to unlock chat)"
              >
                <Heart className={`w-4 h-4 ${isLiked || likedSongIds.includes(currentTrack.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Column 2 (Center): Playback Controls & Timeline Scrubber */}
            <div className="flex flex-col items-center justify-center flex-1 max-w-lg w-[45%]">
              {/* Controls Row */}
              <div className="flex items-center gap-3 sm:gap-5 mb-1.5">
                <button
                  onClick={() => setIsShuffle(s => !s)}
                  className={`p-1 rounded-full transition ${isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'}`}
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePrevTrack}
                  className="text-[#b3b3b3] hover:text-white transition active:scale-90 cursor-pointer p-1"
                  title="Previous Track"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition shadow cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="text-[#b3b3b3] hover:text-white transition active:scale-90 cursor-pointer p-1"
                  title="Next Track"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                <button
                  onClick={() => setIsRepeat(r => !r)}
                  className={`p-1 rounded-full transition ${isRepeat ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'}`}
                  title="Repeat"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Scrub Bar */}
              <div className="w-full flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#b3b3b3] w-9 text-right shrink-0">
                  {formatTime(currentTime)}
                </span>
                <div 
                  onClick={handleSeek}
                  className="relative flex-1 h-1 hover:h-2 bg-[#4d4d4d] rounded-full cursor-pointer group transition-all duration-150"
                >
                  <div 
                    className="h-full bg-[#1ed760] rounded-full transition-all duration-100 relative"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow transition-opacity" />
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#b3b3b3] w-9 text-left shrink-0">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Column 3 (Right): Volume & Utility Buttons */}
            <div className="hidden sm:flex items-center justify-end gap-3 w-[25%]">
              <button
                onClick={handleEqualizerClick}
                className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition cursor-pointer"
                title="Sound Equalizer"
              >
                <Sliders className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 max-w-[130px] w-full">
                <button
                  onClick={() => setIsMuted(m => !m)}
                  className="text-[#b3b3b3] hover:text-white transition"
                  title={isMuted ? "Unmute" : "Mute"}
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
                  className="w-full h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
                />
              </div>

              <button
                onClick={() => setViewMode('nowPlaying')}
                className="p-1.5 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#242424] transition"
                title="Expand Full Screen"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Expand Button (visible only on xs screens) */}
            <div className="sm:hidden flex items-center gap-1">
              <button
                onClick={() => setViewMode('nowPlaying')}
                className="p-2 text-[#b3b3b3] hover:text-white"
                title="Open Full Screen"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: Spotify Full "Now Playing" Screen (Expands on Cover / Tap)
          ========================================================================= */}
      {viewMode === 'nowPlaying' && (
        <div className="flex-1 flex flex-col justify-between w-full max-w-lg mx-auto h-full p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between w-full pt-1">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#282828] transition cursor-pointer"
              title="Return to Songs List"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#b3b3b3] block">
                Playing from playlist
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[200px] block">
                {selectedPlaylistView?.title || "Today's Top Hits"}
              </span>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {currentTrack.isYoutube && (
                <button
                  onClick={() => setShowVideoMode(!showVideoMode)}
                  className={`p-2 rounded-full border transition active:scale-90 ${
                    showVideoMode ? 'bg-[#1ed760] border-[#1ed760] text-black' : 'bg-[#282828] border-transparent text-[#b3b3b3] hover:text-white'
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
                className="p-2 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#282828] transition"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Album Art & Live Waveform */}
          <div className="flex flex-col items-center justify-center my-auto w-full py-4">
            <div 
              onClick={handleCoverTap}
              className="relative group cursor-pointer"
              title="Triple-tap cover to unlock secret vault"
            >
              {/* Spotify Modern Square Canvas / Vinyl Art */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#282828] group-hover:scale-[1.02] transition-transform duration-300">
                <img 
                  src={currentTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80'} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Equalizer Live Visualizer Waveform */}
              {isPlaying && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#282828] shadow-xl">
                  <div className="w-1 h-3 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-5 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-7 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-1 h-4 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                  <div className="w-1 h-6 bg-[#1ed760] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                </div>
              )}
            </div>

            {/* Track Title & Artist */}
            <div className="w-full flex items-center justify-between mt-8 px-2">
              <div className="min-w-0 pr-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-sm text-[#b3b3b3] mt-1 truncate">
                  {currentTrack.artist}
                </p>
              </div>

              <button
                onClick={handleHeartClick}
                className={`p-2 rounded-full transition active:scale-125 ${
                  isLiked || likedSongIds.includes(currentTrack.id)
                    ? 'text-[#1ed760]'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
                title="Save to Favorites (Tap 3 times to unlock chat)"
              >
                <Heart className={`w-6 h-6 ${isLiked || likedSongIds.includes(currentTrack.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="w-full space-y-4 pb-4">
            {/* Progress Bar & Timestamps */}
            <div className="space-y-1.5">
              <div 
                onClick={handleSeek}
                className="relative w-full h-1.5 hover:h-2.5 bg-[#4d4d4d] rounded-full cursor-pointer group transition-all duration-150"
              >
                <div 
                  className="h-full bg-white group-hover:bg-[#1ed760] rounded-full transition-all duration-100 relative"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#b3b3b3] font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setIsShuffle(s => !s)}
                className={`p-2 rounded-full transition ${
                  isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-6">
                <button
                  onClick={handlePrevTrack}
                  className="p-2 text-[#b3b3b3] hover:text-white transition active:scale-90 cursor-pointer"
                  title="Previous Track"
                >
                  <SkipBack className="w-7 h-7 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextTrack}
                  className="p-2 text-[#b3b3b3] hover:text-white transition active:scale-90 cursor-pointer"
                  title="Next Track"
                >
                  <SkipForward className="w-7 h-7 fill-current" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsRepeat(r => !r)}
                  className={`p-2 rounded-full transition ${
                    isRepeat ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
                  }`}
                  title="Repeat"
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Volume Slider Bar */}
            <div className="flex items-center gap-3 px-3 pt-2 text-[#b3b3b3]">
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
                className="w-full h-1 bg-[#4d4d4d] rounded-lg appearance-none cursor-pointer accent-[#1ed760]"
              />
            </div>

          </div>

        </div>
      )}

      {/* First Time Security Passcode Setup Modal */}
      {showSetupPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#282828] border border-[#3e3e3e] rounded-2xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm tracking-wide">
                <KeyRound className="w-5 h-5" />
                <span>Security PIN Setup</span>
              </div>
              <button
                onClick={() => setShowSetupPinModal(false)}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#b3b3b3] leading-relaxed">
              Set your personal PINs for disguise unlocking. You can set a real PIN and an optional decoy PIN.
            </p>

            <form onSubmit={handleSetupPinSubmit} className="space-y-4">
              {/* Secret PIN (Primary) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Secret PIN (Real) <span className="text-red-400">*</span></span>
                  <span className="text-[10px] text-[#1ed760]">Opens Real Chat</span>
                </label>
                <div className="relative">
                  <input
                    type={showSetupSecretEye ? "text" : "password"}
                    value={setupSecretPin}
                    onChange={(e) => { setSetupSecretPin(e.target.value.replace(/\D/g, '').slice(0, 8)); setSetupError(''); }}
                    placeholder="e.g. 1234"
                    maxLength={8}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupSecretEye(!showSetupSecretEye)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition"
                  >
                    {showSetupSecretEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Decoy PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Decoy PIN (Optional)</span>
                  <span className="text-[10px] text-amber-400">Opens Fake Notes</span>
                </label>
                <div className="relative">
                  <input
                    type={showSetupDecoyEye ? "text" : "password"}
                    value={setupDecoyPin}
                    onChange={(e) => { setSetupDecoyPin(e.target.value.replace(/\D/g, '').slice(0, 8)); setSetupError(''); }}
                    placeholder="Optional (e.g. 9999)"
                    maxLength={8}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-amber-500 rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSetupDecoyEye(!showSetupDecoyEye)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition"
                  >
                    {showSetupDecoyEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {setupError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{setupError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSetupPinModal(false)}
                  className="flex-1 py-2.5 bg-[#333] hover:bg-[#3e3e3e] text-white rounded-full text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#1ed760] hover:bg-[#1db954] text-black rounded-full text-xs font-bold transition shadow-lg shadow-[#1ed760]/20"
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
          <div className="w-full max-w-xs bg-[#282828] border border-[#3e3e3e] rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-xs tracking-wider uppercase">
                <Sliders className="w-4 h-4" />
                <span>EQ Sound Profile</span>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#b3b3b3]">
              Enter customized acoustic preset code:
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
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-sm text-white font-mono text-center tracking-widest focus:outline-none pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCodeEye(!showCodeEye)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white transition"
                >
                  {showCodeEye ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {codeError && (
                <p className="text-[11px] text-amber-400 text-center font-medium">
                  {codeError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="flex-1 py-2 bg-[#333] hover:bg-[#3e3e3e] text-white rounded-full text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#1ed760] hover:bg-[#1db954] text-black rounded-full text-xs font-bold transition shadow-lg shadow-[#1ed760]/20"
                >
                  Apply EQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help Guide */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs bg-[#282828] border border-[#3e3e3e] rounded-2xl p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm">
              <Music className="w-4 h-4" />
              <span>Spotify Music Player</span>
            </div>
            
            <div className="text-xs text-[#b3b3b3] space-y-2 leading-relaxed">
              <p>Enjoy endless streaming music, curated playlists, and phone storage playback in Spotify theme.</p>
              
              <div className="p-3 rounded-xl bg-[#181818] border border-[#3e3e3e] space-y-1.5 text-[11px] font-mono text-white">
                <p className="text-[#1ed760]">⚡ <strong>Unlock chat vault:</strong></p>
                <p>• <strong>Triple-tap</strong> the album cover</p>
                <p>• Or tap the <strong>Heart ❤️</strong> icon 3 times</p>
                <p>• Or tap <strong>EQ icon</strong> and enter PIN <span className="text-amber-400">{secretPin}</span></p>
                <p className="text-cyan-300 pt-1">• <strong>Decoy Mode:</strong> EQ PIN <span className="text-cyan-400">{decoyPin}</span></p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-white hover:bg-slate-200 text-black font-bold rounded-full text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create New Playlist Modal (Spotify Style) */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#282828] border border-[#3e3e3e] rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm">
                <ListMusic className="w-5 h-5" />
                <span>Create Playlist</span>
              </div>
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#b3b3b3]">Name</label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Playlist #1"
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-xs text-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#b3b3b3]">Description (Optional)</label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Add an optional description"
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="flex-1 py-2 bg-[#333] hover:bg-[#3e3e3e] text-white rounded-full text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 py-2 bg-[#1ed760] hover:bg-[#1db954] disabled:opacity-50 text-black rounded-full text-xs font-bold transition shadow-lg shadow-[#1ed760]/20 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Song to Playlist Modal (Spotify Style) */}
      {addToPlaylistTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#282828] border border-[#3e3e3e] rounded-2xl p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm">
                <Plus className="w-5 h-5" />
                <span>Add to playlist</span>
              </div>
              <button
                onClick={() => setAddToPlaylistTrack(null)}
                className="p-1 text-[#b3b3b3] hover:text-white rounded-lg hover:bg-[#333] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Song Preview */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#181818] border border-[#3e3e3e]">
              <img
                src={addToPlaylistTrack.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&q=80'}
                alt={addToPlaylistTrack.title}
                className="w-11 h-11 rounded object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{addToPlaylistTrack.title}</p>
                <p className="text-[10px] text-[#b3b3b3] truncate">{addToPlaylistTrack.artist}</p>
              </div>
            </div>

            {/* 1-Tap Toggle: Liked Songs */}
            <button
              type="button"
              onClick={() => toggleLikeTrack(addToPlaylistTrack)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#181818] border border-[#3e3e3e] hover:border-[#1ed760] transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Heart className={`w-4 h-4 ${likedSongIds.includes(addToPlaylistTrack.id) ? 'fill-[#1ed760] text-[#1ed760]' : 'text-[#b3b3b3]'}`} />
                <span className="text-xs font-semibold text-white">Liked Songs</span>
              </div>
              <span className="text-[10px] font-bold text-[#1ed760]">
                {likedSongIds.includes(addToPlaylistTrack.id) ? 'Added ✓' : '+ Add'}
              </span>
            </button>

            {/* List of Custom Playlists */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <p className="text-[10px] uppercase font-bold text-[#b3b3b3] px-1">Your Playlists</p>
              {customPlaylists.length > 0 ? (
                customPlaylists.map((pl) => {
                  const alreadyInPlaylist = (pl.songs || []).some(s => s.id === addToPlaylistTrack.id);
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => handleAddSongToPlaylist(pl.id, addToPlaylistTrack)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#181818] hover:bg-[#333] border border-[#3e3e3e] hover:border-[#1ed760] transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ListMusic className="w-4 h-4 text-[#1ed760] shrink-0" />
                        <span className="text-xs font-medium text-white truncate">{pl.title}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-[#1ed760] shrink-0">
                        {alreadyInPlaylist ? 'Added ✓' : '+ Add'}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-center py-4 text-[11px] text-[#b3b3b3]">
                  No custom playlists yet. Create one below!
                </p>
              )}
            </div>

            {/* Quick Create New Playlist Button */}
            <button
              type="button"
              onClick={() => {
                setShowCreatePlaylistModal(true);
              }}
              className="w-full py-2.5 rounded-full border border-dashed border-[#3e3e3e] hover:border-[#1ed760] text-[#1ed760] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Playlist</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
