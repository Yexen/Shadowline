'use client';

import { useState, useEffect } from 'react';
import { serviceWorkerManager } from '@/lib/service-worker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TestTube, RefreshCw, Wifi, WifiOff, Smartphone, Monitor } from 'lucide-react';

export function ServiceWorkerStatus() {
  const [status, setStatus] = useState({
    isSupported: false,
    isRegistered: false,
    isActive: false
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get initial status
    setStatus(serviceWorkerManager.getStatus());

    // Update status periodically
    const interval = setInterval(() => {
      setStatus(serviceWorkerManager.getStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTestNotification = async () => {
    try {
      await serviceWorkerManager.testNotification();
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  const handleSyncReminders = async () => {
    try {
      await serviceWorkerManager.syncReminders();
    } catch (error) {
      console.error('Sync reminders failed:', error);
    }
  };

  const handleUpdateServiceWorker = async () => {
    try {
      await serviceWorkerManager.updateServiceWorker();
    } catch (error) {
      console.error('Update service worker failed:', error);
    }
  };

  const getStatusBadgeVariant = () => {
    if (!status.isSupported) return 'destructive';
    if (!status.isRegistered) return 'secondary';
    if (!status.isActive) return 'outline';
    return 'default';
  };

  const getStatusText = () => {
    if (!status.isSupported) return 'Not Supported';
    if (!status.isRegistered) return 'Not Registered';
    if (!status.isActive) return 'Inactive';
    return 'Active';
  };

  const isInstalled = serviceWorkerManager.isInstalled();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
          title="Background Notifications Status"
        >
          {status.isActive ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {status.isActive ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            <span>Background Notifications</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Worker</span>
                <Badge variant={getStatusBadgeVariant()}>
                  {getStatusText()}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Platform</span>
                <div className="flex items-center space-x-1">
                  {isInstalled ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  <span className="text-sm">
                    {isInstalled ? 'PWA' : 'Browser'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Badge variant={Notification.permission === 'granted' ? 'default' : 'secondary'}>
                  {Notification.permission}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Test Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleTestNotification}
                disabled={!status.isActive}
                className="w-full"
                size="sm"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Background Notification
              </Button>

              <Button
                onClick={handleSyncReminders}
                disabled={!status.isActive}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Reminders
              </Button>

              <Button
                onClick={handleUpdateServiceWorker}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Service Worker
              </Button>
            </CardContent>
          </Card>

          {/* Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>Background notifications</strong> work even when the app is closed.
                </p>
                {!status.isSupported && (
                  <p className="text-destructive">
                    Your browser doesn't support background notifications.
                  </p>
                )}
                {status.isSupported && !status.isActive && (
                  <p className="text-yellow-600">
                    Service worker is not active. Try refreshing the page.
                  </p>
                )}
                {status.isActive && (
                  <p className="text-green-600">
                    ✓ Background notifications are fully functional!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}