'use client';

import React from 'react';
import { usePopupStore } from '@/lib/global-popup-manager';
import { ResizablePopup } from './resizable-popup';
import { PopupTaskbar } from './popup-taskbar';

export function GlobalPopupContainer() {
  const { popups } = usePopupStore();

  return (
    <>
      {/* Popup Taskbar */}
      <PopupTaskbar />
      
      {/* Render all popups */}
      {popups.map((popup) => (
        <ResizablePopup key={popup.id} popup={popup} />
      ))}
    </>
  );
}