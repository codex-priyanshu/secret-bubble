// Service Worker for automatic updates, offline fallback, PWA installation, lock-screen media, and background Web Push notifications
const CACHE_NAME = 'secret-bubble-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Background Web Push Notification Receiver
self.addEventListener('push', (event) => {
  let data = {
    title: 'Secret-Bubble',
    body: 'New private message received',
    icon: '/app-logo.png',
    badge: '/favicon.png',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data.body = event.data.text();
    }
  }

  const title = data.title || 'Secret-Bubble';
  const tag = data.tag || (data.data?.senderId ? `chat-${data.data.senderId}` : 'secret-bubble-chat');
  const options = {
    body: data.body || 'You received a new message',
    icon: data.icon || '/app-logo.png',
    badge: data.badge || '/favicon.png',
    tag: tag,
    renotify: true,
    vibrate: [150, 60, 150],
    data: data.data || { url: '/' },
    actions: [
      { action: 'open', title: '💬 Open Chat' },
      { action: 'dismiss', title: '✖ Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Lock Screen and Notification Tray Media Controls
self.addEventListener('message', (event) => {
  if (event.data?.type === 'UPDATE_MEDIA_NOTIFICATION') {
    const { title, artist, artwork, isPlaying } = event.data;

    if (self.Notification && Notification.permission === 'granted') {
      if (!isPlaying && event.data.action === 'close') {
        self.registration.getNotifications({ tag: 'secret-bubble-media' }).then((notifications) => {
          notifications.forEach((n) => n.close());
        });
        return;
      }

      self.registration.showNotification(title || 'Secret-Bubble Music', {
        body: artist ? `${artist} • Secret-Bubble` : 'Streaming Now',
        icon: artwork || '/app-logo.png',
        badge: '/favicon.png',
        tag: 'secret-bubble-media',
        silent: true,
        renotify: false,
        actions: [
          { action: 'prev', title: '⏮️ Prev' },
          { action: isPlaying ? 'pause' : 'play', title: isPlaying ? '⏸️ Pause' : '▶️ Play' },
          { action: 'next', title: '⏭️ Next' }
        ]
      }).catch(() => {});
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notification = event.notification;
  notification.close();

  if (action === 'dismiss') return;

  const urlToOpen = notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (action === 'prev' || action === 'play' || action === 'pause' || action === 'next') {
            client.postMessage({ type: 'MEDIA_NOTIFICATION_ACTION', action });
          } else {
            client.focus();
            if (notification.data?.senderId || notification.data?.roomId) {
              client.postMessage({
                type: 'NAVIGATE_TO_CHAT',
                senderId: notification.data.senderId,
                roomId: notification.data.roomId
              });
            }
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
