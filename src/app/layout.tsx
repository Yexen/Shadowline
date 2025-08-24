import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: "Shadows of Gotham Writer",
  description: "Your sanctuary for crafting tales in the dark city.",
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Rajdhani:wght@400;600;700&family=Vazirmatn:wght@400;600;700&display=swap"
          rel="stylesheet"
        />

        {/* PWA / Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        {/* iOS/macOS icon — 180×180 PNG, non-transparent with your #101014 bg */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        {/* PWA meta */}
        <meta name="application-name" content="Gotham Writer" />
        <meta name="theme-color" content="#101014" />
        <meta name="color-scheme" content="dark light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* iOS standalone tweaks */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Gotham Writer" />

        {/* Your helper script */}
        <style id="ai-generated-styles"></style>
        <script src="/js/firebaseHelper.js" defer></script>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

