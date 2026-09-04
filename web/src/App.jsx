import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Shield, Lock, Globe } from 'lucide-react';
import ChatHeader from './components/ChatHeader';
import MessageItem from './components/MessageItem';
import ChatInput from './components/ChatInput';
import BiometricModal from './components/BiometricModal';
import PrivacySettingsModal from './components/PrivacySettingsModal';
import ProfileModal from './components/ProfileModal';
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
        
        // Mark viewed
        if (socket && data.messages.length > 0) {
          const unviewedIds = data.messages
            .filter(m => !m.viewers || !m.viewers.includes(currentUser.id))
            .map(m => m.id);
          if (unviewedIds.length > 0) {
            socket.emit('mark_viewed', { messageIds: unviewedIds, viewerId: currentUser.id });
          }
        }
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

    s.on('user_updated', () => {
      fetchUsers();
    });

    s.on('new_message', (msg) => {
      const isForCurrentTarget =
        selectedTarget.type === 'room'
          ? (!msg.recipientId && msg.roomId === selectedTarget.id)
          : (selectedTarget.type === 'user' &&
              !msg.roomId &&
              ((msg.senderId === selectedTarget.id && msg.recipientId === currentUser.id) ||
               (msg.senderId === currentUser.id && msg.recipientId === selectedTarget.id)));

      if (isForCurrentTarget) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Auto mark as viewed
        s.emit('mark_viewed', { messageIds: [msg.id], viewerId: currentUser.id });
      } else if (msg.recipientId === currentUser.id && msg.senderId !== currentUser.id) {
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

    s.on('views_updated', ({ messageId, viewsCount }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          const currentViewers = m.viewers || [];
          return { ...m, viewers: currentViewers.length < viewsCount ? new Array(viewsCount).fill('x') : currentViewers };
        }
        return m;
      }));
    });

    s.on('user_typing', (data) => {
      if (data.senderId !== currentUser.id) {
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
  }, [currentUser, selectedTarget, relockAll, backendUrl]);

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
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, localMsg]);
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
    <div className="h-screen w-screen bg-slate-950 flex flex-col md:p-3 text-slate-100 overflow-hidden font-sans">
      
      {/* Main App Container */}
      <div className="flex-1 w-full max-w-6xl mx-auto bg-slate-900 border-0 md:border md:border-slate-800 md:rounded-3xl shadow-2xl overflow-hidden flex h-full relative">
        
        {/* Left Friends Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 md:static md:flex md:w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <UserSidebar
            currentUser={currentUser}
            users={users}
            selectedTarget={selectedTarget}
            onSelectTarget={handleSelectTarget}
            onLogout={handleLogout}
            onOpenProfile={() => setIsProfileOpen(true)}
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

        {/* Active Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40">
          
          <ChatHeader
            target={selectedTarget}
            onRelockAll={relockAll}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            aiEnabled={settings.aiEnabled}
            isTyping={isCurrentTargetTyping}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300">
                  {selectedTarget.type === 'room' ? 'Global Group Chat' : `Chat with ${selectedTarget.name}`}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  {selectedTarget.type === 'room'
                    ? 'Public group messages with Telegram-style views tracking.'
                    : `Direct 1-on-1 private chat with ${selectedTarget.name}.`}
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

    </div>
  );
}