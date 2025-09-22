'use client';

import React from 'react';
import { usePopupStore } from '@/lib/global-popup-manager';
import { Minus, Square, X } from 'lucide-react';

export function PopupTaskbar() {
  const { popups, bringToFront, restorePopup, removePopup, clearAllPopups } = usePopupStore();

  if (popups.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 shadow-2xl">
      <div className="flex items-center space-x-2">
        {/* Popup Icons */}
        {popups.map((popup) => (
          <div
            key={popup.id}
            className={`flex items-center space-x-1 px-2 py-1 rounded cursor-pointer transition-all ${
              popup.isMinimized 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-blue-500/20 hover:bg-blue-500/30'
            }`}
            onClick={() => {
              if (popup.isMinimized) {
                restorePopup(popup.id);
              } else {
                bringToFront(popup.id);
              }
            }}
            title={popup.title}
          >
            <span className="text-xs text-white max-w-[100px] truncate">
              {popup.title}
            </span>
            {popup.isMinimized && (
              <Minus className="w-3 h-3 text-gray-400" />
            )}
          </div>
        ))}

        {/* Separator */}
        {popups.length > 0 && (
          <div className="w-px h-6 bg-white/20 mx-2" />
        )}

        {/* Clear All Button */}
        <button
          onClick={clearAllPopups}
          className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
          title="Close all popups"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}