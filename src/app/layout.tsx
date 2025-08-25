// src/app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'My App',
  description: 'This is my app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* --- SINGLE NAV (keep only here) --- */}
        <header>
          <nav>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </nav>
        </header>

        <main>{children}</main>

        <footer>
          <p>© {new Date().getFullYear()} My App</p>
        </footer>
      </body>
    </html>
  );
}
