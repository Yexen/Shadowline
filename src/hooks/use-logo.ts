
'use client';
import { useState, useEffect, useCallback } from 'react';

const LOGO_STORAGE_KEY = 'gotham-app-logo';
// Use Vercel storage for the app logo
const DEFAULT_LOGO_URL = 'https://qh7zmtvimx9i7m9w.public.blob.vercel-storage.com/icon-512x512%20%281%29.png';

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
