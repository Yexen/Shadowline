'use client';

import React from 'react';
import { useWindowManager } from '@/lib/window-manager';
import { WindowRenderer } from './window-renderer';

export function WindowContainer() {
  const { windows } = useWindowManager();

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 999 }}>
      {windows.map((window) => (
        <div key={window.id} className="pointer-events-auto">
          <WindowRenderer windowId={window.id} />
        </div>
      ))}
    </div>
  );
}