
'use client';
import { useState, useEffect, useCallback } from 'react';

const LOGO_STORAGE_KEY = 'gotham-app-logo';
// Fallback to a simple SVG bat logo if Firebase storage fails
const DEFAULT_LOGO_URL = 'data:image/svg+xml;base64,' + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40" fill="currentColor">
  <path d="M20 35c-8-4-15-12-18-20 0 0 5 8 18 8s18-8 18-8c-3 8-10 16-18 20z"/>
  <path d="M15 15c-5-8-10-10-15-8 2-2 8-2 12 2 0 0-2-5 3-6-2 4 0 8 0 12z"/>
  <path d="M85 15c5-8 10-10 15-8-2-2-8-2-12 2 0 0 2-5-3-6 2 4 0 8 0 12z"/>
  <circle cx="35" cy="18" r="2"/>
  <circle cx="65" cy="18" r="2"/>
  <text x="50" y="38" text-anchor="middle" font-family="serif" font-size="8" font-weight="bold">SHADOWLINE</text>
</svg>`);

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const url = localStorage.getItem(LOGO_STORAGE_KEY) || DEFAULT_LOGO_URL;

    // Preload so broken URLs don’t render a broken img
    const img = new Image();
    img.onload = () => {
      setLogoUrl(url);
      setIsLoaded(true);
    };
    img.onerror = () => {
      console.warn('Logo failed to load, falling back to default.');
      setLogoUrl(DEFAULT_LOGO_URL);
      setIsLoaded(true);
      localStorage.setItem(LOGO_STORAGE_KEY, DEFAULT_LOGO_URL);
    };
    img.src = url;
  }, []);

  const saveLogo = useCallback((newUrl: string) => {
    localStorage.setItem(LOGO_STORAGE_KEY, newUrl);
    setLogoUrl(newUrl);
  }, []);

  return { isLoaded, logoUrl, setLogoUrl: saveLogo };
}
