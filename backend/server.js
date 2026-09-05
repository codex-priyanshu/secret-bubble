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

// AI Auto-Sensitivity Detection Engine (Multilingual: English, Hindi, Hinglish)
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

// Pre-seeded demo accounts with hash for "123456"
const DEFAULT_DEMO_USERS = [
  {
    id: "user-aman",
    username: "aman",
    name: "Aman",
    passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
    avatarColor: "from-blue-600 to-cyan-500",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-rohan",
    username: "rohan",
    name: "Rohan",
    passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
    avatarColor: "from-purple-600 to-pink-500",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-priya",
    username: "priya",
    name: "Priya",
    passwordHash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
    avatarColor: "from-rose-600 to-amber-500",
    createdAt: new Date().toISOString()
  }
];

function loadUsers() {
  try {
    if (fs.existsSync(DB_USERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_USERS_FILE, 'utf8'));
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {}
  return DEFAULT_DEMO_USERS;
}

function saveUsers(usersList) {
  try {
    fs.writeFileSync(DB_USERS_FILE, JSON.stringify(usersList, null, 2), 'utf8');
  } catch (err) {}
}

let users = loadUsers();
if (!fs.existsSync(DB_USERS_FILE)) saveUsers(users);

function loadMessages() {
  try {
    if (fs.existsSync(DB_MESSAGES_FILE)) {
      return JSON.parse(fs.readFileSync(DB_MESSAGES_FILE, 'utf8'));
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

// Authentication Endpoints
app.post('/api/auth/register', (req, res) => {
  const { username, name, password, avatarUrl } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const existing = users.find(u => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Username already taken. Please choose another.' });
  }

  const colors = [
    'from-purple-600 to-indigo-500',
    'from-emerald-600 to-teal-500',
    'from-rose-600 to-pink-500',
    'from-amber-600 to-orange-500',
    'from-cyan-600 to-blue-500'
  ];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser = {
    id: 'user-' + Date.now(),
    username: cleanUsername,
    name: name ? name.trim() : cleanUsername,
    passwordHash: hashPassword(password),
    avatarColor,
    avatarUrl: avatarUrl || null,
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
      avatarUrl: newUser.avatarUrl
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
      avatarUrl: user.avatarUrl || null
    }
  });
});

// Update Profile & DP endpoint
app.post('/api/users/profile', (req, res) => {
  const { userId, name, avatarUrl } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name) user.name = name.trim();
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  saveUsers(users);

  io.emit('user_updated', {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    avatarColor: user.avatarColor
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarColor: user.avatarColor,
      avatarUrl: user.avatarUrl
    }
  });
});

app.get('/api/users', (req, res) => {
  const safeUsers = users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    avatarColor: u.avatarColor,
    avatarUrl: u.avatarUrl || null,
    isOnline: onlineUsers.has(u.id) && onlineUsers.get(u.id).size > 0
  }));
  res.json({ success: true, users: safeUsers });
});

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

// Socket.io Real-time Event Handling
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

  // Send Message
  socket.on('send_message', (msgData) => {
    const aiAnalysis = analyzeSensitivity(msgData.text);
    const shouldLock = Boolean(msgData.isLocked || aiAnalysis.isSensitive);
    const category = msgData.isLocked
      ? (msgData.category || 'Private Message')
      : (aiAnalysis.isSensitive ? aiAnalysis.category : 'General');
    const isAiShielded = Boolean(msgData.isAiShielded || aiAnalysis.isSensitive);

    const isDirect = Boolean(msgData.recipientId);

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
      viewers: [msgData.senderId], // Initial sender view
      timestamp: new Date().toISOString()
    };

    messages.push(newMsg);
    saveMessages(messages);

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
  console.log('🚀 SecureChat Backend running on http://0.0.0.0:' + PORT);
});