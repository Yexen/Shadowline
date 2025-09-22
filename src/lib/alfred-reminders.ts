'use client';

export interface Reminder {
  id: string;
  title: string;
  message: string;
  scheduledTime: Date;
  createdTime: Date;
  isActive: boolean;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  originalInput: string;
  tags: string[];
}

class AlfredReminderService {
  private reminders: Map<string, Reminder> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();
  private storageKey = 'alfred-reminders';
  private subscribers: ((reminders: Reminder[]) => void)[] = [];

  constructor() {
    this.loadReminders();
    this.scheduleActiveReminders();
  }

  // Natural language time parsing
  parseTimeFromText(input: string): Date | null {
    const now = new Date();
    const text = input.toLowerCase();

    // Handle specific times like "at 2", "at 2:30", "at 14:00"
    const timeMatch = text.match(/(?:at|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2] || '0');
      const period = timeMatch[3];

      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      const reminderTime = new Date(now);
      reminderTime.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      return reminderTime;
    }

    // Handle relative times like "in 30 minutes", "in 2 hours"
    const relativeMatch = text.match(/in\s+(\d+)\s*(minute|hour|day)s?/);
    if (relativeMatch) {
      const amount = parseInt(relativeMatch[1]);
      const unit = relativeMatch[2];
      const reminderTime = new Date(now);

      switch (unit) {
        case 'minute':
          reminderTime.setMinutes(reminderTime.getMinutes() + amount);
          break;
        case 'hour':
          reminderTime.setHours(reminderTime.getHours() + amount);
          break;
        case 'day':
          reminderTime.setDate(reminderTime.getDate() + amount);
          break;
      }

      return reminderTime;
    }

    // Handle tomorrow at specific time
    const tomorrowMatch = text.match(/tomorrow\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
    if (tomorrowMatch) {
      let hours = parseInt(tomorrowMatch[1]);
      const minutes = parseInt(tomorrowMatch[2] || '0');
      const period = tomorrowMatch[3];

      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      const reminderTime = new Date(now);
      reminderTime.setDate(reminderTime.getDate() + 1);
      reminderTime.setHours(hours, minutes, 0, 0);

      return reminderTime;
    }

    // Handle next week
    const nextWeekMatch = text.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (nextWeekMatch) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(nextWeekMatch[1]);
      const reminderTime = new Date(now);

      const daysUntilTarget = (7 - now.getDay() + targetDay) % 7 || 7;
      reminderTime.setDate(reminderTime.getDate() + daysUntilTarget);
      reminderTime.setHours(9, 0, 0, 0); // Default to 9 AM

      return reminderTime;
    }

