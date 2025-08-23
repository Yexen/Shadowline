
import { Suspense } from 'react';
import { MessagesPageClient } from '@/components/messages-page-client';
import { Skeleton } from '@/components/ui/skeleton';

function MessagesLoading() {
    return (
        <div className="flex h-[calc(100vh-14rem)] border rounded-lg bg-card">
            <div className="w-1/3 border-r h-full flex flex-col">
                <div className="p-4 border-b">
                    <Skeleton className="h-8 w-3/4" />
                </div>
                <div className="flex-grow p-3 space-y-3">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-grow">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-grow">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/5" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow flex items-center justify-center">
                 <p className="text-muted-foreground">Loading Messages...</p>
            </div>
        </div>
    )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesPageClient />
    </Suspense>
  );
}
