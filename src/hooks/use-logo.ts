
'use client';

import { useState, useEffect, useCallback } from 'react';

const LOGO_STORAGE_KEY = 'gotham-app-logo';

const DEFAULT_LOGO_URL = `https://firebasestorage.googleapis.com/v0/b/shadows-of-gotham.firebasestorage.app/o/Logo%20(8).png?alt=media&token=d6d67b52-e7b8-44c2-8259-c38d85683098`;


export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (storedLogo) {
        setLogoUrl(storedLogo);
      } else {
        localStorage.setItem(LOGO_STORAGE_KEY, DEFAULT_LOGO_URL);
        setLogoUrl(DEFAULT_LOGO_URL);
      }
    } catch (error) {
      console.error("Failed to access localStorage for logo", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveLogo = useCallback((newLogoDataUrl: string) => {
    try {
      localStorage.setItem(LOGO_STORAGE_KEY, newLogoDataUrl);
      setLogoUrl(newLogoDataUrl);
    } catch (error) {
      console.error("Failed to save logo to localStorage", error);
    }
  }, []);

  return { isLoaded, logoUrl, setLogoUrl: saveLogo };
}
