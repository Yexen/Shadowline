'use client';

export interface NativeNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

class NativeNotificationService {
  private permission: NotificationPermission = 'default';
  private unreadCount = 0;
  private isSupported = false;
  private subscribers: ((count: number) => void)[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check if notifications are supported
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window;

    if (this.isSupported) {
      this.permission = Notification.permission;

      // Load unread count from localStorage
      this.loadUnreadCount();

      // Update badge on load
      this.updateBadge();
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return 'denied';
    }

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  // Check if notifications are enabled
  get isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  // Show a native notification
  async showNotification(options: NativeNotificationOptions): Promise<Notification | null> {
    // Ensure permission is granted
    await this.requestPermission();

    if (!this.isEnabled) {
      console.warn('Notifications not enabled');
      return null;
    }

    try {
      // Create notification with Alfred's avatar
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/alfred-avatar.png',
        badge: options.badge || '/alfred-badge.png',
        tag: options.tag || 'alfred-notification',
        requireInteraction: options.requireInteraction || true,
        silent: options.silent || false,
        data: options.data || {},
        // Note: actions are only supported in service worker context
      });

      // Increment unread count
      this.incrementUnreadCount();

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Navigate to app if it's not already focused
        if (document.hidden) {
          window.focus();
        }

        // Custom click handler from data
        if (options.data?.onClick) {
          options.data.onClick();
        }

        // Mark as read when clicked
        this.markAsRead(1);
        notification.close();
      };

      // Auto-close after 8 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 8000);
      }

      return notification;

    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Show Alfred reminder notification
  async showReminderNotification(title: string, message: string, onSnooze?: () => void): Promise<void> {
    await this.showNotification({
      title: `⏰ ${title}`,
      body: message,
      tag: 'alfred-reminder',
      requireInteraction: true,
      data: {
        type: 'reminder',
        onSnooze,
        onClick: () => {
          console.log('Reminder notification clicked');
        }
      }
    });

    // Also show a custom popup for better visibility
    this.showCustomPopup(title, message, onSnooze);
  }

  // Show custom popup notification for better control
  private showCustomPopup(title: string, message: string, onSnooze?: () => void) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('alfred-notification-popup');
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'alfred-notification-popup';
    popup.className = `
      fixed top-4 right-4 z-[9999] w-80 bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl
      transform transition-all duration-300 ease-out
      animate-in slide-in-from-right-5
    `;

    popup.innerHTML = `
      <div class="p-4">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <img
              src="/alfred-avatar.png"
              alt="Alfred"
              class="w-10 h-10 rounded-full"
              style="filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              ${title}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              ${message}
            </p>
          </div>
          <button
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onclick="this.closest('#alfred-notification-popup').remove()"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>

        <div class="mt-4 flex space-x-2">
          <button
            class="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            onclick="window.focus(); this.closest('#alfred-notification-popup').remove();"
          >
            View
          </button>
          ${onSnooze ? `
            <button
              class="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              onclick="(${onSnooze.toString()})(); this.closest('#alfred-notification-popup').remove();"
            >
              Snooze
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(popup);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (popup.parentNode) {
        popup.remove();
      }
    }, 10000);

    // Add click sound if available
    this.playNotificationSound();
  }

  // Play notification sound
  private playNotificationSound() {
    try {
      // Try to play a notification sound
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback: use system beep if available
        if ('navigator' in window && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      });
    } catch {
      // Silent fallback
    }
  }

  // Increment unread count
  private incrementUnreadCount() {
    this.unreadCount++;
    this.saveUnreadCount();
    this.updateBadge();
    this.notifySubscribers();
  }

  // Mark notifications as read
  markAsRead(count: number = 1) {
    this.unreadCount = Math.max(0, this.unreadCount - count);
    this.saveUnreadCount();
    this.updateBadge();
    this.notifySubscribers();
  }

  // Clear all unread notifications
  clearAll() {
    this.unreadCount = 0;
    this.saveUnreadCount();
    this.updateBadge();
    this.notifySubscribers();
  }

  // Get current unread count
  getUnreadCount(): number {
    return this.unreadCount;
  }

  // Update favicon badge and PWA badge
  private updateBadge() {
    // Update PWA badge if supported
    if ('navigator' in window && 'setAppBadge' in navigator) {
      if (this.unreadCount > 0) {
        (navigator as any).setAppBadge(this.unreadCount).catch(() => {
          // Silently fail if not supported
        });
      } else {
        (navigator as any).clearAppBadge().catch(() => {
          // Silently fail if not supported
        });
      }
    }

    // Update favicon with badge
    this.updateFaviconBadge();

    // Update document title with count
    this.updateDocumentTitle();
  }

  // Update favicon with notification count
  private updateFaviconBadge() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Draw base favicon (you could load the actual favicon here)
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(4, 4, 24, 24);

      // Draw badge if there are unread notifications
      if (this.unreadCount > 0) {
        const badgeSize = 12;
        const badgeX = 20;
        const badgeY = 4;

        // Badge background
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, 2 * Math.PI);
        ctx.fill();

        // Badge text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const text = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
        ctx.fillText(text, badgeX + badgeSize/2, badgeY + badgeSize/2);
      }

      // Update favicon
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement ||
                  document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = canvas.toDataURL();

      if (!link.parentNode) {
        document.getElementsByTagName('head')[0].appendChild(link);
      }

    } catch (error) {
      console.warn('Failed to update favicon badge:', error);
    }
  }

  // Update document title with notification count
  private updateDocumentTitle() {
    const baseTitle = 'Shadowline';

    if (this.unreadCount > 0) {
      document.title = `(${this.unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }

  // Save unread count to localStorage
  private saveUnreadCount() {
    try {
      localStorage.setItem('alfred-unread-count', this.unreadCount.toString());
    } catch (error) {
      console.warn('Failed to save unread count:', error);
    }
  }

  // Load unread count from localStorage
  private loadUnreadCount() {
    try {
      const saved = localStorage.getItem('alfred-unread-count');
      if (saved) {
        this.unreadCount = parseInt(saved, 10) || 0;
      }
    } catch (error) {
      console.warn('Failed to load unread count:', error);
    }
  }

  // Subscribe to unread count changes
  subscribe(callback: (count: number) => void): () => void {
    this.subscribers.push(callback);
    // Call immediately with current count
    callback(this.unreadCount);

    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify subscribers of count changes
  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback(this.unreadCount);
    });
  }

  // Check if user is currently active
  private isUserActive(): boolean {
    return !document.hidden && document.hasFocus();
  }

  // Test notification (for debugging)
  async testNotification() {
    await this.showNotification({
      title: 'Alfred Test',
      body: 'Testing notification system, Miss!',
      tag: 'test',
      requireInteraction: false
    });
  }
}

// Export singleton instance
export const nativeNotifications = new NativeNotificationService();