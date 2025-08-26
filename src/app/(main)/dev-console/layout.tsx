// src/app/(main)/dev-console/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";        // console should never be cached
export const revalidate = 0;
export const fetchCache = "default-no-store";

export default function DevConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      {/* COVER / BANNER */}
      <div className="relative w-full overflow-hidden rounded-b-xl border border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">
        {/* You can swap this gradient for a real image with next/image if you like */}
        <div className="aspect-[21/5] w-full bg-[url('/images/bat-cover.jpg')] bg-cover bg-center opacity-70" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-6 pb-4 md:px-10 md:pb-6 flex items-center justify-between">
            <h1 className="font-headline text-3xl md:text-4xl tracking-widest text-white">
              BAT COMPUTER
            </h1>
            <div className="flex items-center gap-2">
              <Link
                href="/dev-console"
                target="_blank"
                className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20"
              >
                Open in New Window ↗
              </Link>
              <button
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5"
                // hook up your cover editor here
              >
                Change Cover
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mx-auto w-full max-w-screen-2xl px-3 md:px-6">
        <div className="grid grid-cols-12 gap-4 py-6">

          {/* CENTER CONSOLE PANEL */}
          <section
            className="col-span-12 lg:col-span-8 rounded-xl border border-yellow-500/20 bg-black/30 p-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]"
            role="region"
            aria-label="AI Console"
          >
            {/* Tab strip (fake tabs; wire your own Tabs here if you like) */}
            <div className="flex items-center justify-center gap-2 py-3">
              <span className="rounded-md border border-white/10 px-3 py-1 text-sm text-zinc-300">
                AI Chat
              </span>
              <span className="rounded-md border border-white/10 px-3 py-1 text-sm text-zinc-300">
                Terminal
              </span>
            </div>

            {/* The actual page content goes here (your chat/terminal UI) */}
            <div className="px-4 pb-4">
              {children}
            </div>

            {/* COMMAND BAR SHELL (your page can target these ids if you want) */}
            <div className="mt-2 border-t border-white/10 p-3">
              <div id="console-command-bar" className="flex flex-col gap-3">
                {/* input row placeholder */}
                <div className="flex w-full items-center gap-2">
                  <div className="flex-1 rounded-md border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200">
                    {/* your input goes here (or replace this whole div in the child) */}
                    <span className="text-zinc-500">› Enter command…</span>
                  </div>
                  <button className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20">
                    Preview
                  </button>
                  <button className="rounded-md border border-yellow-500/30 bg-yellow-500/20 px-3 py-2 text-sm font-semibold text-yellow-300 hover:bg-yellow-500/30">
                    Execute
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR: FILE EXPLORER + LIVE LOG */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* FILE EXPLORER */}
            <div className="rounded-xl border border-yellow-500/25 bg-black/30">
              <div className="border-b border-yellow-500/20 px-4 py-3 text-sm font-semibold tracking-wider text-yellow-400">
                FILE EXPLORER
              </div>
              <div className="max-h-[44vh] overflow-auto px-3 py-2 text-sm text-zinc-300">
                {/* mount your tree here */}
                <div className="flex items-center gap-2 py-1">
                  <span className="text-yellow-500">▸</span>
                  <span className="font-medium">shadows-of-gotham</span>
                </div>
                {/* … */}
              </div>
            </div>

            {/* LIVE LOG */}
            <div className="rounded-xl border border-yellow-500/25 bg-black/30">
              <div className="border-b border-yellow-500/20 px-4 py-3 text-sm font-semibold tracking-wider text-yellow-400">
                LIVE LOG
              </div>
              <div className="max-h-[28vh] overflow-auto px-4 py-3 text-xs font-mono leading-relaxed text-yellow-300">
                <p>&gt; Initializing Bat Computer OS v3.1</p>
                <p>&gt; File system integrity: OK.</p>
                <p>&gt; Power levels: 98.7%</p>
                <p>&gt; Running diagnostics on all subsystems…</p>
                {/* mount your live log stream here */}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
