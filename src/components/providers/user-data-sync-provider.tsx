'use client';

import React from 'react';
import { useWatchlistSync } from '@/hooks/use-watchlist';
import { useReadlistSync } from '@/hooks/use-readlist';

interface UserDataSyncProviderProps {
  children: React.ReactNode;
}

export function UserDataSyncProvider({ children }: UserDataSyncProviderProps) {
  // Initialize sync hooks to start the data synchronization
  useWatchlistSync();
  useReadlistSync();

  return <>{children}</>;
}