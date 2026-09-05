const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const DB_MESSAGES_FILE = path.join(__dirname, 'messages.json');
const DB_USERS_FILE = path.join(__dirname, 'users.json');

// Meta AI Assistant Bot Profile
const META_AI_BOT = {
  id: 'user-meta-ai',
  username: 'meta_ai',
  name: 'Meta AI Assistant',
  isBot: true,
  avatarColor: 'from-blue-600 via-indigo-500 to-cyan-400',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=MetaAI&backgroundColor=6366f1',
  bio: '🤖 Intelligent AI Assistant for Secret-Bubble & Telegram Privacy'
};

// AI Auto-Sensitivity Detection Patterns (English, Hindi, Hinglish)
const AI_SENSITIVITY_PATTERNS = [
  {
    category: 'Adult & Physical Intimacy 🔞',
    patterns: [
      /\b(sex|sexy|sexual|sax|sexx|sux|intercourse|nude|nudes|naked|horny|orgasm|erotic|sensual|make love|making love|foreplay|condom|fetish|strip|boobs|breast|chest|butt|ass|hips|groin|lingerie|underwear|bra|panties|wet|threesome|lust|lusty)\b/i,
      /\b(sambandh|sharirik|suhagraat|bistar|chudai|chudaai|bina kapde|kapde utaro|badan|chhuo|touch me|touch you|bister|kamuk|choli|jism|pyasa|pyasi|tight hug|french kiss|lip kiss|neck kiss|bite|bed pe|room lock|physical relation|intimate relation)\b/i,
      /\b(send nudes|photo bhejo bina|show body|body photo|shareer|hot pic|hot photo|sexy pic)\b/i
    ]
  },
  {
    category: 'Romance & Feelings ❤️',
    patterns: [
      /\b(love|pyar|pyaar|ishq|mohabbat|dil|feelings?|crush|like you|pyaari|khubsurat|beautiful|sundar|jaan|baby|babu|shona|sweetheart|darling|miss you|yaad aa rahi|romantic|relationship)\b/i,
      /\b(tumse pyar|dil ki baat|tum bohot|meri jaan|i adore you|fall in love|in love with|cuddle|hugs?|kiss)\b/i
    ]
  },
  {
    category: 'Secrets & Confidential 🔒',
    patterns: [
      /\b(secret|kisi ko mat|kisi ko nahi|mat batana|chupana|hide|confidential|don\'t tell|dont tell|keep it private|sirf hamare|private baat)\b/i,
      /\b(top secret|personal baat|kisi se share mat|leak mat karna|kisi ko pata na chale)\b/i
    ]
  },
  {
    category: 'Financial & Credentials 🔑',
    patterns: [
      /\b(password|pin|otp|cvv|account number|debit card|credit card|upi pin|bank balance|net banking|creds)\b/i,
      /\b(\d{4,6}\s*(otp|pin)|my password is)\b/i
    ]
  }
];

function analyzeSensitivity(text) {
  if (!text || typeof text !== 'string') return { isSensitive: false, category: 'General' };
  const clean = text.toLowerCase();
  for (const rule of AI_SENSITIVITY_PATTERNS) {
    for (const p of rule.patterns) {
      if (clean.match(p)) {
        return { isSensitive: true, category: rule.category };
      }
    }
  }
  return { isSensitive: false, category: 'General' };
}

function hashPassword(pass) {
  return crypto.createHash('sha256').update(pass).digest('hex');
}

function loadUsers() {
  try {
    if (fs.existsSync(DB_USERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_USERS_FILE, 'utf8'));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {}
  return [];
}

function saveUsers(usersList) {
  try {
    fs.writeFileSync(DB_USERS_FILE, JSON.stringify(usersList, null, 2), 'utf8');
  } catch (err) {}
}

let users = loadUsers();

function loadMessages() {
  try {
    if (fs.existsSync(DB_MESSAGES_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_MESSAGES_FILE, 'utf8'));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {}
  return [];
}

function saveMessages(msgs) {
  try {
    fs.writeFileSync(DB_MESSAGES_FILE, JSON.stringify(msgs, null, 2), 'utf8');
  } catch (err) {}
}

let messages = loadMessages();
const onlineUsers = new Map();

// Periodic cleanup of expired self-destructing messages
setInterval(() => {
  const now = Date.now();
  const initialCount = messages.length;
  messages = messages.filter(m => {
    if (!m.expiresAt) return true;
    return now < m.expiresAt;
  });
  if (messages.length !== initialCount) {
    saveMessages(messages);
  }
}, 5000);

// =========================================================================
// Meta AI Bot Response Generator
// =========================================================================
function generateMetaAiResponse(userPrompt, senderName) {
  const clean = (userPrompt || '').toLowerCase().trim();

  // Security / Privacy questions
  if (clean.includes('privacy') || clean.includes('security') || clean.includes('biometric') || clean.includes('lock')) {
    return `🛡️ **Secret-Bubble Privacy Engine:**\nYour messages are protected with granular biometric locks (Fingerprint / Face ID / Passcode). Even if someone holds your unlocked phone, locked messages stay frosted until verified! You can also toggle the Master AI Auto-Shield in Settings.`;
  }

  // Greetings
  if (clean.match(/\b(hi|hello|hey|namaste|kese ho|kaise ho|how are you|hii|heyy)\b/)) {
    return `👋 Hello ${senderName || 'friend'}! I am **Meta AI**, your intelligent assistant inside Secret-Bubble. How can I help you today? You can ask me questions, get translations, write code, or ask for privacy tips!`;
  }

  // Who are you / About
  if (clean.includes('who are you') || clean.includes('tum kaun ho') || clean.includes('kya ho') || clean.includes('meta ai')) {
    return `🤖 I am **Meta AI Assistant**, integrated into Secret-Bubble! I help you with answers, creative writing, productivity, and privacy guidance 24/7.`;
  }

  // Love / Feelings / Advice
  if (clean.includes('love') || clean.includes('crush') || clean.includes('pyaar') || clean.includes('advice') || clean.includes('relationship')) {
    return `❤️ Communication and trust are the foundation of any great relationship. With Secret-Bubble, your intimate and personal feelings are shielded behind your own biometric lock so they remain strictly between you two!`;
  }

  // Joke / Fun
  if (clean.includes('joke') || clean.includes('chutkula') || clean.includes('hasi') || clean.includes('funny')) {
    return `😄 Here is a quick one:\nWhy don't secrets ever get stolen on Secret-Bubble?\nBecause even the phone's hacker needs your exact fingerprint to read the punchline! 🔒✨`;
  }

  // Time / Date
  if (clean.includes('time') || clean.includes('date') || clean.includes('kya time')) {
    return `⏱️ The current time is **${new Date().toLocaleTimeString()}** (${new Date().toLocaleDateString()}).`;
  }

  // Code / Programming
  if (clean.includes('code') || clean.includes('javascript') || clean.includes('python') || clean.includes('react') || clean.includes('html')) {
    return `💻 Here to help with coding! You can ask me to explain algorithms, debug React components, format JSON, or build API backends. What specific code snippet are you working on?`;
  }

  // Hindi / Hinglish translation or generic response
  if (clean.match(/\b(kya|kaise|kyu|batao|shukriya|thanks|dhanyawad)\b/)) {
    return `✨ Bilkul! Aap jo bhi poochhenge, Meta AI aapki poori madad karega. Aap koi sawal, translation, ya ideas share kar sakte hain!`;
  }

  // Default intelligent assistant fallback
  return `✨ **Meta AI:** I received your message: "${userPrompt}"\n\nI can assist you with answering questions, writing messages, translating languages, coding, or configuring your Telegram-style biometric privacy settings. Let me know what you need!`;
}

// =========================================================================
// Real Authentication Endpoints (No Demo Mock Accounts)
// =========================================================================
app.post('/api/auth/register', (req, res) => {
  const { username, name, password, avatarUrl } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  if (password.length < 4) {
    return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
  }

  const cleanUsername = username.trim().toLowerCase();

  // Prevent registering reserved bot username
  if (cleanUsername === 'meta_ai' || cleanUsername === 'admin' || cleanUsername === 'system') {
    return res.status(400).json({ success: false, message: 'This username is reserved' });
  }

  const existing = users.find(u => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Username already taken. Please choose another.' });
  }

  const colors = [
    'from-purple-600 to-indigo-500',
    'from-emerald-600 to-teal-500',
    'from-rose-600 to-pink-500',
    'from-amber-600 to-orange-500',
    'from-cyan-600 to-blue-500',
    'from-fuchsia-600 to-pink-600'
  ];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser = {
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    username: cleanUsername,
    name: name ? name.trim() : cleanUsername,
    passwordHash: hashPassword(password),
    avatarColor,
    avatarUrl: avatarUrl || null,
    bio: 'Hey there! I am using Secret-Bubble.',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  res.json({
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      avatarColor: newUser.avatarColor,
      avatarUrl: newUser.avatarUrl,
      bio: newUser.bio
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const user = users.find(u => u.username.toLowerCase() === cleanUsername);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarColor: user.avatarColor,
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || ''
    }
  });
});

// Update Profile endpoint
app.post('/api/users/profile', (req, res) => {
  const { userId, name, avatarUrl, bio } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name) user.name = name.trim();
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (bio !== undefined) user.bio = bio.trim();
  saveUsers(users);

  io.emit('user_updated', {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    avatarColor: user.avatarColor,
    bio: user.bio
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarColor: user.avatarColor,
      avatarUrl: user.avatarUrl,
      bio: user.bio
    }
  });
});

// List real users + Meta AI Bot
app.get('/api/users', (req, res) => {
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    avatarColor: u.avatarColor,
    avatarUrl: u.avatarUrl || null,
    bio: u.bio || '',
    isOnline: onlineUsers.has(u.id) && onlineUsers.get(u.id).size > 0
  }));

  // Ensure Meta AI Bot is always at the top of bots list
  const allUsersWithBot = [
    {
      ...META_AI_BOT,
      isOnline: true
    },
    ...safeUsers
  ];

  res.json({ success: true, users: allUsersWithBot });
});

