'use client';

import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowManager, WindowState } from '@/lib/window-manager';

interface WindowRendererProps {
  windowId: string;
}

export function WindowRenderer({ windowId }: WindowRendererProps) {
  const { windows, updateWindow, closeWindow, bringToFront, minimizeWindow, maximizeWindow } = useWindowManager();
  const window = windows.find(w => w.id === windowId);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

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

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && typeof window !== 'undefined') {
        const newX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y));
        updateWindow(windowId, { x: newX, y: newY });
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(300, resizeStart.width + deltaX);
        const newHeight = Math.max(200, resizeStart.height + deltaY);
        updateWindow(windowId, { width: newWidth, height: newHeight });
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
        className="overflow-hidden"
        style={{ 
          height: window.isMaximized ? 'calc(100vh - 49px)' : window.height - 49 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic content will be rendered here based on window.component */}
        <WindowContent window={window} />
      </div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-muted-foreground opacity-50" />
        </div>
      )}
    </div>
  );
}

function WindowContent({ window }: { window: WindowState }) {
  // Dynamically render content based on component type
  switch (window.component) {
    case 'bible-editor':
      return <BibleEditorContent data={window.data} />;
    case 'volume-editor':
      return <VolumeEditorContent data={window.data} />;
    case 'alfred-reminders':
      return <AlfredRemindersContent data={window.data} />;
    default:
      return <div className="p-4">Unknown component: {window.component}</div>;
  }
}

// Content components that will render the actual dialog content without modal behavior
function BibleEditorContent({ data }: { data: any }) {
  const { BibleEditorContent: ActualContent } = require('@/components/bible-editor-content');
  
  if (!data) return null;
  
  return (
    <div className="h-full overflow-auto">
      <ActualContent
        entry={data.entry}
        category={data.category}
        onSave={data.onSave || (() => {})}
        onDelete={data.onDelete || (() => {})}
        onViewOnMap={data.onViewOnMap || (() => {})}
      />
    </div>
  );
}

function VolumeEditorContent({ data }: { data: any }) {
  return (
    <div className="h-full overflow-auto">
      {/* This will contain the actual volume editor content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Volume Editor</h3>
        <p className="text-muted-foreground">Volume editor content will be rendered here...</p>
      </div>
    </div>
  );
}

function AlfredRemindersContent({ data }: { data: any }) {
  return (
    <div className="h-full overflow-auto">
      {/* This will contain the actual alfred reminders content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Alfred Reminders</h3>
        <p className="text-muted-foreground">Alfred reminders content will be rendered here...</p>
      </div>
    </div>
  );
}