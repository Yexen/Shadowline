// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Shadowline',
  description: 'Welcome to the Shadows, Shadows of Gotham',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-white/10 bg-black/40">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs opacity-75">
            © {new Date().getFullYear()} Shadowline
          </div>
        </footer>
      </body>
    </html>
  );
}