// Fetch Messages
app.get('/api/messages', (req, res) => {
  const { userId, targetId, roomId } = req.query;
  let filtered = [];

  if (roomId) {
    filtered = messages.filter(m => m.roomId === roomId && !m.recipientId);
  } else if (userId && targetId) {
    filtered = messages.filter(m => 
      !m.roomId && (
        (m.senderId === userId && m.recipientId === targetId) ||
        (m.senderId === targetId && m.recipientId === userId)
      )
    );
  }

  res.json({ success: true, messages: filtered });
});

// =========================================================================
// Socket.io Real-Time Engine
// =========================================================================
io.on('connection', (socket) => {
  let authenticatedUserId = null;

  socket.on('user_online', (user) => {
    if (!user || !user.id) return;
    authenticatedUserId = user.id;

    if (!onlineUsers.has(user.id)) {
      onlineUsers.set(user.id, new Set());
    }
    onlineUsers.get(user.id).add(socket.id);
    io.emit('online_users_update', Array.from(onlineUsers.keys()));
  });

  // Send Message Event
  socket.on('send_message', (msgData) => {
    const aiAnalysis = analyzeSensitivity(msgData.text);
    const shouldLock = Boolean(msgData.isLocked || aiAnalysis.isSensitive);
    const category = msgData.isLocked
      ? (msgData.category || 'Private Message')
      : (aiAnalysis.isSensitive ? aiAnalysis.category : 'General');
    const isAiShielded = Boolean(msgData.isAiShielded || aiAnalysis.isSensitive);

    const isDirect = Boolean(msgData.recipientId);
    const isToMetaAi = msgData.recipientId === 'user-meta-ai';

    const selfDestructSecs = msgData.selfDestructSecs ? parseInt(msgData.selfDestructSecs, 10) : 0;
    const expiresAt = selfDestructSecs > 0 ? Date.now() + (selfDestructSecs * 1000) : null;

    const newMsg = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      sender: msgData.sender || 'Anonymous',
      senderId: msgData.senderId,
      senderAvatar: msgData.senderAvatar || null,
      recipientId: isDirect ? msgData.recipientId : null,
      roomId: isDirect ? null : (msgData.roomId || 'global'),
      text: msgData.text,
      isLocked: shouldLock,
      category: category,
      isAiShielded: isAiShielded,
      isEdited: false,
      selfDestructSecs: selfDestructSecs > 0 ? selfDestructSecs : null,
      expiresAt: expiresAt,
      viewers: [msgData.senderId],
      timestamp: new Date().toISOString()
    };

    messages.push(newMsg);
    saveMessages(messages);

    // Deliver user message
    if (newMsg.recipientId) {
      const recipientSockets = onlineUsers.get(newMsg.recipientId);
      if (recipientSockets) {
        recipientSockets.forEach(sId => io.to(sId).emit('new_message', newMsg));
      }
      const senderSockets = onlineUsers.get(newMsg.senderId);
      if (senderSockets) {
        senderSockets.forEach(sId => io.to(sId).emit('new_message', newMsg));
      }
    } else {
      io.emit('new_message', newMsg);
    }

    // Handle Meta AI Auto-Response
    if (isToMetaAi) {
      const senderSockets = onlineUsers.get(msgData.senderId);
      if (senderSockets) {
        // Send typing indicator
        senderSockets.forEach(sId => io.to(sId).emit('user_typing', { senderId: 'user-meta-ai' }));

        setTimeout(() => {
          senderSockets.forEach(sId => io.to(sId).emit('user_stop_typing', { senderId: 'user-meta-ai' }));

          const aiReplyText = generateMetaAiResponse(msgData.text, msgData.sender);
          const aiMsg = {
            id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            sender: META_AI_BOT.name,
            senderId: META_AI_BOT.id,
            senderAvatar: META_AI_BOT.avatarUrl,
            recipientId: msgData.senderId,
            roomId: null,
            text: aiReplyText,
            isLocked: false,
            category: 'General',
            isAiShielded: false,
            isEdited: false,
            viewers: ['user-meta-ai'],
            timestamp: new Date().toISOString()
          };

          messages.push(aiMsg);
          saveMessages(messages);

          senderSockets.forEach(sId => io.to(sId).emit('new_message', aiMsg));
        }, 900);
      }
    }
  });

  // Edit Message
  socket.on('edit_message', ({ messageId, newText, userId }) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || msg.senderId !== userId) return;

    msg.text = newText;
    msg.isEdited = true;
    
    // Re-check AI Sensitivity
    const aiAnalysis = analyzeSensitivity(newText);
    if (aiAnalysis.isSensitive) {
      msg.isLocked = true;
      msg.category = aiAnalysis.category;
      msg.isAiShielded = true;
    }

    saveMessages(messages);

    const payload = { messageId, newText, isEdited: true, isLocked: msg.isLocked, category: msg.category };
    if (msg.recipientId) {
      const recipientSockets = onlineUsers.get(msg.recipientId);
      if (recipientSockets) recipientSockets.forEach(sId => io.to(sId).emit('message_edited', payload));
      const senderSockets = onlineUsers.get(msg.senderId);
      if (senderSockets) senderSockets.forEach(sId => io.to(sId).emit('message_edited', payload));
    } else {
      io.emit('message_edited', payload);
    }
  });

  // Delete Message
  socket.on('delete_message', ({ messageId, userId }) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const msg = messages[msgIndex];
    if (msg.senderId !== userId) return;

    const recipientId = msg.recipientId;
    const senderId = msg.senderId;
    messages.splice(msgIndex, 1);
    saveMessages(messages);

    if (recipientId) {
      const recipientSockets = onlineUsers.get(recipientId);
      if (recipientSockets) recipientSockets.forEach(sId => io.to(sId).emit('message_deleted', { messageId }));
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) senderSockets.forEach(sId => io.to(sId).emit('message_deleted', { messageId }));
    } else {
      io.emit('message_deleted', { messageId });
    }
  });

  // Telegram-style Message View Counter
  socket.on('mark_viewed', ({ messageIds, viewerId }) => {
    if (!messageIds || !viewerId) return;
    let changed = false;

    messageIds.forEach(id => {
      const msg = messages.find(m => m.id === id);
      if (msg) {
        if (!msg.viewers) msg.viewers = [];
        if (!msg.viewers.includes(viewerId)) {
          msg.viewers.push(viewerId);
          changed = true;
          io.emit('views_updated', { messageId: id, viewers: msg.viewers, viewsCount: msg.viewers.length });
        }
      }
    });

    if (changed) saveMessages(messages);
  });

  socket.on('typing', (data) => {
    if (data.recipientId) {
      const recipientSockets = onlineUsers.get(data.recipientId);
      if (recipientSockets) {
        recipientSockets.forEach(sId => io.to(sId).emit('user_typing', data));
      }
    } else {
      socket.broadcast.emit('user_typing', data);
    }
  });

  socket.on('stop_typing', (data) => {
    if (data.recipientId) {
      const recipientSockets = onlineUsers.get(data.recipientId);
      if (recipientSockets) {
        recipientSockets.forEach(sId => io.to(sId).emit('user_stop_typing', data));
      }
    } else {
      socket.broadcast.emit('user_stop_typing', data);
    }
  });

  socket.on('disconnect', () => {
    if (authenticatedUserId && onlineUsers.has(authenticatedUserId)) {
      const userSockets = onlineUsers.get(authenticatedUserId);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(authenticatedUserId);
      }
      io.emit('online_users_update', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Secret-Bubble (Telegram Pro) Backend running on http://0.0.0.0:' + PORT);
});