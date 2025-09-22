// Alfred Proactive Notification System
// Handles Toast, Banner, Modal, and Badge notifications

export type NotificationType = 'toast' | 'banner' | 'modal' | 'badge';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AlfredNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  actions?: NotificationAction[];
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
  persistent?: boolean;
  context?: string[];
  tags?: string[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'dismiss' | 'accept' | 'defer' | 'custom';
  handler?: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
}

class AlfredNotificationService {
  private notifications: AlfredNotification[] = [];
  private listeners: ((notifications: AlfredNotification[]) => void)[] = [];
  private lastCheckTime: number = Date.now();

  // Add notification
  addNotification(notification: Omit<AlfredNotification, 'id' | 'timestamp'>): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: AlfredNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Show custom popup notification instead of the old toast/banner system
    this.showCustomPopup(newNotification);

    // Auto-hide if specified
    if (newNotification.autoHide && newNotification.hideAfter) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.hideAfter);
    }

    return id;
  }

  // Show custom popup notification (same style as reminder notifications)
  private showCustomPopup(notification: AlfredNotification) {
    // Remove existing popup if any
    const existingPopup = document.getElementById(`alfred-notification-${notification.id}`);
    if (existingPopup) {
      existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.id = `alfred-notification-${notification.id}`;
    popup.className = `
      fixed top-4 right-4 z-[9999] w-80 bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl
      transform transition-all duration-300 ease-out
      animate-in slide-in-from-right-5
    `;

    // Get priority styling
    const priorityStyles = this.getPriorityStyles(notification.priority);

    popup.innerHTML = `
      <div class="p-4 ${priorityStyles.background}">
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
            <div class="flex items-center justify-between mb-1">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 ${priorityStyles.titleColor}">
                ${notification.title}
              </h4>
              <div class="flex items-center space-x-1">
                ${priorityStyles.icon}
                <button
                  class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-2"
                  onclick="this.closest('[id^=\\"alfred-notification-\\"]').remove()"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              ${notification.message}
            </p>
            ${this.renderNotificationActions(notification)}
          </div>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(popup);

    // Auto-remove after specified time or default
    const hideAfter = notification.hideAfter || 8000;
    setTimeout(() => {
      if (popup.parentNode) {
        popup.remove();
      }
    }, hideAfter);

    // Add click sound if available
    this.playNotificationSound();
  }

  // Get priority-based styling
  private getPriorityStyles(priority: NotificationPriority) {
    switch (priority) {
      case 'critical':
        return {
          background: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950',
          titleColor: 'text-red-800 dark:text-red-200',
          icon: '<svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
        };
      case 'high':
        return {
          background: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
          titleColor: 'text-yellow-800 dark:text-yellow-200',
          icon: '<svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
        };
      case 'medium':
        return {
          background: 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950',
          titleColor: 'text-blue-800 dark:text-blue-200',
          icon: '<svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
        };
      default:
        return {
          background: 'border-l-4 border-gray-500 bg-gray-50 dark:bg-gray-950',
          titleColor: 'text-gray-800 dark:text-gray-200',
          icon: '<svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
        };
    }
  }

  // Render notification actions
  private renderNotificationActions(notification: AlfredNotification): string {
    if (!notification.actions || notification.actions.length === 0) {
      return '';
    }

    const actionsHtml = notification.actions.map(action => {
      const buttonClass = action.style === 'primary'
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : action.style === 'destructive'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300';

      return `
        <button
          class="px-3 py-2 text-xs font-medium rounded-md transition-colors ${buttonClass}"
          onclick="
            ${action.action === 'dismiss' ? `this.closest('[id^=\\"alfred-notification-\\"]').remove();` : ''}
            ${action.action === 'accept' ? `console.log('Action accepted: ${action.id}');` : ''}
          "
        >
          ${action.label}
        </button>
      `;
    }).join('');

    return `
      <div class="mt-4 flex space-x-2">
        ${actionsHtml}
      </div>
    `;
  }

  // Play notification sound
  private playNotificationSound() {
    try {
      // Try to play a notification sound
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {
        // Fallback: use system beep if available
        if ('navigator' in window && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      });
    } catch {
      // Silent fallback
    }
  }

  // Remove notification
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Get all notifications
  getAllNotifications(): AlfredNotification[] {
    return [...this.notifications].sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }

  // Get notifications by type
  getNotificationsByType(type: NotificationType): AlfredNotification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Get badge count
  getBadgeCount(): number {
    return this.notifications.filter(n => n.type === 'badge').length;
  }

  // Subscribe to notifications
  subscribe(listener: (notifications: AlfredNotification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Clear by type
  clearByType(type: NotificationType): void {
    this.notifications = this.notifications.filter(n => n.type !== type);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Proactive notification generators
  generateProactiveNotifications(): void {
    const now = Date.now();
    const timeSinceLastCheck = now - this.lastCheckTime;
    this.lastCheckTime = now;

    // Only generate if enough time has passed (minimum 5 minutes)
    if (timeSinceLastCheck < 5 * 60 * 1000) return;

    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // Time-based notifications
    this.generateTimeBasedNotifications(hour, dayOfWeek);

    // Context-based notifications
    this.generateContextBasedNotifications();

    // Random helpful suggestions
    if (Math.random() < 0.1) { // 10% chance
      this.generateRandomSuggestion();
    }
  }

  private generateTimeBasedNotifications(hour: number, dayOfWeek: number): void {
    // Morning productivity check
    if (hour === 9 && Math.random() < 0.3) {
      this.addNotification({
        type: 'toast',
        priority: 'low',
        title: 'Alfred here',
        message: 'Good morning, Miss! Shall we tackle some creative work today? I have a few ideas brewing.',
        autoHide: true,
        hideAfter: 8000,
        tags: ['morning', 'productivity']
      });
    }

    // Lunch break reminder
    if (hour === 13 && Math.random() < 0.2) {
      this.addNotification({
        type: 'toast',
        priority: 'low',
        title: 'Alfred suggests',
        message: 'Perhaps a spot of lunch, Miss? Even the Dark Knight needs proper sustenance.',
        autoHide: true,
        hideAfter: 6000,
        tags: ['health', 'break']
      });
    }

    // Evening wrap-up
    if (hour === 21 && Math.random() < 0.3) {
      this.addNotification({
        type: 'toast',
        priority: 'medium',
        title: 'End of day reflection',
        message: 'Quite a productive day, Miss! Shall we save our progress and prepare for tomorrow?',
        autoHide: true,
        hideAfter: 10000,
        tags: ['evening', 'reflection']
      });
    }

    // Weekend check-in
    if ((dayOfWeek === 6 || dayOfWeek === 0) && hour === 11 && Math.random() < 0.4) {
      this.addNotification({
        type: 'toast',
        priority: 'low',
        title: 'Weekend creativity',
        message: 'Ah, the weekend! Perfect time for some leisurely Batman universe building, wouldn\'t you say?',
        autoHide: true,
        hideAfter: 8000,
        tags: ['weekend', 'creative']
      });
    }
  }

  private generateContextBasedNotifications(): void {
    // Check for incomplete work (this would integrate with actual project data later)
    const hasIncompleteWork = Math.random() < 0.2; // Placeholder

    if (hasIncompleteWork) {
      this.addNotification({
        type: 'banner',
        priority: 'medium',
        title: 'Alfred notices',
        message: 'I see some unfinished character development from our last session. Shall we continue where we left off?',
        actions: [
          {
            id: 'continue',
            label: 'Continue work',
            action: 'accept',
            style: 'primary'
          },
          {
            id: 'later',
            label: 'Remind me later',
            action: 'defer',
            style: 'secondary'
          }
        ],
        tags: ['work', 'reminder']
      });
    }
  }

  private generateRandomSuggestion(): void {
    const suggestions = [
      {
        title: 'Alfred suggests',
        message: 'Have you considered exploring the relationship dynamics between Batman and Gotham\'s citizens? Fascinating territory.',
        tags: ['suggestion', 'batman', 'relationships']
      },
      {
        title: 'Creative insight',
        message: 'The Codex system could benefit from some cross-referencing features. Shall I elaborate on the concept?',
        tags: ['suggestion', 'codex', 'features']
      },
      {
        title: 'Alfred\'s observation',
        message: 'Your writing style has been evolving beautifully, Miss. Perhaps it\'s time to compile some of your best work?',
        tags: ['observation', 'writing', 'compilation']
      },
      {
        title: 'Technical note',
        message: 'I\'ve noticed some patterns in your creative workflow. Would you like me to suggest some optimizations?',
        tags: ['workflow', 'optimization', 'efficiency']
      }
    ];

    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    this.addNotification({
      type: 'toast',
      priority: 'low',
      title: suggestion.title,
      message: suggestion.message,
      autoHide: true,
      hideAfter: 12000,
      tags: suggestion.tags
    });
  }

  // Special notification types
  showResearchFindings(topic: string, findings: string[]): void {
    this.addNotification({
      type: 'modal',
      priority: 'high',
      title: `Research findings: ${topic}`,
      message: `I've found ${findings.length} relevant items about "${topic}". Would you like to review them?`,
      actions: [
        {
          id: 'review',
          label: 'Review findings',
          action: 'accept',
          style: 'primary'
        },
        {
          id: 'save',
          label: 'Save for later',
          action: 'defer',
          style: 'secondary'
        },
        {
          id: 'dismiss',
          label: 'Not now',
          action: 'dismiss',
          style: 'secondary'
        }
      ],
      tags: ['research', topic]
    });
  }

  showConflictDetected(item: string, description: string): void {
    this.addNotification({
      type: 'banner',
      priority: 'high',
      title: 'Conflict detected',
      message: `I've noticed an inconsistency with "${item}": ${description}`,
      actions: [
        {
          id: 'resolve',
          label: 'Resolve conflict',
          action: 'accept',
          style: 'primary'
        },
        {
          id: 'ignore',
          label: 'Ignore for now',
          action: 'dismiss',
          style: 'secondary'
        }
      ],
      persistent: true,
      tags: ['conflict', 'consistency']
    });
  }

  showWorkReminder(task: string): void {
    this.addNotification({
      type: 'toast',
      priority: 'medium',
      title: 'Gentle reminder',
      message: `Miss, you mentioned wanting to work on "${task}". Shall we tackle it now?`,
      autoHide: true,
      hideAfter: 10000,
      actions: [
        {
          id: 'start',
          label: 'Start now',
          action: 'accept',
          style: 'primary'
        },
        {
          id: 'snooze',
          label: 'Remind later',
          action: 'defer',
          style: 'secondary'
        }
      ],
      tags: ['reminder', 'task']
    });
  }
}

export const alfredNotifications = new AlfredNotificationService();

// Start proactive notifications with random intervals
if (typeof window !== 'undefined') {
  setInterval(() => {
    alfredNotifications.generateProactiveNotifications();
  }, 5 * 60 * 1000); // Check every 5 minutes
}