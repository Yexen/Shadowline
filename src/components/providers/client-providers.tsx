'use client';

import { SessionProvider } from 'next-auth/react';
import { UserDataSyncProvider } from '@/components/providers/user-data-sync-provider';
import { ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SessionProvider>
      <UserDataSyncProvider>
        {children}
      </UserDataSyncProvider>
    </SessionProvider>
  );
}