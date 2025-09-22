'use client';

import React, { useEffect, ReactNode } from 'react';
import { usePopup } from '@/hooks/use-popup';

interface PopupDialogWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
  height?: number;
}

export function PopupDialogWrapper({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 800, 
  height = 600 
}: PopupDialogWrapperProps) {
  const { createPopup } = usePopup();
  const [popupId, setPopupId] = React.useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !popupId) {
      // Create popup when dialog should open
      const popup = createPopup({
        title,
        content: (
          <div className="p-6 h-full overflow-auto">
            {children}
          </div>
        ),
        width,
        height,
      });
      setPopupId(popup.id);

      // Store cleanup function
      const cleanup = () => {
        setPopupId(null);
        onClose();
      };

      // Set up listener for popup close
      const unsubscribe = usePopupStore.subscribe((state) => {
        const exists = state.popups.find((p) => p.id === popup.id);
        if (!exists && popupId) {
          cleanup();
        }
      });

      return unsubscribe;
    }
    
    if (!isOpen && popupId) {
      // Close popup when dialog should close
      const { removePopup } = usePopupStore.getState();
      removePopup(popupId);
      setPopupId(null);
    }
  }, [isOpen, popupId, createPopup, onClose, title, children, width, height]);

  // This component doesn't render anything directly - it manages popup state
  return null;
}