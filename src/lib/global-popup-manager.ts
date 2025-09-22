import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PopupState {
  id: string;
  title: string;
  content: React.ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  originalSize?: { width: number; height: number; x: number; y: number };
}

interface PopupStore {
  popups: PopupState[];
  highestZIndex: number;
  addPopup: (popup: Omit<PopupState, 'id' | 'zIndex'>) => string;
  removePopup: (id: string) => void;
  updatePopup: (id: string, updates: Partial<PopupState>) => void;
  bringToFront: (id: string) => void;
  minimizePopup: (id: string) => void;
  maximizePopup: (id: string) => void;
  restorePopup: (id: string) => void;
  clearAllPopups: () => void;
}

export const usePopupStore = create<PopupStore>()(
  persist(
    (set, get) => ({
      popups: [],
      highestZIndex: 1000,

      addPopup: (popup) => {
        const id = `popup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newZIndex = get().highestZIndex + 1;
        
        set((state) => ({
          popups: [
            ...state.popups,
            {
              ...popup,
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

      removePopup: (id) => {
        set((state) => ({
          popups: state.popups.filter((popup) => popup.id !== id),
        }));
      },

      updatePopup: (id, updates) => {
        set((state) => ({
          popups: state.popups.map((popup) =>
            popup.id === id ? { ...popup, ...updates } : popup
          ),
        }));
      },

      bringToFront: (id) => {
        const newZIndex = get().highestZIndex + 1;
        set((state) => ({
          popups: state.popups.map((popup) =>
            popup.id === id ? { ...popup, zIndex: newZIndex } : popup
          ),
          highestZIndex: newZIndex,
        }));
      },

      minimizePopup: (id) => {
        set((state) => ({
          popups: state.popups.map((popup) =>
            popup.id === id ? { ...popup, isMinimized: true } : popup
          ),
        }));
      },

      maximizePopup: (id) => {
        set((state) => ({
          popups: state.popups.map((popup) => {
            if (popup.id === id) {
              return {
                ...popup,
                isMaximized: true,
                originalSize: {
                  width: popup.width,
                  height: popup.height,
                  x: popup.x,
                  y: popup.y,
                },
                x: 0,
                y: 0,
                width: window.innerWidth,
                height: window.innerHeight,
              };
            }
            return popup;
          }),
        }));
      },

      restorePopup: (id) => {
        set((state) => ({
          popups: state.popups.map((popup) => {
            if (popup.id === id) {
              if (popup.isMinimized) {
                return { ...popup, isMinimized: false };
              }
              if (popup.isMaximized && popup.originalSize) {
                return {
                  ...popup,
                  isMaximized: false,
                  x: popup.originalSize.x,
                  y: popup.originalSize.y,
                  width: popup.originalSize.width,
                  height: popup.originalSize.height,
                  originalSize: undefined,
                };
              }
            }
            return popup;
          }),
        }));
      },

      clearAllPopups: () => {
        set({ popups: [], highestZIndex: 1000 });
      },
    }),
    {
      name: 'shadowline-popups',
      partialize: (state) => ({
        popups: state.popups.map((popup) => ({
          ...popup,
          content: null, // Don't persist React components
        })),
        highestZIndex: state.highestZIndex,
      }),
    }
  )
);