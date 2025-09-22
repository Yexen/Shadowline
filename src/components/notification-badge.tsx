'use client';

import { useState, useEffect } from 'react';
import { nativeNotifications } from '@/lib/native-notifications';
import { serviceWorkerManager } from '@/lib/service-worker';
import { Bell, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  showIcon?: boolean;
  onClick?: () => void;
}

export function NotificationBadge({ className, showIcon = true, onClick }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Subscribe to unread count changes
    const unsubscribe = nativeNotifications.subscribe((count) => {
      setUnreadCount(count);
    });

    return unsubscribe;
  }, []);

  const handleClick = () => {
    // Request notification permission if not granted
    nativeNotifications.requestPermission();
    onClick?.();
  };

  if (!showIcon && unreadCount === 0) {
    return null;
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      {showIcon && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
          title={`${unreadCount} unread notifications`}
        >
          <Bell className="h-4 w-4" />
        </Button>
      )}

      {unreadCount > 0 && (
        <span className={cn(
          "absolute flex items-center justify-center",
          "min-w-[18px] h-[18px] px-1",
          "text-xs font-bold text-white bg-red-500 rounded-full",
          "transform transition-all duration-200",
          "animate-in zoom-in-50 duration-200",
          showIcon ? "-top-1 -right-1" : "top-0 right-0"
        )}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
}

// Floating notification badge for mobile/PWA
export function FloatingNotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = nativeNotifications.subscribe((count) => {
      setUnreadCount(count);
      setIsVisible(count > 0);
    });

    return unsubscribe;
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-none">
      <div className={cn(
        "flex items-center justify-center",
        "w-8 h-8 bg-red-500 text-white text-sm font-bold rounded-full",
        "shadow-lg animate-pulse"
      )}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </div>
    </div>
  );
}

// Permission request component
export function NotificationPermissionRequest() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check current permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setIsVisible(Notification.permission === 'default');
    }
  }, []);

  const requestPermission = async () => {
    const result = await nativeNotifications.requestPermission();
    setPermission(result);
    setIsVisible(false);

    if (result === 'granted') {
      // Show a test notification
      nativeNotifications.showNotification({
        title: 'Alfred Notifications Enabled',
        body: 'You\'ll now receive real-time notifications from Alfred!',
        tag: 'permission-granted',
        requireInteraction: false
      });
    }
  };

  if (!isVisible || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Enable Notifications
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Get notified when Alfred has reminders or important updates for you.
            </p>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                onClick={requestPermission}
                className="text-xs"
              >
                Enable
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-xs"
              >
                Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}