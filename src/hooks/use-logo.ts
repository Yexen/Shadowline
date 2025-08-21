
'use client';

import { useState, useEffect, useCallback } from 'react';

const LOGO_STORAGE_KEY = 'gotham-app-logo';
// This is now just the bat symbol part of the logo, without the ellipse
const DEFAULT_LOGO_SVG_TEXT = `<svg viewBox="0 0 512 254.3" xmlns="http://www.w3.org/2000/svg"><path d="m256 12.3-37.4 39.5c-4.3 4.5-5.3 11.1-2.6 16.5l23.5 48.6-67.4 12.7c-7.1 1.3-12.4 7.6-12.4 14.9v57.8c0 5.4 4.4 9.8 9.8 9.8h172.9c5.4 0 9.8-4.4 9.8-9.8v-57.8c0-7.3-5.3-13.6-12.4-14.9l-67.4-12.7 23.5-48.6c2.7-5.5 1.7-12-2.6-16.5L256 12.3z"/></svg>`;
const DEFAULT_LOGO_URL = `data:image/svg+xml;base64,${typeof window !== 'undefined' ? window.btoa(DEFAULT_LOGO_SVG_TEXT) : ''}`;


export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // btoa is not available on server, so we re-set the state on client mount
    if (typeof window !== 'undefined' && !logoUrl.startsWith('data:')) {
        setLogoUrl(`data:image/svg+xml;base64,${window.btoa(DEFAULT_LOGO_SVG_TEXT)}`);
    }

    try {
      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (storedLogo) {
        setLogoUrl(storedLogo);
      } else {
        localStorage.setItem(LOGO_STORAGE_KEY, logoUrl);
      }
    } catch (error) {
      console.error("Failed to access localStorage for logo", error);
    } finally {
        setIsLoaded(true);
    }
  }, [logoUrl]);

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
