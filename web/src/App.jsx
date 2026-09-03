import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Shield, Lock, Smartphone, Laptop, Info, Settings, Bot, Users, Globe } from 'lucide-react';
import ChatHeader from './components/ChatHeader';
import MessageItem from './components/MessageItem';
import ChatInput from './components/ChatInput';
import BiometricModal from './components/BiometricModal';
import PrivacySettingsModal from './components/PrivacySettingsModal';
import UserSidebar from './components/UserSidebar';
import LoginPage from './components/LoginPage';
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

  const [users, setUsers] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState({ type: 'room', id: 'global', name: 'Global Group Room' });
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

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

  // Fetch Users List
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {}
  };

  // Fetch Messages for current selected target
  const fetchMessages = async () => {
    if (!currentUser) return;
    try {
      let url = `${backendUrl}/api/messages`;
      if (selectedTarget.type === 'room') {
        url += `?roomId=${selectedTarget.id}`;
      } else {
        url += `?userId=${currentUser.id}&targetId=${selectedTarget.id}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchMessages();
    }
  }, [currentUser, selectedTarget]);

  // Socket.io Connection Setup
  useEffect(() => {
    if (!currentUser) return;

    const s = io(backendUrl, {
      reconnectionAttempts: 10,
      timeout: 5000
    });

    s.on('connect', () => {
      setConnectionStatus('connected');
      s.emit('user_online', currentUser);
      fetchUsers();
    });

    s.on('online_users_update', (onlineIds) => {
      setUsers(prev => prev.map(u => ({
        ...u,
        isOnline: onlineIds.includes(u.id)
      })));
    });

    s.on('new_message', (msg) => {
      const isForCurrentTarget =
        (selectedTarget.type === 'room' && msg.roomId === selectedTarget.id) ||
        (selectedTarget.type === 'user' &&
          ((msg.senderId === selectedTarget.id && msg.recipientId === currentUser.id) ||
           (msg.senderId === currentUser.id && msg.recipientId === selectedTarget.id)));

      if (isForCurrentTarget) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } else if (msg.senderId !== currentUser.id) {
        const fromId = msg.senderId;
        setUnreadCounts(prev => ({
          ...prev,
          [fromId]: (prev[fromId] || 0) + 1
        }));
      }
    });

    s.on('user_typing', (data) => {
      if (data.senderId !== currentUser.id) {
        setTypingUsers(prev => ({ ...prev, [data.senderId]: true }));
      }
    });

    s.on('user_stop_typing', (data) => {
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
  }, [currentUser, selectedTarget, relockAll, backendUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (msgData) => {
    if (!currentUser) return;

    const payload = {
      ...msgData,
      sender: currentUser.name,
      senderId: currentUser.id,
      recipientId: selectedTarget.type === 'user' ? selectedTarget.id : null,
      roomId: selectedTarget.type === 'room' ? selectedTarget.id : null
    };

    if (socket && connectionStatus === 'connected') {
      socket.emit('send_message', payload);
    } else {
      const localMsg = {
        ...payload,
        id: 'msg-' + Date.now(),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, localMsg]);
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

  const handleLogout = () => {
    localStorage.removeItem('secure_chat_user');
    setCurrentUser(null);
    setMessages([]);
    if (socket) socket.disconnect();
  };

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} backendUrl={backendUrl} />;
  }

  const isCurrentTargetTyping = selectedTarget.type === 'user' && Boolean(typingUsers[selectedTarget.id]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-1 sm:p-4 text-slate-100">
      
      {/* Top App Header */}
      <div className="w-full max-w-5xl mb-2 sm:mb-3 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white leading-tight flex items-center gap-2">
              SecureChat: Biometric Shield
              {settings.aiEnabled && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI Auto-Guard ON
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">Real-time Remote Chat • No OTP Required</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            connectionStatus === 'connected'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            {connectionStatus === 'connected' ? 'Live Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Dual-Pane Chat Container */}
      <div className="w-full max-w-5xl bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex h-[85vh] relative backdrop-blur-xl">
        
        {/* Left Side: Friends Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 md:static md:flex md:w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <UserSidebar
            currentUser={currentUser}
            users={users}
            selectedTarget={selectedTarget}
            onSelectTarget={handleSelectTarget}
            onLogout={handleLogout}
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

        {/* Right Side: Active Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/30">
          
          <ChatHeader
            target={selectedTarget}
            onRelockAll={relockAll}
            onOpenSettings={() => setIsSettingsOpen(true)}
            aiEnabled={settings.aiEnabled}
            isTyping={isCurrentTargetTyping}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Informational Sub-Bar */}
          <div className="bg-purple-950/30 border-b border-purple-500/20 px-4 py-1.5 text-[11px] text-purple-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate">
              <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              Normal chats open hain. Private/Intimate baatein sirf <strong>Biometrics</strong> se khulengi.
            </span>
            <span className="text-slate-400 hidden sm:inline shrink-0 ml-2">
              Auto-relocks in {settings.autoRelockSeconds}s
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">No messages yet with {selectedTarget.name}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Send a message below. Try sending normal text or private/intimate messages to see the Biometric AI Shield in action!
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

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Footer Notes */}
      <div className="mt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> Mobile & Remote ready</span>
        <span>•</span>
        <span className="flex items-center gap-1"><Laptop className="w-3.5 h-3.5" /> WebAuthn & Windows Hello</span>
      </div>

    </div>
  );
}