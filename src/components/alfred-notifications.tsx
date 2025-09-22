'use client';

import { useState, useEffect } from 'react';
import { alfredNotifications, type AlfredNotification } from '@/lib/alfred-notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle, Info, CheckCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Toast Notification Component
export function AlfredToast({ notification, onDismiss }: {
  notification: AlfredNotification;
  onDismiss: () => void;
}) {
  return (
    <Card className="w-80 bg-card border-border shadow-lg animate-in slide-in-from-right duration-300">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Image
            src="/alfred-avatar.png"
            alt="Alfred"
            width={32}
            height={32}
            className="w-8 h-8 object-cover flex-shrink-0"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))',
              borderRadius: '0'
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">{notification.title}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {notification.message}
            </p>
            {notification.actions && (
              <div className="flex space-x-2 mt-3">
                {notification.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.style === 'primary' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      action.handler?.();
                      onDismiss();
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Banner Notification Component
export function AlfredBanner({ notification, onDismiss }: {
  notification: AlfredNotification;
  onDismiss: () => void;
}) {
  const getPriorityIcon = () => {
    switch (notification.priority) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'medium': return <Info className="h-4 w-4 text-blue-400" />;
      default: return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn(
      "w-full bg-gradient-to-r border-l-4 p-4 shadow-md",
      notification.priority === 'critical' ? "from-red-50 to-red-100 border-red-400 dark:from-red-950 dark:to-red-900" :
      notification.priority === 'high' ? "from-yellow-50 to-yellow-100 border-yellow-400 dark:from-yellow-950 dark:to-yellow-900" :
      notification.priority === 'medium' ? "from-blue-50 to-blue-100 border-blue-400 dark:from-blue-950 dark:to-blue-900" :
      "from-gray-50 to-gray-100 border-gray-400 dark:from-gray-950 dark:to-gray-900"
    )}>
      <div className="flex items-start space-x-3">
        <Image
          src="/alfred-avatar.png"
          alt="Alfred"
          width={24}
          height={24}
          className="w-6 h-6 object-cover flex-shrink-0"
          style={{
            filter: 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.3))',
            borderRadius: '0'
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            {getPriorityIcon()}
            <h4 className="text-sm font-medium text-foreground">{notification.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.message}
          </p>
          {notification.actions && (
            <div className="flex space-x-2 mt-3">
              {notification.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.style === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    action.handler?.();
                    if (action.action === 'dismiss' || action.action === 'accept') {
                      onDismiss();
                    }
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Modal Notification Component
export function AlfredModal({ notification, onDismiss }: {
  notification: AlfredNotification;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onDismiss} />
      <Card className="relative w-full max-w-md mx-4 bg-card border-border shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Image
              src="/alfred-avatar.png"
              alt="Alfred"
              width={40}
              height={40}
              className="w-10 h-10 object-cover flex-shrink-0"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))',
                borderRadius: '0'
              }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{notification.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {notification.actions && (
            <div className="flex justify-end space-x-2 mt-6">
              {notification.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.style === 'primary' ? 'default' : action.style === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => {
                    action.handler?.();
                    onDismiss();
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Badge Notification Component
export function AlfredBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
      {count > 9 ? '9+' : count}
    </Badge>
  );
}

// Main Notification Container
export function AlfredNotificationContainer() {
  const [notifications, setNotifications] = useState<AlfredNotification[]>([]);

  useEffect(() => {
    const unsubscribe = alfredNotifications.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const toasts = notifications.filter(n => n.type === 'toast');
  const banners = notifications.filter(n => n.type === 'banner');
  const modals = notifications.filter(n => n.type === 'modal');

  const handleDismiss = (id: string) => {
    alfredNotifications.removeNotification(id);
  };

  return (
    <>
      {/* Toast Notifications - Fixed position, top right */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {toasts.map((notification) => (
          <AlfredToast
            key={notification.id}
            notification={notification}
            onDismiss={() => handleDismiss(notification.id)}
          />
        ))}
      </div>

      {/* Banner Notifications - Fixed position, top center */}
      <div className="fixed top-0 left-0 right-0 z-30 space-y-0">
        {banners.map((notification) => (
          <AlfredBanner
            key={notification.id}
            notification={notification}
            onDismiss={() => handleDismiss(notification.id)}
          />
        ))}
      </div>

      {/* Modal Notifications - Overlay */}
      {modals.map((notification) => (
        <AlfredModal
          key={notification.id}
          notification={notification}
          onDismiss={() => handleDismiss(notification.id)}
        />
      ))}
    </>
  );
}