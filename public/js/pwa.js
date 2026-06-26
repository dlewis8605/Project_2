if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Handle online/offline events to show/hide the offline banner
window.addEventListener('online', () => {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.style.display = 'none';
  }
  console.log('App is online');
});

window.addEventListener('offline', () => {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.style.display = 'block';
  }
  console.log('App is offline');
});

// Initial check
document.addEventListener('DOMContentLoaded', () => {
  if (!navigator.onLine) {
    const banner = document.getElementById('offline-banner');
    if (banner) {
      banner.style.display = 'block';
    }
  }
});
