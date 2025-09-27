'use client';

import { useWindowManager } from '@/lib/window-manager';
import { Minus } from 'lucide-react';

export function WindowTaskbar() {
  const { windows, updateWindow, bringToFront } = useWindowManager();

  // Only show minimized windows in taskbar
  const minimizedWindows = windows.filter(w => w.isMinimized);

  if (minimizedWindows.length === 0) {
    return null;
  }

  const handleRestore = (windowId: string) => {
    updateWindow(windowId, { isMinimized: false });
    bringToFront(windowId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur border-t border-border">
      <div className="flex items-center gap-2 p-2 overflow-x-auto ml-64">
        {minimizedWindows.map((window) => (
          <button
            key={window.id}
            onClick={() => handleRestore(window.id)}
            className="group flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted border border-border rounded-md transition-colors min-w-0 max-w-48"
            title={`Restore: ${window.title}`}
          >
            <Minus className="w-3 h-3 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
            <span className="text-xs font-medium text-foreground truncate">
              {window.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}