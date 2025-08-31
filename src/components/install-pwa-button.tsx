'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, ButtonProps } from './ui/button';
import { Download, Smartphone, Monitor } from 'lucide-react';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isiOS() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
}

function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/.test(window.navigator.userAgent);
}

function isMacDesktop() {
  if (typeof window === 'undefined') return false;
  return /Mac/.test(window.navigator.userAgent) && !(navigator as any).maxTouchPoints;
}

function isWindows() {
  if (typeof window === 'undefined') return false;
  return /Win/.test(window.navigator.userAgent);
}

function getPlatformIcon() {
  if (isiOS()) return <Smartphone className="w-4 h-4" />;
  if (isAndroid()) return <Smartphone className="w-4 h-4" />;
  if (isMacDesktop() || isWindows()) return <Monitor className="w-4 h-4" />;
  return <Download className="w-4 h-4" />;
}

function getPlatformText() {
  if (isiOS()) return 'Add to Home Screen';
  if (isAndroid()) return 'Install App';
  if (isMacDesktop()) return 'Install on Mac';
  if (isWindows()) return 'Install on Windows';
  return 'Install App';
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  // iOS Safari
  const iosStandalone = (window.navigator as any).standalone === true;
  // PWA display modes
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches;
  const displayModeTwa = window.matchMedia?.('(display-mode: minimal-ui)').matches; // some Android variants
  return iosStandalone || displayModeStandalone || displayModeTwa;
}

export function InstallPwaButton(props: ButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BIPEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showInstallHint, setShowInstallHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    // Show install hint for iOS and other platforms
    if (isiOS() || isMacDesktop() || isWindows()) {
      setShowInstallHint(true);
    }

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BIPEvent);
      setCanInstall(true);
      setShowInstallHint(false); // Hide manual hint if native prompt is available
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setCanInstall(false);
      setShowInstallHint(false);
    };

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } finally {
        setDeferredPrompt(null);
        setCanInstall(false);
      }
    }
  }, [deferredPrompt]);

  const handleManualInstallClick = useCallback(() => {
    if (isiOS()) {
      alert('To install on iPhone/iPad:\n1. Tap the Share button (□↗) in Safari\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
    } else if (isMacDesktop()) {
      alert('To install on Mac:\n1. In Safari: Go to File → Add to Dock\n2. In Chrome: Click ⋮ menu → Install "Shadowline"\n3. In Firefox: Look for the install icon in the address bar');
    } else if (isWindows()) {
      alert('To install on Windows:\n1. In Chrome/Edge: Click ⋮ menu → Install "Shadowline"\n2. In Firefox: Look for the install icon in the address bar\n3. The app will appear in your Start Menu');
    }
  }, []);

  // Hide entirely if already installed
  if (installed) return null;

  // If we can show the real install prompt (Chrome/Android)
  if (canInstall && deferredPrompt) {
    return (
      <Button 
        onClick={handleClick} 
        {...props}
        className={`${props.className || ''} bg-yellow-500 hover:bg-yellow-600 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
      >
        {getPlatformIcon()}
        <span className="ml-2">{getPlatformText()}</span>
      </Button>
    );
  }

  // Manual install instructions for all other platforms
  if (showInstallHint) {
    return (
      <Button
        {...props}
        className={`${props.className || ''} bg-yellow-500 hover:bg-yellow-600 text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
        onClick={handleManualInstallClick}
      >
        {getPlatformIcon()}
        <span className="ml-2">{getPlatformText()}</span>
      </Button>
    );
  }

  // Otherwise, criteria not met — render nothing
  return null;
}
