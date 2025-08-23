
'use client';

import { create } from 'zustand';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface TimerState {
  sessionTime: number;
  timePerRoute: Record<string, number>;
  focusTime: number; // The total duration of the focus timer
  focusTimeLeft: number;
  isFocusTimerRunning: boolean;
  incrementTime: (pathname: string) => void;
  setFocusTime: (seconds: number) => void;
  toggleFocusTimer: () => void;
  resetFocusTimer: () => void;
  _decrementFocusTimer: () => void;
}

const useTimerStore = create<TimerState>((set, get) => ({
  sessionTime: 0,
  timePerRoute: {},
  focusTime: 0,
  focusTimeLeft: 0,
  isFocusTimerRunning: false,
  incrementTime: (pathname) => {
    set((state) => ({
      sessionTime: state.sessionTime + 1,
      timePerRoute: {
        ...state.timePerRoute,
        [pathname]: (state.timePerRoute[pathname] || 0) + 1,
      },
    }));
  },
  setFocusTime: (seconds) => {
    if (get().isFocusTimerRunning) return;
    set({ focusTime: seconds, focusTimeLeft: seconds });
  },
  toggleFocusTimer: () => {
    set((state) => ({ isFocusTimerRunning: !state.isFocusTimerRunning }));
  },
  resetFocusTimer: () => {
    set((state) => ({
      isFocusTimerRunning: false,
      focusTimeLeft: state.focusTime,
    }));
  },
  _decrementFocusTimer: () => {
    set((state) => ({ focusTimeLeft: Math.max(0, state.focusTimeLeft - 1) }));
    if (get().focusTimeLeft === 0) {
      set({ isFocusTimerRunning: false });
      new Notification('Focus Timer Finished!', {
        body: 'Your focus session has ended. Time to take a break!',
        icon: '/favicon.ico', // You might want to replace this with a proper icon
      });
    }
  },
}));

export const useTimer = () => {
  const store = useTimerStore();
  const pathname = usePathname();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect for session timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      store.incrementTime(pathname);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pathname, store.incrementTime]);

  // Effect for focus timer
  useEffect(() => {
    if (store.isFocusTimerRunning && store.focusTimeLeft > 0) {
      focusIntervalRef.current = setInterval(() => {
        store._decrementFocusTimer();
      }, 1000);
    } else if (!store.isFocusTimerRunning && focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
    }
    
    return () => {
        if (focusIntervalRef.current) {
            clearInterval(focusIntervalRef.current);
        }
    }
  }, [store.isFocusTimerRunning, store.focusTimeLeft, store._decrementFocusTimer]);

  return store;
};
