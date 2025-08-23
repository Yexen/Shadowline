
'use client';

import { useState, useEffect, useCallback } from 'react';

const LOGO_STORAGE_KEY = 'gotham-app-logo';

const NEW_LOGO_SVG_TEXT = `
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(250,250,240);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(220,220,210);stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
    </defs>
    <!-- Bat Symbol -->
    <path fill="url(#grad1)" filter="url(#glow)" d="M200,30 C150,30 100,80 100,150 C100,220 150,270 200,270 C250,270 300,220 300,150 C300,80 250,30 200,30 Z M200,50 C238.66,50 270,76.27 280,110 L260,110 C255,87 230,70 200,70 C170,70 145,87 140,110 L120,110 C130,76.27 161.34,50 200,50 Z M125,120 C135,140 150,150 165,150 L140,190 C130,210 120,220 120,220 C110,190 115,150 125,120 Z M275,120 C285,150 290,190 280,220 C280,220 270,210 260,190 L235,150 C250,150 265,140 275,120 Z M200,160 L225,180 L200,240 L175,180 L200,160 Z"/>
    <!-- Swords -->
    <g transform="translate(200, 160) rotate(45) scale(0.6)">
        <path fill="#B0C4DE" stroke="#4682B4" stroke-width="3" d="M -5 -100 L 5 -100 L 5 0 L 15 10 L 15 20 L -15 20 L -15 10 L -5 0 Z" />
        <path fill="#708090" d="M -12 12 L 12 12 L 12 18 L -12 18 Z" />
    </g>
    <g transform="translate(200, 160) rotate(-45) scale(0.6)">
        <path fill="#B0C4DE" stroke="#4682B4" stroke-width="3" d="M -5 -100 L 5 -100 L 5 0 L 15 10 L 15 20 L -15 20 L -15 10 L -5 0 Z" />
        <path fill="#708090" d="M -12 12 L 12 12 L 12 18 L -12 18 Z" />
    </g>
    <!-- Text -->
    <text x="200" y="270" font-family="Orbitron, sans-serif" font-size="24" fill="#EAEAEA" text-anchor="middle" letter-spacing="2">SHADOWS OF GOTHAM</text>
</svg>
`;

const DEFAULT_LOGO_URL = `https://firebasestorage.googleapis.com/v0/b/shadows-of-gotham.firebasestorage.app/o/alimoini_Ultra-wide_comic-book_splash_header_on_a_rain-slick__039016ec-7d75-4c0a-8233-4e1ec46921c4_3.png?alt=media&token=0d9079bb-628f-4ac6-92b3-dbc6419fae47`;


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
