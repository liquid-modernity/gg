self.addEventListener('install', () => {
  self.skipWaiting();
  console.log('Service worker placeholder installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch handler intentionally empty for now; this file only acts as a placeholder.
