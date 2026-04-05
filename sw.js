// sw.js – MRX-Vision Push Service Worker
// Muss im gleichen Ordner wie index.html liegen (GitHub Pages Root)

const CACHE = 'mrx-v4';

// App beim Klick auf Benachrichtigung öffnen
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      // Bereits offenes Fenster fokussieren
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Neues Fenster öffnen
      return clients.openWindow(url);
    })
  );
});

// Push-Nachrichten vom Server empfangen (für spätere VAPID-Erweiterung)
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'MRX-Vision', {
      body: data.body || 'Neue Nachricht',
      icon: data.icon || './icon-192.png',
      badge: './badge.png',
      tag: data.tag || 'mrx-notif',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || './' }
    })
  );
});

// Nachrichten von der Haupt-App empfangen und als Notification anzeigen
self.addEventListener('message', event => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, url } = event.data;
    self.registration.showNotification(title, {
      body,
      icon: './icon-192.png',
      tag: tag || 'mrx-msg',
      renotify: true,
      vibrate: [150, 80, 150],
      data: { url: url || './' }
    });
  }
});

// Minimales Caching (App-Shell)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
