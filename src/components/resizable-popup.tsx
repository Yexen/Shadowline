'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Minus, Square, RotateCcw, Move } from 'lucide-react';
import { usePopupStore, type PopupState } from '@/lib/global-popup-manager';

interface ResizablePopupProps {
  popup: PopupState;
}

export function ResizablePopup({ popup }: ResizablePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const { updatePopup, removePopup, bringToFront, minimizePopup, maximizePopup, restorePopup } = usePopupStore();

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - popup.x,
        y: e.clientY - popup.y,
      });
      bringToFront(popup.id);
    }
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: popup.width,
      height: popup.height,
    });
    bringToFront(popup.id);
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - popup.width, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - popup.height, e.clientY - dragStart.y));
        
        updatePopup(popup.id, { x: newX, y: newY });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        const newWidth = Math.max(300, Math.min(window.innerWidth - popup.x, resizeStart.width + deltaX));
        const newHeight = Math.max(200, Math.min(window.innerHeight - popup.y, resizeStart.height + deltaY));
        
        updatePopup(popup.id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, popup, updatePopup]);

  // Don't render if minimized
  if (popup.isMinimized) {
    return null;
  }

  return (
    <div
      ref={popupRef}
      className="fixed bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: popup.x,
        top: popup.y,
        width: popup.width,
        height: popup.height,
        zIndex: popup.zIndex,
        cursor: isDragging ? 'grabbing' : 'default',
        pointerEvents: 'auto', // Ensure popup can be interacted with
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div className="drag-handle flex items-center justify-between bg-gray-800/90 px-4 py-2 border-b border-white/10 cursor-grab active:cursor-grabbing">
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-white truncate">{popup.title}</h3>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizePopup(popup.id);
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (popup.isMaximized) {
                restorePopup(popup.id);
              } else {
                maximizePopup(popup.id);
              }
            }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title={popup.isMaximized ? "Restore" : "Maximize"}
          >
            {popup.isMaximized ? (
              <RotateCcw className="w-4 h-4 text-gray-400 hover:text-white" />
            ) : (
              <Square className="w-4 h-4 text-gray-400 hover:text-white" />
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePopup(popup.id);
            }}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="h-full overflow-auto"
        style={{ height: `calc(100% - 42px)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {popup.content}
      </div>

      {/* Resize Handle */}
      {!popup.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-600/50 hover:bg-gray-500/70 transition-colors"
          onMouseDown={handleResizeStart}
          style={{
            clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)',
          }}
        />
      )}
    </div>
  );
}