'use client';

import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { X, Minus, Move } from 'lucide-react';

interface FloatingWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function FloatingWindow({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '',
  style = {}
}: FloatingWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize position to center only once
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const centerX = (window.innerWidth - 800) / 2;
      const centerY = (window.innerHeight - 600) / 2;
      setPosition({ 
        x: Math.max(50, centerX), 
        y: Math.max(50, centerY) 
      });
    }
  }, [isOpen]); // Only depend on isOpen, not position

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && typeof window !== 'undefined') {
        const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragStart.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragStart.y));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className={`fixed bg-background border border-border rounded-lg shadow-2xl ${className}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'default',
        ...style,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title Bar */}
      <div className="drag-handle flex items-center justify-between bg-muted/50 px-4 py-2 border-b border-border cursor-grab active:cursor-grabbing rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Move className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground truncate">{title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-destructive/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div 
          className="overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}