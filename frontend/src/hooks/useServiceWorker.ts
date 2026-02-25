/**
 * ═══════════════════════════════════════════════════════
 * Service Worker Registration Hook
 * ═══════════════════════════════════════════════════════
 */

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registered:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content available
            console.log('🔄 New content available, refresh to update');
            
            // Show update notification (optional)
            if (confirm('Versi baru tersedia! Refresh untuk update?')) {
              window.location.reload();
            }
          }
        });
      });

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('Service Worker unregistered');
  }
};
