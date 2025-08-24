'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, ButtonProps } from './ui/button';
import { Download } from 'lucide-react';

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isiOS() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
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
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    // iOS has no beforeinstallprompt; offer a hint
    if (isiOS()) setShowIOSHint(true);

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BIPEvent);
      setCanInstall(true);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice;
    } finally {
      // You can only use the event once
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  }, [deferredPrompt]);

  // Hide entirely if already installed
  if (installed) return null;

  // If we can show the real install prompt (Chrome/Android)
  if (canInstall && deferredPrompt) {
    return (
      <Button onClick={handleClick} {...props}>
        <Download className="mr-2"/>
        Install App
      </Button>
    );
  }

  // iOS fallback (no programmatic prompt)
  if (showIOSHint) {
    return (
      <Button
        {...props}
        variant={props.variant ?? 'secondary'}
        onClick={() =>
          alert(
            'To install on iPhone/iPad: tap the Share button, then "Add to Home Screen".'
          )
        }
      >
        Add to Home Screen
      </Button>
    );
  }

  // Otherwise, criteria not met — render nothing
  return null;
}