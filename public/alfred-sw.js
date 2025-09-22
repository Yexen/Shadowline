// Service Worker for Alfred Notifications
// This enables notifications even when the app is closed

const CACHE_NAME = 'shadowline-alfred-v1';
const NOTIFICATION_TAG = 'alfred-reminder';

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('Alfred Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/alfred-avatar.png',
        '/alfred-badge.png',
        '/manifest.json'
      ]);
    })
  );

  // Take control immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Alfred Service Worker activating...');

  event.waitUntil(
    // Clean up old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages
  return self.clients.claim();
});

// Background Sync for reminders
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'alfred-reminders') {
    event.waitUntil(processReminders());
  }
});

// Process reminders in background
async function processReminders() {
  try {
    // Get reminders from IndexedDB or localStorage
    const reminders = await getStoredReminders();
    const now = new Date();

    for (const reminder of reminders) {
      const reminderTime = new Date(reminder.scheduledTime);

      // Check if reminder should fire now (within 1 minute window)
      if (reminderTime <= now && reminderTime > new Date(now.getTime() - 60000)) {
        await showReminderNotification(reminder);
        await markReminderAsTriggered(reminder.id);
      }
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
}

// Get stored reminders
async function getStoredReminders() {
  try {
    // Try to get from IndexedDB first, fallback to localStorage
    return new Promise((resolve) => {
      const request = indexedDB.open('alfred-reminders', 1);

      request.onerror = () => {
        // Fallback to localStorage simulation
        resolve([]);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['reminders'], 'readonly');
        const store = transaction.objectStore('reminders');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result || []);
        };

        getAllRequest.onerror = () => {
          resolve([]);
        };
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('reminders')) {
          const store = db.createObjectStore('reminders', { keyPath: 'id' });
          store.createIndex('scheduledTime', 'scheduledTime', { unique: false });
        }
      };
    });
  } catch (error) {
    console.error('Error getting reminders:', error);
    return [];
  }
}

// Mark reminder as triggered
async function markReminderAsTriggered(reminderId) {
  try {
    return new Promise((resolve) => {
      const request = indexedDB.open('alfred-reminders', 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['reminders'], 'readwrite');
        const store = transaction.objectStore('reminders');

        const getRequest = store.get(reminderId);
        getRequest.onsuccess = () => {
          const reminder = getRequest.result;
          if (reminder) {
            reminder.isActive = false;
            reminder.triggeredAt = new Date().toISOString();
            store.put(reminder);
          }
          resolve();
        };
      };

      request.onerror = () => resolve();
    });
  } catch (error) {
    console.error('Error marking reminder as triggered:', error);
  }
}

// Show reminder notification
async function showReminderNotification(reminder) {
  try {
    const options = {
      body: reminder.message,
      icon: '/alfred-avatar.png',
      badge: '/alfred-badge.png',
      tag: `${NOTIFICATION_TAG}-${reminder.id}`,
      requireInteraction: true,
      persistent: true,
      data: {
        reminderId: reminder.id,
        type: 'reminder',
        url: '/'
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/alfred-avatar.png'
        },
        {
          action: 'snooze',
          title: 'Snooze 10min'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      vibrate: [200, 100, 200, 100, 200],
      timestamp: Date.now()
    };

    await self.registration.showNotification(
      '⏰ Alfred Reminder',
      options
    );

    console.log('Background notification shown:', reminder.message);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag, event.action);

  event.notification.close();

  const data = event.notification.data || {};

  switch (event.action) {
    case 'view':
      // Open or focus the app
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          // Try to focus existing window
          for (const client of clientList) {
            if (client.url.includes(location.origin) && 'focus' in client) {
              return client.focus();
            }
          }

          // Open new window if none exists
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
      );
      break;

    case 'snooze':
      // Snooze the reminder for 10 minutes
      event.waitUntil(snoozeReminder(data.reminderId, 10));
      break;

    case 'dismiss':
      // Just dismiss - already closed above
      break;

    default:
      // Default click behavior - open app
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes(location.origin) && 'focus' in client) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(data.url || '/');
          }
        })
      );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});

// Snooze reminder function
async function snoozeReminder(reminderId, minutes) {
  try {
    return new Promise((resolve) => {
      const request = indexedDB.open('alfred-reminders', 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['reminders'], 'readwrite');
        const store = transaction.objectStore('reminders');

        const getRequest = store.get(reminderId);
        getRequest.onsuccess = () => {
          const reminder = getRequest.result;
          if (reminder) {
            // Set new scheduled time
            const newTime = new Date();
            newTime.setMinutes(newTime.getMinutes() + minutes);

            reminder.scheduledTime = newTime.toISOString();
            reminder.isActive = true;

            store.put(reminder);

            // Schedule background sync for the snoozed reminder
            self.registration.sync.register('alfred-reminders');
          }
          resolve();
        };
      };

      request.onerror = () => resolve();
    });
  } catch (error) {
    console.error('Error snoozing reminder:', error);
  }
}

// Handle messages from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  const { type, data } = event.data;

  switch (type) {
    case 'SCHEDULE_REMINDER':
      // Store reminder in IndexedDB for background processing
      storeReminder(data.reminder);
      break;

    case 'SYNC_REMINDERS':
      // Trigger background sync
      self.registration.sync.register('alfred-reminders');
      break;

    case 'TEST_NOTIFICATION':
      // Show test notification
      showTestNotification();
      break;
  }
});

// Store reminder in IndexedDB
async function storeReminder(reminder) {
  try {
    return new Promise((resolve) => {
      const request = indexedDB.open('alfred-reminders', 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['reminders'], 'readwrite');
        const store = transaction.objectStore('reminders');

        store.put(reminder);
        resolve();

        // Register background sync
        self.registration.sync.register('alfred-reminders');
      };

      request.onerror = () => resolve();
    });
  } catch (error) {
    console.error('Error storing reminder:', error);
  }
}

// Show test notification
async function showTestNotification() {
  try {
    await self.registration.showNotification(
      '🧪 Alfred Test Notification',
      {
        body: 'Background notifications are working perfectly, Miss!',
        icon: '/alfred-avatar.png',
        badge: '/alfred-badge.png',
        tag: 'alfred-test',
        requireInteraction: false,
        data: { type: 'test' }
      }
    );
  } catch (error) {
    console.error('Error showing test notification:', error);
  }
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'alfred-reminders-check') {
    event.waitUntil(processReminders());
  }
});

console.log('Alfred Service Worker loaded and ready for background notifications!');