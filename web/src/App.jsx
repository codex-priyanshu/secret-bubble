import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Shield, Lock, Globe, EyeOff, Bot, Sparkles } from 'lucide-react';
import ChatHeader from './components/ChatHeader';
import MessageItem from './components/MessageItem';
import ChatInput from './components/ChatInput';
import BiometricModal from './components/BiometricModal';
import PrivacySettingsModal from './components/PrivacySettingsModal';
import ProfileModal from './components/ProfileModal';
import UserSidebar from './components/UserSidebar';
import LoginPage from './components/LoginPage';
import AppLockModal from './components/AppLockModal';
import AiTrainingModal from './components/AiTrainingModal';
import CreateGroupModal from './components/CreateGroupModal';
import { useBiometrics } from './hooks/useBiometrics';

const getBackendUrl = () => {
  if (import.meta.env?.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:5000`;
};

const DEFAULT_SETTINGS = {
  aiEnabled: true,
  autoRelockSeconds: 15,
  antiShoulderSurfing: true,
  idleLockMinutes: 5,
  categories: {
    adult_intimacy: true,
    romance_feelings: true,
    secrets_confidential: true,
    financial_credentials: true
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('secure_chat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('secure_chat_token') || null;
  });

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState({ type: 'room', id: 'global', name: '🌍 Global Public Chat' });
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAiTrainingOpen, setIsAiTrainingOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [unlockedPasscodeTexts, setUnlockedPasscodeTexts] = useState({});

  const selectedTargetRef = useRef(selectedTarget);
  useEffect(() => {
    selectedTargetRef.current = selectedTarget;
  }, [selectedTarget]);

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const backendUrl = useMemo(() => getBackendUrl(), []);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('secure_chat_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('secure_chat_settings', JSON.stringify(newSettings));
    } catch {}
  };

  const handleUpdateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('secure_chat_user', JSON.stringify(updatedUser));
    } catch {}
    fetchUsers();
  };

  const messagesEndRef = useRef(null);

  const {
    isWebAuthnSupported,
    activePromptMsg,
    triggerUnlock,
    completeUnlock,
    cancelUnlock,
    relockMessage,
    relockAll,
    isUnlocked,
    getRemainingSeconds
  } = useBiometrics(settings.autoRelockSeconds);

  // Anti-Shoulder Surfing Window Blur Protection
  useEffect(() => {
    if (!settings.antiShoulderSurfing) return;

    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [settings.antiShoulderSurfing]);

  // Automatic Idle Inactivity Lock Timer
  useEffect(() => {
    if (!settings.idleLockMinutes || settings.idleLockMinutes <= 0 || isAppLocked || !currentUser) {
      return;
    }

    let idleTimeoutId;
    const timeoutMs = settings.idleLockMinutes * 60 * 1000;

    const resetIdleTimer = () => {
      clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => {
        setIsAppLocked(true);
      }, timeoutMs);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, resetIdleTimer, { passive: true }));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeoutId);
      events.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [settings.idleLockMinutes, isAppLocked, currentUser]);

  // Disappearing messages local cleanup
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setMessages(prev => {
        const remaining = prev.filter(m => !m.expiresAt || now < m.expiresAt);
        if (remaining.length !== prev.length) return remaining;
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Users List
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      // Offline fallback: Meta AI Bot
      setUsers([
        {
          id: 'user-meta-ai',
          username: 'meta_ai',
          name: 'Meta AI Assistant',
          isBot: true,
          avatarColor: 'from-blue-600 via-indigo-500 to-cyan-400',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=MetaAI&backgroundColor=6366f1',
          isOnline: true
        }
      ]);
    }
  }, [backendUrl]);

  // Fetch Groups List
  const fetchGroups = useCallback(async () => {
    if (!currentUserRef.current) return;
    try {
      const res = await fetch(`${backendUrl}/api/groups?userId=${currentUserRef.current.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.groups)) {
        setGroups(data.groups);
      }
    } catch (e) {}
  }, [backendUrl]);

  // Fetch Messages for current selected target
  const fetchMessages = useCallback(async () => {
    if (!currentUserRef.current) return;
    try {
      const currentTarget = selectedTargetRef.current;
      let url = `${backendUrl}/api/messages`;
      if (currentTarget.type === 'room') {
        url += `?roomId=${currentTarget.id}`;
      } else {
        url += `?userId=${currentUserRef.current.id}&targetId=${currentTarget.id}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
        
        // Mark viewed
        if (socket && data.messages.length > 0) {
          const unviewedIds = data.messages
            .filter(m => !m.viewers || !m.viewers.includes(currentUserRef.current.id))
            .map(m => m.id);
          if (unviewedIds.length > 0) {
            socket.emit('mark_viewed', { messageIds: unviewedIds, viewerId: currentUserRef.current.id });
          }
        }
      }
    } catch (e) {}
  }, [backendUrl, socket]);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchGroups();
      fetchMessages();
    }
  }, [currentUser, selectedTarget, fetchUsers, fetchGroups, fetchMessages]);

  // Socket.io Connection Setup with Cryptographic Token
  useEffect(() => {
    if (!currentUser) return;

    const s = io(backendUrl, {
      reconnectionAttempts: 10,
      timeout: 5000,
      auth: {
        token: authToken
      }
    });

    s.on('connect', () => {
      setConnectionStatus('connected');
      s.emit('user_online', currentUser);
      fetchUsers();
      fetchGroups();
    });

    s.on('online_users_update', (onlineIds) => {
      setUsers(prev => {
        const hasMissingUser = Array.isArray(onlineIds) && onlineIds.some(id => id !== 'user-meta-ai' && !prev.some(u => u.id === id));
        if (hasMissingUser) {
          fetchUsers();
        }
        return prev.map(u => ({
          ...u,
          isOnline: u.isBot ? true : onlineIds.includes(u.id)
        }));
      });
    });

    s.on('user_registered', (newUser) => {
      setUsers(prev => {
        if (prev.some(u => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
    });

    s.on('user_updated', () => {
      fetchUsers();
    });

    s.on('group_created', (newGroup) => {
      setGroups(prev => {
        if (prev.some(g => g.id === newGroup.id)) return prev;
        return [newGroup, ...prev];
      });
    });

    s.on('new_message', (msg) => {
      const currentTarget = selectedTargetRef.current;
      const user = currentUserRef.current;
      if (!user) return;

      const isForCurrentTarget =
        currentTarget.type === 'room'
          ? (!msg.recipientId && msg.roomId === currentTarget.id)
          : (currentTarget.type === 'user' &&
              !msg.roomId &&
              ((msg.senderId === currentTarget.id && msg.recipientId === user.id) ||
               (msg.senderId === user.id && msg.recipientId === currentTarget.id)));

      if (isForCurrentTarget) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Auto mark as viewed
        s.emit('mark_viewed', { messageIds: [msg.id], viewerId: user.id });
      } else if (msg.recipientId === user.id && msg.senderId !== user.id) {
        const fromId = msg.senderId;
        setUnreadCounts(prev => ({
          ...prev,
          [fromId]: (prev[fromId] || 0) + 1
        }));
      }
    });

    s.on('message_edited', ({ messageId, newText, isEdited, isLocked, category }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return { ...m, text: newText, isEdited: true, isLocked, category };
        }
        return m;
      }));
    });

    s.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    s.on('views_updated', ({ messageId, viewers, viewsCount }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          return { ...m, viewers: viewers || (m.viewers ? [...m.viewers] : []) };
        }
        return m;
      }));
    });

    s.on('user_typing', (data) => {
      const user = currentUserRef.current;
      if (user && data.senderId !== user.id) {
        setTypingUsers(prev => ({ ...prev, [data.senderId]: true }));
      }
    });

    s.on('stop_typing', (data) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[data.senderId];
        return next;
      });
    });

    s.on('chat_reset', () => {
      setMessages([]);
      relockAll();
    });

    s.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [currentUser?.id, backendUrl, fetchUsers, relockAll]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (msgData) => {
    if (!currentUser) return;

    const isDirect = selectedTarget.type === 'user';
    const payload = {
      ...msgData,
      sender: currentUser.name,
      senderId: currentUser.id,
      senderAvatar: currentUser.avatarUrl || null,
      recipientId: isDirect ? selectedTarget.id : null,
      roomId: isDirect ? null : (selectedTarget.id || 'global')
    };

    if (socket && connectionStatus === 'connected') {
      socket.emit('send_message', payload);
    } else {
      const localMsg = {
        ...payload,
        id: 'msg-' + Date.now(),
        viewers: [currentUser.id],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, localMsg]);

      // Offline Meta AI response fallback
      if (payload.recipientId === 'user-meta-ai') {
        setTimeout(() => {
          const aiMsg = {
            id: 'msg-' + (Date.now() + 1),
            sender: 'Meta AI Assistant',
            senderId: 'user-meta-ai',
            senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MetaAI&backgroundColor=6366f1',
            recipientId: currentUser.id,
            roomId: null,
            text: `🤖 **Meta AI:** Hello ${currentUser.name}! I am your AI assistant in Secret-Bubble. How can I help you with privacy, messaging, or answers today?`,
            isLocked: false,
            category: 'General',
            isAiShielded: false,
            isEdited: false,
            viewers: ['user-meta-ai'],
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, aiMsg]);
        }, 800);
      }
    }
  };

  const handleEditMessage = (messageId, newText) => {
    if (socket && currentUser) {
      socket.emit('edit_message', { messageId, newText, userId: currentUser.id });
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (socket && currentUser) {
      socket.emit('delete_message', { messageId, userId: currentUser.id });
    }
  };

  const handleTyping = () => {
    if (socket && currentUser) {
      socket.emit('typing', {
        senderId: currentUser.id,
        recipientId: selectedTarget.type === 'user' ? selectedTarget.id : null
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && currentUser) {
      socket.emit('stop_typing', {
        senderId: currentUser.id,
        recipientId: selectedTarget.type === 'user' ? selectedTarget.id : null
      });
    }
  };

  const handleSelectTarget = (target) => {
    setSelectedTarget(target);
    setIsSidebarOpen(false);
    relockAll();
    if (target.id) {
      setUnreadCounts(prev => ({ ...prev, [target.id]: 0 }));
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev.filter(g => g.id !== newGroup.id)]);
    handleSelectTarget({
      type: 'room',
      id: newGroup.id,
      name: newGroup.name,
      isGroup: true,
      ...newGroup
    });
  };

  const handleUnlockPasscodeMessage = useCallback(async (messageId, passcode) => {
    try {
      const res = await fetch(`${backendUrl}/api/messages/unlock-passcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, passcode })
      });
      const data = await res.json();
      if (data.success && data.text) {
        setUnlockedPasscodeTexts(prev => ({
          ...prev,
          [messageId]: data.text
        }));
        return { success: true, text: data.text };
      }
      return { success: false, message: data.message || 'Incorrect passcode' };
    } catch (err) {
      return { success: false, message: 'Server connection error' };
    }
  }, [backendUrl]);

  const handleRelockPasscodeMessage = useCallback((messageId) => {
    setUnlockedPasscodeTexts(prev => {
      const next = { ...prev };
      delete next[messageId];
      return next;
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('secure_chat_user');
    localStorage.removeItem('secure_chat_token');
    setAuthToken(null);
    setCurrentUser(null);
    setMessages([]);
    setUnlockedPasscodeTexts({});
    if (socket) socket.disconnect();
  };

  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={(user, token) => {
          setCurrentUser(user);
          if (token) setAuthToken(token);
        }}
        backendUrl={backendUrl}
      />
    );
  }

  const isCurrentTargetTyping = selectedTarget.type === 'user' && Boolean(typingUsers[selectedTarget.id]);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col md:p-3 text-slate-100 overflow-hidden font-sans relative">
      
      {/* Anti-Shoulder Surfing Privacy Cover */}
      {isWindowBlurred && settings.antiShoulderSurfing && !isAppLocked && (
        <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-4 shadow-xl shadow-purple-600/20">
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Anti-Shoulder Surfing Shield</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Chat preview is hidden because your window lost focus. Click anywhere or return to this tab to reveal.
          </p>
          <button
            onClick={() => setIsWindowBlurred(false)}
            className="mt-5 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg transition"
          >
            Resume Chat
          </button>
        </div>
      )}

      {/* Main Telegram App Container */}
      <div className="flex-1 w-full max-w-6xl mx-auto bg-slate-900 border-0 md:border md:border-slate-800 md:rounded-3xl shadow-2xl overflow-hidden flex h-full relative">
        
        {/* Left Telegram Chat List Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 md:static md:flex md:w-80 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <UserSidebar
            currentUser={currentUser}
            users={users}
            groups={groups}
            selectedTarget={selectedTarget}
            onSelectTarget={handleSelectTarget}
            onLogout={handleLogout}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAiTraining={() => setIsAiTrainingOpen(true)}
            onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
            onLockApp={() => setIsAppLocked(true)}
            unreadCounts={unreadCounts}
          />
        </div>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
          />
        )}

        {/* Active Telegram Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/50 relative">
          
          <ChatHeader
            target={selectedTarget}
            onRelockAll={relockAll}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAiTraining={() => setIsAiTrainingOpen(true)}
            onLockApp={() => setIsAppLocked(true)}
            aiEnabled={settings.aiEnabled}
            isTyping={isCurrentTargetTyping}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-lg">
                  {selectedTarget.id === 'user-meta-ai' ? (
                    <Bot className="w-7 h-7 text-cyan-400 animate-bounce" />
                  ) : (
                    <Globe className="w-7 h-7" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-200">
                  {selectedTarget.id === 'user-meta-ai'
                    ? 'Chat with Meta AI Assistant'
                    : selectedTarget.type === 'room'
                    ? 'Global Public Channel'
                    : `Direct Chat with ${selectedTarget.name}`}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {selectedTarget.id === 'user-meta-ai'
                    ? 'Ask questions, get advice, translations, coding help, or privacy assistance!'
                    : selectedTarget.type === 'room'
                    ? 'Public community messages with Telegram view counts.'
                    : `Encrypted 1-on-1 private chat with ${selectedTarget.name}.`}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  currentUser={currentUser}
                  isUnlocked={isUnlocked}
                  remainingSeconds={getRemainingSeconds}
                  onUnlockClick={triggerUnlock}
                  onRelockClick={relockMessage}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                  unlockedPasscodeTexts={unlockedPasscodeTexts}
                  onUnlockPasscode={handleUnlockPasscodeMessage}
                  onRelockPasscode={handleRelockPasscodeMessage}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

        </div>

      </div>

      {/* Biometric Verification Modal */}
      {activePromptMsg && (
        <BiometricModal
          message={activePromptMsg}
          isWebAuthnSupported={isWebAuthnSupported}
          onConfirm={completeUnlock}
          onCancel={cancelUnlock}
        />
      )}

      {/* Passcode Lock Screen Modal */}
      <AppLockModal
        isLocked={isAppLocked}
        onUnlock={() => setIsAppLocked(false)}
      />

      {/* Profile & DP Upload Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        backendUrl={backendUrl}
      />

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* AI Training & Knowledge Studio Modal */}
      <AiTrainingModal
        isOpen={isAiTrainingOpen}
        onClose={() => setIsAiTrainingOpen(false)}
        backendUrl={backendUrl}
        currentUser={currentUser}
      />

      {/* Create New Telegram Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        currentUser={currentUser}
        users={users}
        backendUrl={backendUrl}
        onGroupCreated={handleGroupCreated}
      />

    </div>
  );
}