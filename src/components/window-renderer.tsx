'use client';

import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowManager, WindowState } from '@/lib/window-manager';
import { BibleEditorContent } from '@/components/bible-editor-content';

interface WindowRendererProps {
  windowId: string;
}

type ResizeDirection = 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | null;

export function WindowRenderer({ windowId }: WindowRendererProps) {
  const { windows, updateWindow, closeWindow, bringToFront, minimizeWindow, maximizeWindow } = useWindowManager();
  const window = windows.find(w => w.id === windowId);

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, windowX: 0, windowY: 0 });

  if (!window) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    
    bringToFront(windowId);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.x,
      y: e.clientY - window.y,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.stopPropagation();
    setIsResizing(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height,
      windowX: window.x,
      windowY: window.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min((globalThis.innerWidth || 1920) - 200, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min((globalThis.innerHeight || 1080) - 100, e.clientY - dragStart.y));
        updateWindow(windowId, { x: newX, y: newY });
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.windowX;
        let newY = resizeStart.windowY;

        switch (isResizing) {
          case 'se': // Southeast
            newWidth = Math.max(300, resizeStart.width + deltaX);
            newHeight = Math.max(200, resizeStart.height + deltaY);
            break;
          case 'sw': // Southwest
            newWidth = Math.max(300, resizeStart.width - deltaX);
            newHeight = Math.max(200, resizeStart.height + deltaY);
            newX = resizeStart.windowX + (resizeStart.width - newWidth);
            break;
          case 'ne': // Northeast
            newWidth = Math.max(300, resizeStart.width + deltaX);
            newHeight = Math.max(200, resizeStart.height - deltaY);
            newY = resizeStart.windowY + (resizeStart.height - newHeight);
            break;
          case 'nw': // Northwest
            newWidth = Math.max(300, resizeStart.width - deltaX);
            newHeight = Math.max(200, resizeStart.height - deltaY);
            newX = resizeStart.windowX + (resizeStart.width - newWidth);
            newY = resizeStart.windowY + (resizeStart.height - newHeight);
            break;
          case 'n': // North
            newHeight = Math.max(200, resizeStart.height - deltaY);
            newY = resizeStart.windowY + (resizeStart.height - newHeight);
            break;
          case 's': // South
            newHeight = Math.max(200, resizeStart.height + deltaY);
            break;
          case 'e': // East
            newWidth = Math.max(300, resizeStart.width + deltaX);
            break;
          case 'w': // West
            newWidth = Math.max(300, resizeStart.width - deltaX);
            newX = resizeStart.windowX + (resizeStart.width - newWidth);
            break;
        }

        updateWindow(windowId, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, windowId, updateWindow]);

  if (window.isMinimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className="fixed bg-background border border-border rounded-lg shadow-2xl"
      style={{
        left: window.x,
        top: window.y,
        width: window.isMaximized ? '100vw' : window.width,
        height: window.isMaximized ? '100vh' : window.height,
        zIndex: window.zIndex,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b border-border cursor-grab active:cursor-grabbing rounded-t-lg">
        <span className="text-sm font-medium text-foreground truncate">{window.title}</span>
        
        <div className="window-controls flex items-center space-x-1">
          <button
            onClick={() => minimizeWindow(windowId)}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
          
          <button
            onClick={() => maximizeWindow(windowId)}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={window.isMaximized ? "Restore" : "Maximize"}
          >
            {window.isMaximized ? (
              <Minimize2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            ) : (
              <Maximize2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            )}
          </button>
          
          <button
            onClick={() => closeWindow(windowId)}
            className="p-1 hover:bg-destructive/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex flex-col overflow-hidden window-content"
        style={{
          height: window.isMaximized ? 'calc(100vh - 49px)' : window.height - 49
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic content will be rendered here based on window.component */}
        <WindowContent window={window} />
      </div>

      {/* Resize Handles */}
      {!window.isMaximized && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />

          {/* Edge Handles */}
          <div
            className="absolute top-0 left-3 right-3 h-1 cursor-n-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />

          {/* Visual resize indicator in bottom-right corner */}
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-muted-foreground opacity-50 pointer-events-none" />
        </>
      )}
    </div>
  );
}

function WindowContent({ window }: { window: WindowState }) {
  // Dynamically render content based on component type
  switch (window.component) {
    case 'bible-editor':
      return <BibleEditorWindow data={window.data} />;
    case 'volume-editor':
      return <VolumeEditorContent data={window.data} />;
    case 'alfred-reminders':
      return <AlfredRemindersContent data={window.data} />;
    default:
      return <div className="p-4">Unknown component: {window.component}</div>;
  }
}

// Content components that will render the actual dialog content without modal behavior
function BibleEditorWindow({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 overflow-auto">
        <BibleEditorContent
          entry={data.entry}
          category={data.category}
          onSave={data.onSave || (() => {})}
          onDelete={data.onDelete || (() => {})}
          onViewOnMap={data.onViewOnMap || (() => {})}
        />
      </div>
    </div>
  );
}

function VolumeEditorContent({ data }: { data: any }) {
  return (
    <div className="h-full flex flex-col min-h-0">
      {/* This will contain the actual volume editor content */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-lg font-semibold mb-4">Volume Editor</h3>
        <p className="text-muted-foreground">Volume editor content will be rendered here...</p>
      </div>
    </div>
  );
}

function AlfredRemindersContent({ data }: { data: any }) {
  return (
    <div className="h-full flex flex-col min-h-0">
      {/* This will contain the actual alfred reminders content */}
      <div className="flex-1 overflow-auto p-4">
        <h3 className="text-lg font-semibold mb-4">Alfred Reminders</h3>
        <p className="text-muted-foreground">Alfred reminders content will be rendered here...</p>
      </div>
    </div>
  );
}