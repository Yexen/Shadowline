// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { UserDataSyncProvider } from '@/components/providers/user-data-sync-provider';
import { AuthProvider } from '@/components/providers/auth-provider';

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
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
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
    <html lang="en">
      <body>
        <AuthProvider>
          <UserDataSyncProvider>
            <main className="min-h-screen">{children}</main>
            <footer className="border-t border-white/10 bg-black/40">
              <div className="mx-auto max-w-6xl px-4 py-6 text-xs opacity-75">
                © {new Date().getFullYear()} Shadowline
              </div>
            </footer>
          </UserDataSyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
