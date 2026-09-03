# SecureChat 🛡️ (Message-Level Biometric Protection)

A modern privacy-first chat application for **Web & Mobile (Android/iOS)** where public/general messages are freely visible, but sensitive/feelings/intimate messages are automatically masked and require **Biometric Authentication (Fingerprint / Face ID / Windows Hello / WebAuthn)** to reveal.

---

## 📱 Features

1. **Selective Message Masking:**
   - Instead of locking entire contacts, only marked messages stay hidden.
   - Unauthorized viewers holding the phone see normal messages normally, but private messages appear as locked frosted shields with category badges (e.g. *Feelings*, *Intimate*, *Confidential*).
2. **Instant Biometric Reveal:**
   - **Mobile (Android/iOS):** Uses hardware LocalAuthentication (BiometricPrompt on Android, FaceID / TouchID on iOS).
   - **Web:** Uses WebAuthn / Passkeys and interactive biometric simulation (Fingerprint, Face Scan, PIN).
3. **Auto-Relock Timer:**
   - Unlocked messages automatically re-lock/blur after 15 seconds.
4. **Relock All Switch:**
   - Instant one-tap button to hide all sensitive chats if someone approaches.
5. **Real-time Synchronization:**
   - Real-time messaging with Socket.io.

---

## 🚀 How to Run

### 1. Backend Server
`ash
cd backend
npm install
node server.js
`
Runs on: http://localhost:5000

### 2. Web App (React + Tailwind + WebAuthn)
`ash
cd web
npm install
npm run dev
`
Runs on: http://localhost:3000

### 3. Mobile App (Android & iOS via Expo)
`ash
cd mobile
npm install
npx expo start
`
Scan the QR code with **Expo Go** on your Android/iPhone to test native hardware biometrics!
