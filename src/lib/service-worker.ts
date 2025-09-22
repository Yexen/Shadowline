'use client';

export interface ServiceWorkerMessage {
  type: 'SCHEDULE_REMINDER' | 'SYNC_REMINDERS' | 'TEST_NOTIFICATION';
  data?: any;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check if service workers are supported
    this.isSupported = 'serviceWorker' in navigator;

    if (this.isSupported) {
      try {
        await this.registerServiceWorker();
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    }
  }

  // Register the service worker
  private async registerServiceWorker(): Promise<void> {
    try {
      // Register Alfred's service worker
      this.registration = await navigator.serviceWorker.register('/alfred-sw.js', {
        scope: '/'
      });

      console.log('Alfred Service Worker registered:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Alfred Service Worker installed, refreshing...');
              // Optionally reload to use new service worker
              // window.location.reload();
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Received message from service worker:', event.data);
      });

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Alfred Service Worker is ready');

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Send message to service worker
  async sendMessage(message: ServiceWorkerMessage): Promise<void> {
    if (!this.isSupported || !this.registration) {
      console.warn('Service Worker not available');
      return;
    }

    try {
      const serviceWorker = this.registration.active || this.registration.waiting || this.registration.installing;

      if (serviceWorker) {
        serviceWorker.postMessage(message);
        console.log('Message sent to service worker:', message);
      } else {
        console.warn('No active service worker found');
      }
    } catch (error) {
      console.error('Failed to send message to service worker:', error);
    }
  }

  // Schedule a reminder in the background
  async scheduleReminder(reminder: any): Promise<void> {
    // Store in IndexedDB for service worker access
    await this.storeReminderInIndexedDB(reminder);

    // Send message to service worker
    await this.sendMessage({
      type: 'SCHEDULE_REMINDER',
      data: { reminder }
    });

    // Register background sync
    await this.requestBackgroundSync();
  }

  // Store reminder in IndexedDB for service worker access
  private async storeReminderInIndexedDB(reminder: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('alfred-reminders', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['reminders'], 'readwrite');
        const store = transaction.objectStore('reminders');

        const putRequest = store.put(reminder);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('reminders')) {
          const store = db.createObjectStore('reminders', { keyPath: 'id' });
          store.createIndex('scheduledTime', 'scheduledTime', { unique: false });
          store.createIndex('isActive', 'isActive', { unique: false });
        }
      };
    });
  }

  // Request background sync
  async requestBackgroundSync(): Promise<void> {
    if (!this.registration) return;

    try {
      if ('sync' in this.registration) {
        await this.registration.sync.register('alfred-reminders');
        console.log('Background sync registered for Alfred reminders');
      }
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }

  // Request notification permissions
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.isSupported || !('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  // Test background notification
  async testNotification(): Promise<void> {
    await this.sendMessage({
      type: 'TEST_NOTIFICATION'
    });
  }

  // Sync reminders with service worker
  async syncReminders(): Promise<void> {
    await this.sendMessage({
      type: 'SYNC_REMINDERS'
    });
  }

  // Get service worker status
  getStatus(): {
    isSupported: boolean;
    isRegistered: boolean;
    isActive: boolean;
  } {
    return {
      isSupported: this.isSupported,
      isRegistered: this.registration !== null,
      isActive: this.registration?.active !== null
    };
  }

  // Update service worker if needed
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Failed to update service worker:', error);
    }
  }

  // Unregister service worker (for debugging)
  async unregister(): Promise<void> {
    if (!this.registration) return;

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      this.registration = null;
    } catch (error) {
      console.error('Failed to unregister service worker:', error);
    }
  }

  // Check if app is installed as PWA
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Request periodic background sync (if supported)
  async requestPeriodicSync(): Promise<void> {
    if (!this.registration) return;

    try {
      if ('periodicSync' in this.registration) {
        await (this.registration as any).periodicSync.register('alfred-reminders-check', {
          minInterval: 60000 // 1 minute minimum
        });
        console.log('Periodic background sync registered');
      }
    } catch (error) {
      console.error('Failed to register periodic sync:', error);
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();