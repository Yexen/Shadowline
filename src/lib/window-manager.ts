'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WindowState {
  id: string;
  title: string;
  component: string; // 'bible-editor', 'volume-editor', etc.
  data: any; // The data needed for the component
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

interface WindowStore {
  windows: WindowState[];
  highestZIndex: number;
  openWindow: (window: Omit<WindowState, 'id' | 'zIndex'>) => string;
  closeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  bringToFront: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  clearAllWindows: () => void;
}

export const useWindowManager = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: [],
      highestZIndex: 1000,

      openWindow: (windowData) => {
        const id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newZIndex = get().highestZIndex + 1;
        
        set((state) => ({
          windows: [
            ...state.windows,
            {
              ...windowData,
              id,
              zIndex: newZIndex,
              isMinimized: false,
              isMaximized: false,
            },
          ],
          highestZIndex: newZIndex,
        }));
        
        return id;
      },

      closeWindow: (id) => {
        set((state) => ({
          windows: state.windows.filter((window) => window.id !== id),
        }));
      },

      updateWindow: (id, updates) => {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id ? { ...window, ...updates } : window
          ),
        }));
      },

      bringToFront: (id) => {
        const newZIndex = get().highestZIndex + 1;
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id ? { ...window, zIndex: newZIndex } : window
          ),
          highestZIndex: newZIndex,
        }));
      },

      minimizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id ? { ...window, isMinimized: true } : window
          ),
        }));
      },

      maximizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((window) => {
            if (window.id === id) {
              return {
                ...window,
                isMaximized: !window.isMaximized,
                x: window.isMaximized ? window.x : 0,
                y: window.isMaximized ? window.y : 0,
                width: window.isMaximized ? window.width : (globalThis.innerWidth || 1200),
                height: window.isMaximized ? window.height : (globalThis.innerHeight || 800),
              };
            }
            return window;
          }),
        }));
      },

      clearAllWindows: () => {
        set({ windows: [], highestZIndex: 1000 });
      },
    }),
    {
      name: 'shadowline-windows',
      partialize: (state) => ({
        windows: state.windows.map((window) => ({
          ...window,
          // Don't persist React components, only the data
        })),
        highestZIndex: state.highestZIndex,
      }),
    }
  )
);