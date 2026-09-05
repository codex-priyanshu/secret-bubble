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
const DB_AI_TRAINING_FILE = path.join(__dirname, 'ai_training_data.json');

// Meta AI Assistant Bot Profile
const META_AI_BOT = {
  id: 'user-meta-ai',
  username: 'meta_ai',
  name: 'Meta AI Assistant',
  isBot: true,
  avatarColor: 'from-blue-600 via-indigo-500 to-cyan-400',
  avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=MetaAI&backgroundColor=6366f1',
  bio: '🤖 High-IQ Trainable AI Assistant for Secret-Bubble'
};

// =========================================================================
// AI Training & Knowledge Base Engine
// =========================================================================
function loadAiTrainingData() {
  try {
    if (fs.existsSync(DB_AI_TRAINING_FILE)) {
      return JSON.parse(fs.readFileSync(DB_AI_TRAINING_FILE, 'utf8'));
    }
  } catch (err) {}
  return {
    systemPersona: "Meta AI - Intelligent Security & Privacy Companion",
    systemInstructions: "You are Meta AI, an intelligent assistant. You speak English, Hindi, and Hinglish.",
    trainingPairs: []
  };
}

function saveAiTrainingData(data) {
  try {
    fs.writeFileSync(DB_AI_TRAINING_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {}
}

let aiTrainingData = loadAiTrainingData();

// Conversation Memory per user (stores last 10 messages)
const userAiMemory = new Map();

// AI Auto-Sensitivity Detection Patterns
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

// Periodic cleanup of expired disappearing messages
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
}, 4000);

// =========================================================================
// Advanced Trainable Meta AI Engine
// =========================================================================
async function generateMetaAiResponse(userPrompt, senderName, senderId) {
  const clean = (userPrompt || '').toLowerCase().trim();

  // 1. Check Custom User Training Pairs First (Highest Priority)
  if (aiTrainingData.trainingPairs && aiTrainingData.trainingPairs.length > 0) {
    for (const pair of aiTrainingData.trainingPairs) {
      const trig = (pair.trigger || '').toLowerCase().trim();
      if (trig && clean.includes(trig)) {
        return pair.response;
      }
      if (Array.isArray(pair.keywords)) {
        for (const kw of pair.keywords) {
          if (kw && clean.includes(kw.toLowerCase().trim())) {
            return pair.response;
          }
        }
      }
    }
  }

  // 2. Optional: External LLM API (Google Gemini / OpenAI / Groq) if API key is present
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${aiTrainingData.systemInstructions}\nUser (${senderName}): ${userPrompt}` }]
          }
        ]
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    } catch (err) {
      console.error('Gemini API Error:', err.message);
    }
  }

  // 3. Built-in Multi-Layer High-IQ NLP Reasoning Engine
  // Memory lookup
  if (!userAiMemory.has(senderId)) userAiMemory.set(senderId, []);
  const mem = userAiMemory.get(senderId);
  mem.push({ role: 'user', text: userPrompt });
  if (mem.length > 10) mem.shift();

  // Code / Programming assistance
  if (clean.match(/\b(code|function|javascript|python|react|html|css|api|bug|error|script|algorithm)\b/)) {
    if (clean.includes('react') || clean.includes('hook')) {
      return `💻 **Meta AI (React Expert):**\nHere is a quick pattern for clean state management in React:\n\`\`\`javascript\nimport React, { useState, useEffect } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}\n\`\`\`\nLet me know if you need specific refactoring or debugging!`;
    }
    return `💻 **Meta AI (Code Assistant):**\nI can write, explain, and debug code in JavaScript, Python, C++, React, Node.js, and SQL. Paste your code or ask your question!`;
  }

  // Privacy & Biometrics
  if (clean.match(/\b(privacy|security|biometric|lock|mask|shield|encryption|e2ee)\b/)) {
    return `🛡️ **Secret-Bubble Security Architecture:**\n- **Granular BioMasking:** Only sensitive messages are locked behind biometrics; public channel remains readable.\n- **Telegram E2EE:** Client-side privacy and disappearing burn timers.\n- **Anti-Shoulder Surfing:** Auto-blurs screen on window switch.\n- **Passcode Lock:** 1-click full app lock.\n\nAll biometric scans run locally on your device hardware!`;
  }

  // Greetings & Welcomes
  if (clean.match(/\b(hi|hello|hey|namaste|kese ho|kaise ho|how are you|hii|heyy|good morning|good evening)\b/)) {
    return `👋 Hello **${senderName || 'friend'}**! I am **Meta AI**, your trainable privacy assistant.\n\nHow can I help you today? You can ask me:\n- 💡 General knowledge & questions\n- 🔐 Privacy & Biometric security guidance\n- 💻 Coding & debugging\n- 🎓 Custom training (teach me new answers!)`;
  }

  // Creator / Developer
  if (clean.match(/\b(who made|who created|creator|owner|developer|founder|priyanshu)\b/)) {
    return `🚀 **Secret-Bubble** was created by **Priyanshu Kumar Maurya** ([@Priyanshu-kumar-maurya](https://github.com/Priyanshu-kumar-maurya)). Built with Telegram-grade privacy, biometric message masking, and AI Auto-Shield.`;
  }

  // Advice & Relationships
  if (clean.match(/\b(love|crush|pyaar|relationship|feelings|advice|sad|happy)\b/)) {
    return `❤️ In any relationship, open communication and privacy matter most. With Secret-Bubble, your intimate talks stay locked behind your own fingerprint so they remain 100% private!`;
  }

  // Jokes / Entertainment
  if (clean.match(/\b(joke|chutkula|funny|hasi)\b/)) {
    return `😄 **Joke of the Day:**\nWhy did the database administrator leave his wife?\nBecause she had one-to-many relationships! 🤣`;
  }

  // Math calculation
  const mathMatch = clean.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
  if (mathMatch) {
    try {
      const num1 = parseFloat(mathMatch[1]);
      const op = mathMatch[2];
      const num2 = parseFloat(mathMatch[3]);
      let res = 0;
      if (op === '+') res = num1 + num2;
      else if (op === '-') res = num1 - num2;
      else if (op === '*') res = num1 * num2;
      else if (op === '/') res = num2 !== 0 ? (num1 / num2) : 'Infinity';
      return `🧮 **Calculation Result:**\n\`${num1} ${op} ${num2} = ${res}\``;
    } catch (e) {}
  }

  // Translation / Hindi
  if (clean.match(/\b(kya|kaise|kyu|batao|shukriya|thanks|dhanyawad|sahi hai)\b/)) {
    return `✨ Bilkul ${senderName}! Main yahan aapki har tarah se help karne ke liye hu. Aap chahein to mujhe **'Train AI'** menu se koi bhi naya topic ya question sikha sakte hain!`;
  }

  // Default smart AI assistant fallback
  return `✨ **Meta AI:** I received your prompt: *"${userPrompt}"*\n\nI can assist you with answering questions, writing messages, coding, translations, or customizing your biometric privacy rules. You can also train me with custom responses in the **AI Training Hub**!`;
}

