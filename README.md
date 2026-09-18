<div align="center">

# 🛡️ Secret-Bubble (Music Disguise & Telegram Pro E2EE Vault)
### Standalone Native Android APK • Spotify-Grade Music Lounge • Telegram-Style Realtime Chat • Biometric Shield • Meta AI Bot

[![Download Android APK](https://img.shields.io/badge/Download-Android%20APK%20(10.6%20MB)-00C853?style=for-the-badge&logo=android&logoColor=white)](https://github.com/codex-priyanshu/secret-bubble/actions/runs/35248701193)
[![Build Status](https://img.shields.io/github/actions/workflow/status/codex-priyanshu/secret-bubble/build-apk.yml?branch=main&label=APK%20Build&logo=github&style=for-the-badge)](https://github.com/codex-priyanshu/secret-bubble/actions/workflows/build-apk.yml)
[![Live Web Demo](https://img.shields.io/badge/Live-Web%20App-7928CA?style=for-the-badge&logo=vercel&logoColor=white)](https://secret-bubble.vercel.app/)

<p align="center">
  <b>Secret-Bubble</b> is a stealth privacy communication app disguised as a high-fidelity <b>Spotify-Style Music Player</b>. Behind a hidden 4-digit PIN doorway lies an <b>End-to-End Encrypted (E2EE) Telegram-grade chat vault</b> with granular biometric masking, self-destruct timers, and an integrated Meta AI bot.
</p>

</div>

---

## 📲 Android APK Download & Install (डाउनलोड कैसे करें)

Secret-Bubble ab direct standalone **Android `.apk`** file ke roop me available hai! Kisi browser ki zarurat nahi hai, seedhe phone me install karke normal app ki tarah chala sakte hain.

### 📥 Direct Download Links:
* **🚀 [Download Latest Android APK (Artifact Build)](https://github.com/codex-priyanshu/secret-bubble/actions/runs/35248701193)** *(10.6 MB - Standalone Native Android)*
* **📦 [View All APK Builds & Releases](https://github.com/codex-priyanshu/secret-bubble/actions/workflows/build-apk.yml)**

---

### 📋 Step-by-Step Installation Guide (आसान 3 स्टेप्स):

| Step | Hindi (हिंदी) | English |
| :--- | :--- | :--- |
| **Step 1: Download** | Upar diye gaye **[Download Latest Android APK](https://github.com/codex-priyanshu/secret-bubble/actions/runs/35248701193)** link par click karein. Page ke bottom me **Artifacts** section me `Secret-Bubble-Android-APK` par click karke zip file download karein. | Click the **Download Latest Android APK** link above. Under the **Artifacts** section on GitHub, click `Secret-Bubble-Android-APK` to download the zip file. |
| **Step 2: Extract** | Downloaded zip file ko extract karein. Usme aapko `Secret-Bubble.apk` file mil jayegi. | Extract the downloaded zip file on your device to get `Secret-Bubble.apk`. |
| **Step 3: Install** | `Secret-Bubble.apk` par tap karein aur **Install** dabayein. Agar phone *"Install unknown apps"* pooche to browser/files ko **Allow** kar dein. | Tap `Secret-Bubble.apk` and select **Install**. If prompted by Android, enable **Allow from this source**. |
| **Step 4: Launch** | Installation ke baad aapke phone screen par **Secret-Bubble** ka official icon aa jayega! Tap karke app kholein. | The app icon is now on your home screen. Launch it natively without needing any browser! |

---

## 📍 App ke andar Download Option Kahan Hai? (Where to find Download in App)

Secret-Bubble app me aap kahin se bhi APK download option khol sakte hain:

1. **🎵 Stealth Music Player me:**
   * Player screen ke top-right bar me **"Install App" / Download icon** par tap karein.
2. **🔑 Login Screen me:**
   * Login card ke theek niche **"Download Android APK / Install App"** button par tap karein.
3. **📋 Telegram Sidebar (Hamburger Menu ☰):**
   * Top-left me 3-lines menu icon par tap karein aur **"Install / Download App"** chunein.
4. **💬 Chat Header me:**
   * Kisi bhi chat me top-right me **Download icon** par tap karein.

---

## 🌟 Key Features

### 🎧 1. Stealth Music Camouflage (Spotify-Inspired UI)
* **Real Music Player Disguise:** App khulte hi trending Bollywood aur international songs (Arijit Singh, Sidhu Moose Wala, etc.) ka Spotify jaisa player khulta hai.
* **Background Audio & Screen-Off Playback:** Screen band karne par bhi audio uninterrupted chalti hai.
* **Secret Doorway:** Top equalizer icon par tap karke apna **4-digit Secret PIN** (default `1234`) daalein — seedha private chat vault khul jayega!
* **Decoy PIN Mode:** Agar koi zabardasti PIN pooche to **Decoy PIN** (`9999`) enter karein — ek fake college notes screen open hogi!

### 🔒 2. Telegram-Grade E2EE Chat Vault
* **Granular Biometric Masking:** Sensitive aur romantic baatein automatically blur/mask rehti hain. Sirf aapke **Fingerprint / Face ID** tap karne par unlock hoti hain.
* **Self-Destruct / Disappearing Messages:** 10s, 30s, 1m, 1h ka burn timer set karein — padhne ke baad messages automatically delete ho jaate hain.
* **Anti-Shoulder Surfing:** Window change ya tab switch hote hi poori chat instantly blur ho jaati hai.
* **1-Tap Screen Lock:** Top padlock icon se instant 4-digit screen lock lagayein.

### 🤖 3. Integrated Meta AI Assistant Bot
* Direct 1-on-1 conversations with **Meta AI Bot** (multilingual Hindi, English, Hinglish).
* Instant privacy tips, translations, and intelligent coding assistance available 24/7.
* Built-in **AI Training Studio** to customize knowledge and prompt templates.

### 📞 4. Realtime Calling & Group Channels
* Real-time WebRTC audio calling with camouflage mute.
* Global Public Channel + Custom Private Group creation.

---

## 🛠️ Tech Stack & Architecture

* **Mobile Native Engine:** [Capacitor 8](https://capacitorjs.com/) (Android SDK 36, Gradle 8.14, Java JDK 21)
* **Frontend:** React 18, Vite, TailwindCSS, Lucide Icons, Web Audio API
* **Backend:** Node.js, Express, Socket.io (WebSocket for instant real-time events)
* **Security:** Web Crypto API (AES-GCM-256 E2EE), WebAuthn (Biometric Passkeys)
* **CI/CD Automation:** GitHub Actions (`build-apk.yml` automatically compiles `.apk` on push)

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/codex-priyanshu/secret-bubble.git
cd secret-bubble
```

### 2. Run the Web Application
```bash
cd web
npm install
npm run dev
```

### 3. Build Web Assets
```bash
npm run build
```

### 4. Android Native Build (Capacitor)
```bash
cd web
npx cap copy android
cd android
./gradlew assembleDebug
```
The compiled APK will be at:
`web/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 👨‍💻 Author

**Priyanshu Kumar Maurya**
* GitHub: [@codex-priyanshu](https://github.com/codex-priyanshu)
* Project: [Secret-Bubble](https://github.com/codex-priyanshu/secret-bubble)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).