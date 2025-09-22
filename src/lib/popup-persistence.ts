'use client';

import { usePopupStore } from '@/lib/global-popup-manager';

// Registry to store popup content creators for restoration
const popupContentRegistry = new Map<string, () => React.ReactNode>();

export function registerPopupContent(type: string, contentCreator: () => React.ReactNode) {
  popupContentRegistry.set(type, contentCreator);
}

export function restorePopupContent(type: string): React.ReactNode | null {
  const creator = popupContentRegistry.get(type);
  return creator ? creator() : null;
}

// Initialize popup persistence
export function initializePopupPersistence() {
  // This will be called on app startup to restore any persisted popups
  if (typeof window === 'undefined') return;

  const { popups, updatePopup } = usePopupStore.getState();
  
  // Restore content for any persisted popups that don't have content
  popups.forEach((popup) => {
    if (!popup.content && popup.title) {
      // Try to restore content based on popup title
      const contentType = popup.title.toLowerCase().replace(/\s+/g, '-');
      const content = restorePopupContent(contentType);
      if (content) {
        updatePopup(popup.id, { content });
      }
    }
  });
}

// Auto-register common popup types
if (typeof window !== 'undefined') {
  // Register default popup content creators
  registerPopupContent('calendar', () => (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="w-5 h-5 text-blue-400">📅</span>
        <h2 className="text-lg font-semibold text-white">My Calendar</h2>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <p className="text-sm font-medium text-blue-300">Meeting with Team</p>
          <p className="text-xs text-gray-400">Today at 2:00 PM</p>
        </div>
        <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
          <p className="text-sm font-medium text-green-300">Project Review</p>
          <p className="text-xs text-gray-400">Tomorrow at 10:00 AM</p>
        </div>
      </div>
    </div>
  ));

  registerPopupContent('notes', () => (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="w-5 h-5 text-green-400">📝</span>
        <h2 className="text-lg font-semibold text-white">Quick Notes</h2>
      </div>
      <textarea
        className="w-full h-48 bg-gray-800 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500/50"
        placeholder="Start typing your notes here..."
        defaultValue="• Remember to update the documentation
• Check the new design mockups
• Schedule team standup for next week"
      />
    </div>
  ));
}