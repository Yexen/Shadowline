// src/app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'My App',
  description: 'This is my app',
};

const DEV_KEY = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || '';
const devConsoleHref = DEV_KEY
  ? `/dev-console?key=${encodeURIComponent(DEV_KEY)}`
  : '/dev-console';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/editor', label: 'Editor' },
  { href: '/drafts', label: 'Drafts' },
  { href: '/gallery', label: 'Gallery' },
  // Always visible, regardless of env:
  { href: devConsoleHref, label: 'Dev Console' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* --- SINGLE NAV (keep only here) --- */}
        <header className="border-b border-white/10 bg-black/40">
          <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 text-sm">
            <div className="mr-2 font-semibold tracking-wide">My App</div>
            <ul className="flex flex-wrap items-center gap-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded px-2 py-1 hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="min-h-[calc(100dvh-120px)]">{children}</main>

        <footer className="border-t border-white/10 bg-black/40">
          <div className="mx-auto max-w-6xl px-4 py-6 text-xs opacity-75">
            © {new Date().getFullYear()} My App
          </div>
        </footer>
      </body>
    </html>
  );
}
