import { useState, useEffect, useCallback } from 'react';

export function useBiometrics(autoRelockSeconds = 15) {
  // Map of messageId -> expiry timestamp (when it should relock)
  const [unlockedMessages, setUnlockedMessages] = useState({});
  const [isWebAuthnSupported, setIsWebAuthnSupported] = useState(false);
  const [activePromptMsg, setActivePromptMsg] = useState(null); // Message requesting biometric verification

  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => setIsWebAuthnSupported(available))
        .catch(() => setIsWebAuthnSupported(false));
    }
  }, []);

  // Countdown and Auto-relock interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUnlockedMessages(prev => {
        let changed = false;
        const next = { ...prev };
        for (const [msgId, expiry] of Object.entries(next)) {
          if (now >= expiry) {
            delete next[msgId];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Request to unlock a message
  const triggerUnlock = useCallback((message) => {
    setActivePromptMsg(message);
  }, []);

  // Confirm verification (from BiometricModal / WebAuthn)
  const completeUnlock = useCallback((messageId) => {
    const expiry = Date.now() + autoRelockSeconds * 1000;
    setUnlockedMessages(prev => ({
      ...prev,
      [messageId]: expiry
    }));
    setActivePromptMsg(null);
  }, [autoRelockSeconds]);

  const cancelUnlock = useCallback(() => {
    setActivePromptMsg(null);
  }, []);

  // Lock a single message immediately
  const relockMessage = useCallback((messageId) => {
    setUnlockedMessages(prev => {
      const next = { ...prev };
      delete next[messageId];
      return next;
    });
  }, []);

  // Lock all messages immediately (e.g., when switching user or leaving phone)
  const relockAll = useCallback(() => {
    setUnlockedMessages({});
  }, []);

  const isUnlocked = useCallback((messageId) => {
    return Boolean(unlockedMessages[messageId] && unlockedMessages[messageId] > Date.now());
  }, [unlockedMessages]);

  const getRemainingSeconds = useCallback((messageId) => {
    if (!unlockedMessages[messageId]) return 0;
    const remaining = Math.max(0, Math.ceil((unlockedMessages[messageId] - Date.now()) / 1000));
    return remaining;
  }, [unlockedMessages]);

  return {
    isWebAuthnSupported,
    activePromptMsg,
    triggerUnlock,
    completeUnlock,
    cancelUnlock,
    relockMessage,
    relockAll,
    isUnlocked,
    getRemainingSeconds,
    autoRelockSeconds
  };
}
