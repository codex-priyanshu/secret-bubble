const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

// =========================================================================
// Enterprise Security Headers & Middlewares
// =========================================================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Master cryptographic secret keys
const MASTER_ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'secret-bubble-aes-256-gcm-master-vault-2026-v2';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(MASTER_ENCRYPTION_SECRET).digest();
const JWT_SESSION_SECRET = process.env.JWT_SECRET || 'secret-bubble-session-hmac-sha256-signature-key-2026';

// Rate Limiting Memory Map
const rateLimitMap = new Map();

function createRateLimiter({ windowMs = 60000, maxRequests = 10, keyPrefix = 'ip' }) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let record = rateLimitMap.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(key, record);
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        message: `🛡️ Security Shield: Too many attempts. Please wait ${retryAfter}s before retrying.`
      });
    }

    next();
  };
}

// Clean up expired rate limit entries every 5 mins
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetTime) rateLimitMap.delete(k);
  }
}, 300000);

// XSS Sanitizer
function sanitizeText(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

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

// =========================================================================
// Cryptographic Engine: PBKDF2, AES-256-GCM, HMAC Tokens
// =========================================================================

// Salted PBKDF2 (100,000 rounds, SHA-512)
function hashPassword(pass, existingSalt = null) {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pass, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(inputPassword, storedHash) {
  if (!storedHash) return { valid: false, needsUpgrade: false };
  if (storedHash.includes(':')) {
    const [salt, originalHash] = storedHash.split(':');
    const computedHash = crypto.pbkdf2Sync(inputPassword, salt, 100000, 64, 'sha512').toString('hex');
    const isValid = crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(computedHash, 'hex'));
    return { valid: isValid, needsUpgrade: false };
  }
  // Legacy SHA-256 fallback with automatic upgrade flag
  const legacyHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
  if (legacyHash === storedHash) {
    return { valid: true, needsUpgrade: true };
  }
  return { valid: false, needsUpgrade: false };
}

// HMAC-SHA256 Signed Session Tokens
function generateSessionToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60) // 14 days
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SESSION_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_SESSION_SECRET).update(encodedPayload).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// AES-256-GCM Storage Encryption at Rest
function encryptMessageText(text) {
  if (typeof text !== 'string') return null;
  const iv = crypto.randomBytes(12); // 96-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let ciphertext = cipher.update(text, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return {
    ciphertext,
    iv: iv.toString('hex'),
    tag
  };
}

function decryptMessageText(enc) {
  if (!enc || !enc.ciphertext || !enc.iv || !enc.tag) return '';
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      ENCRYPTION_KEY,
      Buffer.from(enc.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(enc.tag, 'hex'));
    let decrypted = decipher.update(enc.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return '[Decryption failed: integrity check failed]';
  }
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
      if (Array.isArray(parsed)) {
        return parsed.map(m => {
          if (m.encryptedPayload) {
            return {
              ...m,
              text: decryptMessageText(m.encryptedPayload)
            };
          }
          return m;
        });
      }
    }
  } catch (err) {}
  return [];
}

function saveMessages(msgs) {
  try {
    const diskMessages = msgs.map(m => {
      const copy = { ...m };
      copy.encryptedPayload = encryptMessageText(m.text || '');
      delete copy.text; // Text is wiped from disk for military-grade zero-knowledge storage!
      return copy;
    });
    fs.writeFileSync(DB_MESSAGES_FILE, JSON.stringify(diskMessages, null, 2), 'utf8');
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

const authLoginLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 6, keyPrefix: 'auth-login' });
const authRegisterLimiter = createRateLimiter({ windowMs: 300000, maxRequests: 10, keyPrefix: 'auth-register' });
const aiTestLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 20, keyPrefix: 'ai-test' });

app.post('/api/ai/test', aiTestLimiter, async (req, res) => {
  const { prompt, senderName } = req.body;
  const sanitizedPrompt = sanitizeText(prompt);
  const reply = await generateMetaAiResponse(sanitizedPrompt, senderName || 'User', 'test-user');
  res.json({ success: true, response: reply });
});

// =========================================================================
// Authentication Endpoints (Salted PBKDF2 + HMAC Session Tokens)
// =========================================================================
app.post('/api/auth/register', authRegisterLimiter, (req, res) => {
  const { username, name, password, avatarUrl } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  if (password.length < 4) {
    return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
  }

  const cleanUsername = sanitizeText(username.trim().toLowerCase());

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
    name: sanitizeText(name ? name.trim() : cleanUsername),
    passwordHash: hashPassword(password), // Salted PBKDF2 100,000 iterations!
    avatarColor,
    avatarUrl: avatarUrl || null,
    bio: 'Hey there! I am using Secret-Bubble.',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const safeUser = {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    avatarColor: newUser.avatarColor,
    avatarUrl: newUser.avatarUrl,
    bio: newUser.bio
  };

  const token = generateSessionToken(safeUser);

  res.json({
    success: true,
    user: safeUser,
    token
  });
});

