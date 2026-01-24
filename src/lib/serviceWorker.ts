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
 */
export async function prefetchPdfWorker(version: string): Promise<void> {
  if (!registration?.active) {
    return;
  }

  const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
  
  registration.active.postMessage({
    type: 'PREFETCH_PDF_WORKER',
    url: workerUrl,
  });
}

/**
 * Check if offline processing is available
 */
export async function isOfflineReady(): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cache = await caches.open('pdf-worker-v1');
    const keys = await cache.keys();
    return keys.some((request) => 
      request.url.includes('pdf.worker.min.js')
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