    return null;
  }

  // Extract reminder content from natural language
  parseReminderFromText(input: string): { message: string; time: Date | null } {
    const text = input.toLowerCase().trim();

    // Handle patterns like "remind me to [task] at [time]" or "remind me [task] at [time]"
    const reminderMatch = text.match(/remind\s+me\s+(?:to\s+)?(.*?)(?:\s+(?:at|@|in|tomorrow|next)\s+.*)?$/);

    let message = '';
    if (reminderMatch) {
      message = reminderMatch[1];
      // Clean up common connecting words at the end
      message = message.replace(/\s+(at|@|in|tomorrow|next).*$/, '');
    } else {
      // Fallback: use the whole input as the message
      message = input;
    }

    const time = this.parseTimeFromText(input);

    return {
      message: message.trim(),
      time
    };
  }

  // Create a new reminder
  createReminder(input: string): Reminder | null {
    const parsed = this.parseReminderFromText(input);

    if (!parsed.time) {
      return null;
    }

    const reminder: Reminder = {
      id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: parsed.message.substring(0, 50) + (parsed.message.length > 50 ? '...' : ''),
      message: parsed.message,
      scheduledTime: parsed.time,
      createdTime: new Date(),
      isActive: true,
      isRecurring: false,
      originalInput: input,
      tags: []
    };

    this.reminders.set(reminder.id, reminder);
    this.scheduleReminder(reminder);
    this.saveReminders();
    this.notifySubscribers();

    // Schedule in service worker for background notifications
    this.scheduleInServiceWorker(reminder);

    return reminder;
  }

  // Schedule reminder in service worker for background notifications
  private async scheduleInServiceWorker(reminder: Reminder) {
    try {
      const { serviceWorkerManager } = await import('./service-worker');
      await serviceWorkerManager.scheduleReminder(reminder);
    } catch (error) {
      console.error('Failed to schedule reminder in service worker:', error);
    }
  }

  // Schedule a reminder to fire
  private scheduleReminder(reminder: Reminder) {
    if (!reminder.isActive) return;

    const now = new Date();
    const timeUntilReminder = reminder.scheduledTime.getTime() - now.getTime();

    if (timeUntilReminder <= 0) {
      // Fire immediately if time has passed
      this.fireReminder(reminder);
      return;
    }

    const timeout = setTimeout(() => {
      this.fireReminder(reminder);
    }, timeUntilReminder);

    this.timeouts.set(reminder.id, timeout);
  }

  // Fire a reminder (show notification)
  private fireReminder(reminder: Reminder) {
    // Show native OS notification with popup
    import('./native-notifications').then(({ nativeNotifications }) => {
      nativeNotifications.showReminderNotification(
        'Alfred Reminder',
        reminder.message,
        () => this.snoozeReminder(reminder.id, 10)
      );
    });

    // Also show in-app notification
    import('./alfred-notifications').then(({ alfredNotifications }) => {
      alfredNotifications.addNotification({
        type: 'toast',
        priority: 'high',
        title: '⏰ Alfred Reminder',
        message: reminder.message,
        actions: [
          {
            id: 'done',
            label: 'Mark Done',
            action: 'dismiss',
            style: 'primary'
          },
          {
            id: 'snooze',
            label: 'Snooze 10 min',
            action: 'custom',
            style: 'secondary',
            callback: () => this.snoozeReminder(reminder.id, 10)
          }
        ],
        autoHide: false,
        tags: ['reminder', 'alfred']
      });
    });

    // Mark as completed if not recurring
    if (!reminder.isRecurring) {
      this.completeReminder(reminder.id);
    } else {
      this.scheduleNextRecurrence(reminder);
    }
  }

  // Snooze a reminder for specified minutes
  snoozeReminder(reminderId: string, minutes: number) {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) return;

    const newTime = new Date();
    newTime.setMinutes(newTime.getMinutes() + minutes);

    reminder.scheduledTime = newTime;
    this.scheduleReminder(reminder);
    this.saveReminders();
    this.notifySubscribers();
  }

  // Mark reminder as completed
  completeReminder(reminderId: string) {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) return;

    reminder.isActive = false;

    // Clear timeout
    const timeout = this.timeouts.get(reminderId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(reminderId);
    }

    this.saveReminders();
    this.notifySubscribers();
  }

  // Delete a reminder
  deleteReminder(reminderId: string) {
    const timeout = this.timeouts.get(reminderId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(reminderId);
    }

    this.reminders.delete(reminderId);
    this.saveReminders();
    this.notifySubscribers();
  }

  // Schedule next recurrence for recurring reminders
  private scheduleNextRecurrence(reminder: Reminder) {
    if (!reminder.recurringPattern) return;

    const nextTime = new Date(reminder.scheduledTime);

    switch (reminder.recurringPattern) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + 1);
        break;
      case 'weekly':
        nextTime.setDate(nextTime.getDate() + 7);
        break;
      case 'monthly':
        nextTime.setMonth(nextTime.getMonth() + 1);
        break;
    }

    reminder.scheduledTime = nextTime;
    this.scheduleReminder(reminder);
    this.saveReminders();
    this.notifySubscribers();
  }

  // Get all reminders
  getAllReminders(): Reminder[] {
    return Array.from(this.reminders.values()).sort((a, b) =>
      a.scheduledTime.getTime() - b.scheduledTime.getTime()
    );
  }

  // Get active reminders
  getActiveReminders(): Reminder[] {
    return this.getAllReminders().filter(r => r.isActive);
  }

  // Load reminders from localStorage
  private loadReminders() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const reminderData = JSON.parse(stored);
        reminderData.forEach((data: any) => {
          const reminder: Reminder = {
            ...data,
            scheduledTime: new Date(data.scheduledTime),
            createdTime: new Date(data.createdTime)
          };
          this.reminders.set(reminder.id, reminder);
        });
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  }

  // Save reminders to localStorage
  private saveReminders() {
    if (typeof window === 'undefined') return;

    try {
      const reminderData = Array.from(this.reminders.values());
      localStorage.setItem(this.storageKey, JSON.stringify(reminderData));
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  }

  // Schedule all active reminders (used on app start)
  private scheduleActiveReminders() {
    this.getActiveReminders().forEach(reminder => {
      this.scheduleReminder(reminder);
    });
  }

  // Subscribe to reminder changes
  subscribe(callback: (reminders: Reminder[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  // Notify subscribers of changes
  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback(this.getAllReminders());
    });
  }

  // Format time for display
  formatReminderTime(time: Date): string {
    const now = new Date();
    const isToday = time.toDateString() === now.toDateString();
    const isTomorrow = time.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today at ${timeString}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${timeString}`;
    } else {
      return `${time.toLocaleDateString()} at ${timeString}`;
    }
  }
}

// Export singleton instance
export const alfredReminders = new AlfredReminderService();