<div align="center">

# 🛡️ Secret-Bubble (BioMask Chat)
### Granular Message-Level Biometric Protection & AI Auto-Shield

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcodex-priyanshu%2Fsecret-bubble&root-directory=web)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/codex-priyanshu/secret-bubble/deploy.yml?branch=main&label=GitHub%20Pages&logo=github)](https://github.com/codex-priyanshu/secret-bubble/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?logo=socketdotio)](https://socket.io/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?logo=nodedotjs)](https://nodejs.org/)

<p align="center">
  <b>A real-time privacy chat app where general conversations remain open, but intimate, adult, romantic, and secret messages are individually masked behind Biometric Authentication (Fingerprint / Face ID / Windows Hello).</b>
</p>

</div>

---

## 🌟 The Problem & The Solution

| Traditional Chat Apps (WhatsApp / Telegram) | 🛡️ Secret-Bubble |
| :--- | :--- |
| Locks the entire app or whole contact thread. | **Only sensitive/private messages are masked**; ordinary chats remain readable. |
| If someone takes your unlocked phone, they can read everything inside the open chat. | Even inside an open chat, **intimate & feelings messages stay blurred/hidden** until your Fingerprint or Face ID verifies. |
| You have to manually remember to lock things. | **Built-in AI Auto-Shield** automatically detects adult/intimate/romantic talks and auto-locks them. |
| Tedious SMS / OTP login requirements. | **Fast, No-OTP Login & 1-Click Demo Profiles**. |

---

## 🚀 Key Features

* **🎭 Selective Message Masking (Frosted Lock Card):**
  Normal messages (e.g. *"Meeting at 5 PM"*) appear clear, while sensitive messages appear as frosted lock cards: *"🔒 Private Message - Tap with Fingerprint / Face ID"*.

* **🤖 AI Privacy Smart Shield (Multilingual NLP):**
  Auto-detects intimate and sensitive topics in **English, Hindi, and Hinglish**:
  * 🔞 **Adult & Physical Intimacy:** Sex, physical relations, bedroom talks, body references.
  * ❤️ **Romance & Feelings:** Love, crush, emotional affection, miss you.
  * 🔒 **Secrets & Confidential:** Passwords, OTPs, "kisi ko mat batana", confidential info.

* **🔐 No-OTP Instant Authentication:**
  Simple username & password registration, plus **1-Click Demo Login** (Aman, Rohan, Priya) for instant testing across devices.

* **📱 Multi-Platform Biometric Hardware:**
  * **Mobile (Android & iOS):** Hardware `BiometricPrompt` & Apple `FaceID / TouchID`.
  * **Web Browsers:** Native `WebAuthn / Passkeys`, Windows Hello, and interactive biometric scanner simulator with haptic sound feedback.

* **⏳ Auto-Relock Countdown Timer:**
  Revealed messages automatically hide and blur again after 15 seconds (customizable to 5s, 10s, 30s).

* **👥 Direct 1-on-1 Friends Chat & Global Room:**
  Real-time online indicators (🟢 Online / ⚪ Offline), live typing status (*"typing message..."*), and unread badges.

* **⚙️ User Control & Settings (Toggle ON/OFF):**
  Master AI Auto-Shield switch, category-wise filters, and instant **Relock All** safety button.

---

## 🌐 Deploy Online (Live on Vercel & GitHub)

### Option 1: Deploy Frontend on Vercel (Recommended ⚡)

1. Click the button below:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcodex-priyanshu%2Fsecret-bubble&root-directory=web)
2. In Vercel Project Settings:
   * **Root Directory:** `web`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. *(Optional)* Add Environment Variable:
   * `VITE_BACKEND_URL`: Your deployed WebSocket backend URL (e.g. on Render/Railway).
4. Click **Deploy**! Your web app is live in seconds.

---

### Option 2: Deploy Free Backend on Render / Railway

To enable real-time WebSockets across the internet 24/7:
1. Go to [Render.com](https://render.com) & click **New Web Service**.
2. Connect this repository (`codex-priyanshu/secret-bubble`).
3. Set:
   * **Root Directory:** `backend`
   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
4. Copy your Render URL (e.g. `https://secret-bubble-api.onrender.com`) and set it as `VITE_BACKEND_URL` in your Vercel frontend!

---

### Option 3: Deploy on GitHub Pages (Built-in Workflow)

This repo already includes a GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Go to your repo on GitHub: **Settings -> Pages**.
2. Under **Build and deployment -> Source**, select **GitHub Actions**.
3. Push any commit to `main`, and your site will be live at:  
   `https://codex-priyanshu.github.io/secret-bubble/`

---

## 💻 Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/codex-priyanshu/secret-bubble.git
cd secret-bubble
```

### 2. Start Backend Server
```bash
cd backend
npm install
node server.js
```
*Server runs on: `http://localhost:5000`*

### 3. Start Frontend Web App
```bash
cd ../web
npm install
npm run dev
```
*Web App runs on: `http://localhost:3000`*

### 4. Run Mobile App (React Native Expo)
```bash
cd ../mobile
npm install
npx expo start
```
*Scan the QR code with **Expo Go** on Android / iOS to test native hardware biometrics!*

---

## 📂 Project Architecture

```
secret-bubble/
├── .github/workflows/deploy.yml   # Automatic GitHub Pages CI/CD
├── vercel.json                    # Vercel Deployment Configuration
├── backend/                       # Real-time WebSocket & Auth Server
│   ├── server.js                  # Socket.io, No-OTP Auth, AI Fallback Guard
│   ├── users.json                 # Persistent User Database
│   ├── messages.json              # Persistent Messages Database
│   └── package.json
├── web/                           # React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginPage.jsx            # No-OTP Login & 1-Click Demo Profiles
│   │   │   ├── UserSidebar.jsx          # Friends List & Online Status
│   │   │   ├── ChatHeader.jsx           # Active Friend Header & Typing Status
│   │   │   ├── MessageItem.jsx          # Masked / Biometric Revealed Bubbles
│   │   │   ├── ChatInput.jsx            # Lock Toggle & AI Realtime Scanner
│   │   │   ├── BiometricModal.jsx       # Fingerprint / Face ID / WebAuthn Prompt
│   │   │   └── PrivacySettingsModal.jsx # AI Master & Category Control
│   │   ├── hooks/useBiometrics.js       # Auto-Relock Timer & Verification
│   │   ├── utils/aiPrivacyDetector.js   # 18+ Adult, Intimacy & Romance NLP
│   │   ├── App.jsx                      # Dual-Pane Real-Time Client
│   │   └── index.css                    # Frosted Glass & Scan Animations
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
└── mobile/                        # React Native (Expo) Mobile App
    ├── App.js                     # Native LocalAuthentication Biometric Prompt
    └── package.json
```

---

## 🔒 Security & Privacy Architecture

* **Hardware-Backed Biometrics:** Mobile app uses Android Keystore / iOS Secure Enclave (`BiometricPrompt` and `LocalAuthentication`).
* **Zero-Leakage DOM:** Masked messages in the UI do not render sensitive text until biometric credentials pass verification.
* **Auto-Eviction Memory:** Unlocked messages automatically expire and re-mask in memory after the specified timeout.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <b>Built with ❤️ for privacy and security.</b>
</div>