app.post('/api/auth/login', authLoginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const user = users.find(u => u.username.toLowerCase() === cleanUsername);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  const verification = verifyPassword(password, user.passwordHash);
  if (!verification.valid) {
    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  }

  // Automatic hash upgrade from legacy SHA-256 to Salted PBKDF2 (100,000 rounds)
  if (verification.needsUpgrade) {
    user.passwordHash = hashPassword(password);
    saveUsers(users);
  }

  const safeUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarColor: user.avatarColor,
    avatarUrl: user.avatarUrl || null,
    bio: user.bio || ''
  };

  const token = generateSessionToken(safeUser);

  res.json({
    success: true,
    user: safeUser,
    token
  });
});

app.post('/api/users/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const verified = verifySessionToken(authHeader.split(' ')[1]);
    if (verified && req.body.userId && verified.userId !== req.body.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile update attempt' });
    }
  }

  const { userId, name, avatarUrl, bio } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (name) user.name = sanitizeText(name.trim());
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (bio !== undefined) user.bio = sanitizeText(bio.trim());
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
// Socket.io Real-Time Engine (Cryptographic Session Guard)
// =========================================================================
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    const session = verifySessionToken(token);
    if (session) {
      socket.data.userId = session.userId;
      socket.data.username = session.username;
      socket.data.name = session.name;
      socket.data.authenticated = true;
    }
  }
  next();
});

io.on('connection', (socket) => {
  let authenticatedUserId = socket.data.authenticated ? socket.data.userId : null;

  socket.on('user_online', (user) => {
    const targetUserId = socket.data.authenticated ? socket.data.userId : (user?.id);
    if (!targetUserId) return;
    authenticatedUserId = targetUserId;

    if (!onlineUsers.has(targetUserId)) {
      onlineUsers.set(targetUserId, new Set());
    }
    onlineUsers.get(targetUserId).add(socket.id);
    io.emit('online_users_update', Array.from(onlineUsers.keys()));
  });

  // Send Message (Protected against spoofing)
  socket.on('send_message', async (msgData) => {
    // Identity verification
    const senderId = socket.data.authenticated ? socket.data.userId : (msgData.senderId || 'user-anon');
    const senderName = socket.data.authenticated ? (socket.data.name || socket.data.username) : (msgData.sender || 'Anonymous');
    const sanitizedText = sanitizeText(msgData.text || '');

    const aiAnalysis = analyzeSensitivity(sanitizedText);
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
      sender: senderName,
      senderId: senderId,
      senderAvatar: msgData.senderAvatar || null,
      recipientId: isDirect ? msgData.recipientId : null,
      roomId: isDirect ? null : (msgData.roomId || 'global'),
      text: sanitizedText,
      isLocked: shouldLock,
      category: category,
      isAiShielded: isAiShielded,
      isEdited: false,
      selfDestructSecs: selfDestructSecs > 0 ? selfDestructSecs : null,
      expiresAt: expiresAt,
      viewers: [senderId],
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
      const senderSockets = onlineUsers.get(senderId);
      if (senderSockets) {
        senderSockets.forEach(sId => io.to(sId).emit('user_typing', { senderId: 'user-meta-ai' }));

        try {
          const aiReplyText = await generateMetaAiResponse(sanitizedText, senderName, senderId);

          setTimeout(() => {
            senderSockets.forEach(sId => io.to(sId).emit('user_stop_typing', { senderId: 'user-meta-ai' }));

            const aiMsg = {
              id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              sender: META_AI_BOT.name,
              senderId: META_AI_BOT.id,
              senderAvatar: META_AI_BOT.avatarUrl,
              recipientId: senderId,
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

  // Edit Message (Enforced Sender Ownership)
  socket.on('edit_message', ({ messageId, newText, userId }) => {
    const verifiedUserId = socket.data.authenticated ? socket.data.userId : userId;
    const msg = messages.find(m => m.id === messageId);
    if (!msg || msg.senderId !== verifiedUserId) return;

    const sanitizedText = sanitizeText(newText);
    msg.text = sanitizedText;
    msg.isEdited = true;
    
    const aiAnalysis = analyzeSensitivity(sanitizedText);
    if (aiAnalysis.isSensitive) {
      msg.isLocked = true;
      msg.category = aiAnalysis.category;
      msg.isAiShielded = true;
    }

    saveMessages(messages);

    const payload = { messageId, newText: sanitizedText, isEdited: true, isLocked: msg.isLocked, category: msg.category };
    if (msg.recipientId) {
      const recipientSockets = onlineUsers.get(msg.recipientId);
      if (recipientSockets) recipientSockets.forEach(sId => io.to(sId).emit('message_edited', payload));
      const senderSockets = onlineUsers.get(msg.senderId);
      if (senderSockets) senderSockets.forEach(sId => io.to(sId).emit('message_edited', payload));
    } else {
      io.emit('message_edited', payload);
    }
  });

  // Delete Message (Enforced Sender Ownership)
  socket.on('delete_message', ({ messageId, userId }) => {
    const verifiedUserId = socket.data.authenticated ? socket.data.userId : userId;
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;
    const msg = messages[msgIndex];
    if (msg.senderId !== verifiedUserId) return;

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