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
  action: 'dismiss' | 'accept' | 'defer' | 'custom' | 'remind_later';
  handler?: () => void;
  style?: 'primary' | 'secondary' | 'destructive';
  customData?: any;
}

class AlfredNotificationService {
  private notifications: AlfredNotification[] = [];
  private listeners: ((notifications: AlfredNotification[]) => void)[] = [];
  private lastCheckTime: number = Date.now();

  // Add notification
  addNotification(notification: Omit<AlfredNotification, 'id' | 'timestamp'>): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const newNotification: AlfredNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification
    };

    // Set up default handlers for action buttons if not provided
    if (newNotification.actions) {
      newNotification.actions = newNotification.actions.map(action => ({
        ...action,
        handler: action.handler || this.createDefaultHandler(action, id)
      }));
    }

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto-hide if specified
    if (newNotification.autoHide && newNotification.hideAfter) {
      setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.hideAfter);
    }

    return id;
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

  // Create default handlers for action buttons
  private createDefaultHandler(action: NotificationAction, notificationId: string): () => void {
    return () => {
      switch (action.action) {
        case 'dismiss':
          this.removeNotification(notificationId);
          break;
        case 'accept':
          // Handle accept action - could trigger specific functionality
          this.handleAcceptAction(action, notificationId);
          this.removeNotification(notificationId);
          break;
        case 'defer':
          // Handle defer action - could move to later
          this.handleDeferAction(action, notificationId);
          this.removeNotification(notificationId);
          break;
        case 'remind_later':
          // Handle remind later - will implement time picker
          this.handleRemindLaterAction(action, notificationId);
          break;
        case 'custom':
          // Handle custom actions
          this.handleCustomAction(action, notificationId);
          break;
        default:
          this.removeNotification(notificationId);
      }
    };
  }

  private handleAcceptAction(action: NotificationAction, _notificationId: string): void {
    // Log or handle the accept action
    console.log(`User accepted: ${action.id}`);
    // Could trigger specific functionality based on action.id
  }

  private handleDeferAction(action: NotificationAction, _notificationId: string): void {
    // Log or handle the defer action
    console.log(`User deferred: ${action.id}`);
    // Could reschedule or save for later
  }

  private handleRemindLaterAction(_action: NotificationAction, notificationId: string): void {
    // Get the notification details
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Trigger the remind me later modal by dispatching a custom event
    const remindLaterEvent = new CustomEvent('alfred:remind-later', {
      detail: {
        notificationId,
        title: notification.title,
        message: notification.message
      }
    });
    
    window.dispatchEvent(remindLaterEvent);
    
    // Remove the current notification
    this.removeNotification(notificationId);
  }

  private handleCustomAction(action: NotificationAction, notificationId: string): void {
    // Handle custom actions based on action.id
    console.log(`Custom action: ${action.id}`);
    this.removeNotification(notificationId);
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