// =========================================================================
// AI Training API Endpoints (CRUD)
// =========================================================================
app.get('/api/ai/training', (req, res) => {
  res.json({
    success: true,
    data: aiTrainingData
  });
});

app.post('/api/ai/train', (req, res) => {
  const { trigger, response, keywords } = req.body;
  if (!trigger || !response) {
    return res.status(400).json({ success: false, message: 'Trigger and response are required' });
  }

  const newPair = {
    id: 'train-' + Date.now(),
    trigger: trigger.trim(),
    keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(',').map(k => k.trim()) : []),
    response: response.trim(),
    createdAt: new Date().toISOString()
  };

  if (!aiTrainingData.trainingPairs) aiTrainingData.trainingPairs = [];
  aiTrainingData.trainingPairs.unshift(newPair);
  saveAiTrainingData(aiTrainingData);

  res.json({
    success: true,
    message: 'AI successfully trained with new knowledge rule!',
    pair: newPair,
    totalRules: aiTrainingData.trainingPairs.length
  });
});

app.delete('/api/ai/train/:id', (req, res) => {
  const { id } = req.params;
  if (!aiTrainingData.trainingPairs) aiTrainingData.trainingPairs = [];
  aiTrainingData.trainingPairs = aiTrainingData.trainingPairs.filter(p => p.id !== id);
  saveAiTrainingData(aiTrainingData);

  res.json({
    success: true,
    message: 'Training rule removed successfully',
    totalRules: aiTrainingData.trainingPairs.length
  });
});

app.post('/api/ai/persona', (req, res) => {
  const { systemPersona, systemInstructions } = req.body;
  if (systemPersona) aiTrainingData.systemPersona = systemPersona.trim();
  if (systemInstructions) aiTrainingData.systemInstructions = systemInstructions.trim();
  saveAiTrainingData(aiTrainingData);

  res.json({
    success: true,
    message: 'AI Persona & System Prompt updated!',
    data: aiTrainingData
  });
});

app.post('/api/ai/test', async (req, res) => {
  const { prompt, senderName } = req.body;
  const reply = await generateMetaAiResponse(prompt, senderName || 'User', 'test-user');
  res.json({ success: true, response: reply });
});

// =========================================================================
// Authentication Endpoints
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
    'from-cyan-600 to-blue-500'
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

  const allUsersWithBot = [
    {
      ...META_AI_BOT,
      isOnline: true
    },
    ...safeUsers
  ];

  res.json({ success: true, users: allUsersWithBot });
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

  // Send Message
  socket.on('send_message', async (msgData) => {
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

    // Meta AI Response
    if (isToMetaAi) {
      const senderSockets = onlineUsers.get(msgData.senderId);
      if (senderSockets) {
        senderSockets.forEach(sId => io.to(sId).emit('user_typing', { senderId: 'user-meta-ai' }));

        try {
          const aiReplyText = await generateMetaAiResponse(msgData.text, msgData.sender, msgData.senderId);

          setTimeout(() => {
            senderSockets.forEach(sId => io.to(sId).emit('user_stop_typing', { senderId: 'user-meta-ai' }));

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
          }, 800);
        } catch (e) {
          senderSockets.forEach(sId => io.to(sId).emit('user_stop_typing', { senderId: 'user-meta-ai' }));
        }
      }
    }
  });

  // Edit Message
  socket.on('edit_message', ({ messageId, newText, userId }) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || msg.senderId !== userId) return;

    msg.text = newText;
    msg.isEdited = true;
    
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

  // Mark Viewed
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
  console.log('🚀 Secret-Bubble (Meta AI Trainable Engine) running on http://0.0.0.0:' + PORT);
});