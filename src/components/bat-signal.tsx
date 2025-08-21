
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BatLogo } from './bat-logo';
import { useSidebar } from './ui/sidebar';

const BatSignalOverlay = () => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 animate-bat-signal-fade-in [--animation-delay:4s] animate-out fade-out pointer-events-none">
            <div 
                className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    "h-[80vmin] w-[90vmin] rounded-[50%]",
                    "bg-primary/10 blur-[50px]",
                    "animate-pulse"
                )}
            />
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <div className="absolute -bottom-1/2 h-[100vh] w-[40vw] rotate-[15deg] bg-gradient-to-t from-primary/40 to-transparent" />
                <div className="absolute -bottom-1/2 h-[100vh] w-[40vw] -rotate-[15deg] bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
            <BatLogo className="relative z-10 w-48 h-24 text-background animate-in zoom-in-50" />
        </div>
    )
}

export function BatSignal() {
  const [showSignal, setShowSignal] = useState(false);
  const { toggleSidebar } = useSidebar();


  const triggerSignal = () => {
    setShowSignal(true);
    setTimeout(() => {
      setShowSignal(false);
    }, 5000); // Duration of the animation
  };

  return (
    <>
      <Button variant="ghost" size="icon" onClick={toggleSidebar} onDoubleClick={triggerSignal} aria-label="Toggle Sidebar">
        <BatLogo className="w-6 h-3 text-primary" />
      </Button>
      {showSignal && <BatSignalOverlay />}
    </>
  );
}
