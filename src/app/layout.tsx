// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/providers/client-providers';
import { AlfredAssistant } from '@/components/alfred-assistant';
import { AlfredNotificationContainer } from '@/components/alfred-notifications';
import { WindowContainer } from '@/components/window-container';

export const metadata: Metadata = {
  title: 'Shadowline',
  description: 'Welcome to the Shadows, Shadows of Gotham',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Shadowline',
  },
  icons: {
    icon: [
      { url: 'https://qh7zmtvimx9i7m9w.public.blob.vercel-storage.com/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
      { url: 'https://qh7zmtvimx9i7m9w.public.blob.vercel-storage.com/apple-touch-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: 'https://qh7zmtvimx9i7m9w.public.blob.vercel-storage.com/apple-touch-icon.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#101014',
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          <main className="min-h-screen">{children}</main>
          <footer className="border-t border-white/10 bg-black/40">
            <div className="mx-auto max-w-6xl px-4 py-6 text-xs opacity-75">
              © 2024 Shadowline
            </div>
          </footer>
          <AlfredAssistant />
          <AlfredNotificationContainer />
          <WindowContainer />
        </ClientProviders>
      </body>
    </html>
  );
}
