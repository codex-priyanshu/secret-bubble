// =============================================================================
// Secret-Bubble Push Notification & Background Alerts Engine
// Standard Web Push (VAPID) + Service Worker Background Notifications
// =============================================================================

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!isPushSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[Push] Permission request error:', err);
    return 'denied';
  }
}

export async function subscribeUserToPush(userId, backendUrl) {
  if (!isPushSupported() || !userId) return { success: false, reason: 'unsupported_or_no_user' };

  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return { success: false, reason: 'permission_denied' };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Fetch VAPID public key from backend
      const res = await fetch(`${backendUrl}/api/push/vapid-public-key`);
      const data = await res.json();
      if (!data.success || !data.publicKey) {
        throw new Error('Failed to retrieve VAPID public key from server');
      }

      const applicationServerKey = urlBase64ToUint8Array(data.publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });
    }

    // Register subscription on backend
    const subRes = await fetch(`${backendUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription: subscription.toJSON()
      })
    });

    const subData = await subRes.json();
    return { success: subData.success, subscription };
  } catch (err) {
    console.warn('[Push] Subscribe error:', err);
    return { success: false, error: err.message };
  }
}

export async function unsubscribeUserFromPush(userId, backendUrl) {
  if (!isPushSupported()) return { success: false };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      if (backendUrl && userId) {
        await fetch(`${backendUrl}/api/push/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, endpoint })
        }).catch(() => {});
      }
    }
    return { success: true };
  } catch (err) {
    console.warn('[Push] Unsubscribe error:', err);
    return { success: false, error: err.message };
  }
}

export async function sendTestPush(userId, backendUrl) {
  if (!backendUrl || !userId) return { success: false };
  try {
    const res = await fetch(`${backendUrl}/api/push/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function showLocalNotification(title, body, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title || 'Secret-Bubble', {
          body: body || 'New message received',
          icon: options.icon || '/app-logo.png',
          badge: options.badge || '/favicon.png',
          tag: options.tag || 'secret-bubble-local',
          renotify: true,
          vibrate: [100, 50, 100],
          data: options.data || { url: '/' }
        }).catch(() => {});
      });
    } else {
      new Notification(title || 'Secret-Bubble', {
        body: body || 'New message received',
        icon: options.icon || '/app-logo.png',
        badge: options.badge || '/favicon.png',
        tag: options.tag || 'secret-bubble-local'
      });
    }
  } catch (err) {}
}

export function playNotificationTone() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {}
}
