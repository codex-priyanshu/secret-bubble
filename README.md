<div align="center">

# 🛡️ Secret-Bubble (Music Disguise & Telegram Pro E2EE Vault)
### Standalone Native Android APK • Spotify-Grade Music Lounge • Telegram-Style Realtime Chat • Biometric Shield • Meta AI Bot

[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK%20(10.6%20MB)-00C853?style=for-the-badge&logo=android&logoColor=white)](https://github.com/codex-priyanshu/secret-bubble/releases/download/v1.0.0/Secret-Bubble.apk)
[![Build Status](https://img.shields.io/github/actions/workflow/status/codex-priyanshu/secret-bubble/build-apk.yml?branch=main&label=APK%20Build&logo=github&style=for-the-badge)](https://github.com/codex-priyanshu/secret-bubble/actions/workflows/build-apk.yml)
[![Live Web Demo](https://img.shields.io/badge/Live-Web%20App-7928CA?style=for-the-badge&logo=vercel&logoColor=white)](https://secret-bubble.vercel.app/)

<p align="center">
  <b>Secret-Bubble</b> is a privacy communication platform disguised as a high-fidelity <b>Spotify-Style Music Player</b>. Behind a hidden 4-digit PIN doorway lies an <b>End-to-End Encrypted (E2EE) Telegram-grade chat vault</b> equipped with granular biometric masking, self-destruct timers, and an integrated Meta AI assistant bot.
</p>

</div>

---

## 📲 Android APK Download & Installation Guide

Secret-Bubble is available as a standalone **native Android `.apk`** file. You do not need to use a browser — install it directly onto your Android device and run it as an independent application.

### 📥 Direct 1-Click Download Link:
* **⚡ [Direct Download Secret-Bubble.apk (1-Click)](https://github.com/codex-priyanshu/secret-bubble/releases/download/v1.0.0/Secret-Bubble.apk)** *(10.6 MB - Raw .apk file starts downloading immediately)*
* **📦 [GitHub Actions Build Artifacts (Alternative)](https://github.com/codex-priyanshu/secret-bubble/actions/runs/35374747330)**

---

### 📋 Step-by-Step Installation Instructions:

| Step | Action | Details |
| :--- | :--- | :--- |
| **Step 1: Download** | Click **[Direct Download Secret-Bubble.apk](https://github.com/codex-priyanshu/secret-bubble/releases/download/v1.0.0/Secret-Bubble.apk)**. | Your phone browser will immediately start downloading `Secret-Bubble.apk` directly into your Downloads folder (no zip archive needed). |
| **Step 2: Open File** | Tap `Secret-Bubble.apk` from your notification bar. | Or open your phone's **Downloads** folder and tap **`Secret-Bubble.apk`**. |
| **Step 3: Install** | Tap **Install** on your phone screen. | If prompted by Android security settings, toggle **Allow from this source** to complete installation. |
| **Step 4: Launch** | Tap the Secret Bubble icon on your home screen! | The app opens directly with full-screen native performance, custom app logo, and background playback. |

---

## 📍 Where to Find the Download Option Inside the App

You can access the APK download and install options from any screen within Secret-Bubble:

1. **🎵 In Stealth Music Player (Disguise Mode):**
   * Tap the **"Install App"** button (Download icon) in the top-right header next to the search bar.
2. **🔑 On the Login Screen:**
   * Tap the **"Download Android APK / Install App"** button directly beneath the sign-in form.
3. **📋 In the Telegram Sidebar (☰ Menu):**
   * Open the 3-line hamburger menu in the top-left and select **"Install / Download App"**.
4. **💬 In Any Active Chat Header:**
   * Tap the **Download icon** in the top-right header of the chat screen.

---

## 🌟 Key Features

### 🎧 1. Stealth Music Camouflage (Spotify-Inspired UI)
* **Genuine Music Player Disguise:** Opens immediately to a high-fidelity music streaming lounge with playlist management, volume controls, and real playback.
* **Background Audio & Lock-Screen Playback:** Music continues uninterrupted even when your phone screen turns off or when switching apps.
* **Secret Doorway:** Tap the top Equalizer icon and enter your **4-digit Secret PIN** (default: `1234`) to unlock the private chat vault.
* **Decoy PIN Mode:** If forced to unlock under pressure, enter your **Decoy PIN** (default: `9999`) to reveal an innocuous study notes screen.

### 🔒 2. Telegram-Grade E2EE Chat Vault
* **Granular Biometric Masking:** Sensitive or intimate conversations stay frosted and locked behind your device's **Fingerprint / Face ID**, even while the chat thread is open.
* **Self-Destruct / Disappearing Messages:** Set message burn timers (10s, 30s, 1m, 1h). Expired messages vanish permanently from all devices.
* **Anti-Shoulder Surfing:** The app automatically frosts and obscures conversation windows whenever you switch tabs or when the window loses focus.
* **1-Tap Lock Screen:** Tap the top padlock icon to instantly lock the entire interface with a secure passcode.

### 🤖 3. Integrated Meta AI Assistant Bot
* Direct 1-on-1 conversations with **Meta AI Bot** for research, privacy advice, translations, and coding assistance.
* Multilingual natural language understanding and responses.
* Built-in **AI Training Studio** to customize knowledge bases, system prompts, and responses.

### 📞 4. Realtime Audio Calls & Channels
* Real-time WebRTC audio calling with camouflage mute controls.
* Pinned Global Public Channel and custom group creation.

---

## 🛠️ Architecture & Technology Stack

* **Mobile Native Engine:** [Capacitor 8](https://capacitorjs.com/) (Android SDK 36, Gradle 8.14, Java JDK 21)
* **Frontend:** React 18, Vite, TailwindCSS, Lucide Icons, Web Audio API
* **Backend:** Node.js, Express, Socket.io (WebSocket for real-time messaging)
* **Security:** Web Crypto API (AES-GCM-256 E2EE), WebAuthn (Biometric Passkeys)
* **CI/CD Automation:** GitHub Actions (`build-apk.yml` automatically compiles `.apk` on push)

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/codex-priyanshu/secret-bubble.git
cd secret-bubble
```

### 2. Start the Frontend
```bash
cd web
npm install
npm run dev
```

### 3. Build Web Assets
```bash
npm run build
```

### 4. Build Android APK Locally
```bash
cd web
npx cap copy android
cd android
./gradlew assembleDebug
```
The compiled APK will be generated at:
`web/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 👨‍💻 Author

**Priyanshu Kumar Maurya**
* GitHub: [@codex-priyanshu](https://github.com/codex-priyanshu)
* Project: [Secret-Bubble](https://github.com/codex-priyanshu/secret-bubble)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).