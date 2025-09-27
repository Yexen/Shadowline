'use client';

import { useWindowManager } from '@/lib/window-manager';
import { WindowRenderer } from './window-renderer';
import { WindowTaskbar } from './window-taskbar';

export function WindowManager() {
  const { windows } = useWindowManager();

  return (
    <>
      {windows.map((window) => (
        <WindowRenderer key={window.id} windowId={window.id} />
      ))}
      <WindowTaskbar />
    </>
  );
}