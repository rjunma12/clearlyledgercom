/**
 * Service Worker Registration and Management
 */

export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  active: boolean;
  updateAvailable: boolean;
}

let registration: ServiceWorkerRegistration | null = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerStatus> {
  const status: ServiceWorkerStatus = {
    supported: 'serviceWorker' in navigator,
    registered: false,
    active: false,
    updateAvailable: false,
  };

  if (!status.supported) {
    console.log('Service Worker not supported');
    return status;
  }

  try {
    registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    status.registered = true;
    status.active = !!registration.active;

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration?.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            status.updateAvailable = true;
            console.log('New service worker available');
          }
        });
      }
    });

    console.log('Service Worker registered successfully');
    return status;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return status;
  }
}

/**
 * Prefetch PDF.js worker file for offline use
 * @deprecated Worker is now bundled, no prefetch needed
 */
export async function prefetchPdfWorker(_version?: string): Promise<void> {
  // Worker is now bundled from node_modules, no CDN prefetch needed
  // This function is kept for API compatibility but is now a no-op
  console.log('PDF worker is bundled - no prefetch needed');
}

/**
 * Check if offline processing is available
 * Since the worker is bundled, it's always available after initial load
 */
export async function isOfflineReady(): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cache = await caches.open('clearlyledger-v1');
    const keys = await cache.keys();
    // Check for bundled PDF worker in assets
    return keys.some((request) => 
      request.url.includes('pdf.worker') && request.url.includes('.mjs')
    );
  } catch {
    return false;
  }
}

/**
 * Force update the service worker
 */
export async function updateServiceWorker(): Promise<void> {
  if (registration) {
    await registration.update();
    
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (registration) {
    return registration.unregister();
  }
  return false;
}
