'use client';

import { usePopupStore } from '@/lib/global-popup-manager';

interface CreatePopupOptions {
  title: string;
  content: React.ReactNode;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export function usePopup() {
  const { addPopup, removePopup, updatePopup } = usePopupStore();

  const createPopup = ({
    title,
    content,
    width = 600,
    height = 400,
    x,
    y,
  }: CreatePopupOptions) => {
    // Center popup if no position specified
    const centerX = x ?? (window.innerWidth - width) / 2;
    const centerY = y ?? (window.innerHeight - height) / 2;

    const popupId = addPopup({
      title,
      content,
      width,
      height,
      x: Math.max(0, centerX),
      y: Math.max(0, centerY),
      isMinimized: false,
      isMaximized: false,
    });

    return {
      id: popupId,
      close: () => removePopup(popupId),
      update: (updates: any) => updatePopup(popupId, updates),
    };
  };

  return {
    createPopup,
    removePopup,
    updatePopup,
  };
}