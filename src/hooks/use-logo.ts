
'use client';

import { useState, useEffect, useCallback } from 'react';

const LOGO_STORAGE_KEY = 'gotham-app-logo';
const DEFAULT_LOGO_URL = '/default-logo.svg'; // A default SVG logo in the public folder

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (storedLogo) {
        setLogoUrl(storedLogo);
      } else {
        // Fetch the default SVG and store it as a data URL
        fetch(DEFAULT_LOGO_URL)
          .then(res => res.text())
          .then(svgText => {
            const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgText)}`;
             if (!localStorage.getItem(LOGO_STORAGE_KEY)) {
                setLogoUrl(svgDataUrl);
             }
          });
      }
    } catch (error) {
      console.error("Failed to access localStorage for logo", error);
      setLogoUrl(DEFAULT_LOGO_URL);
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
