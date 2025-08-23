'use client';

import { useState } from 'react';
import { useWriters } from '@/hooks/use-writers';
import { BatLogo } from '@/components/bat-logo';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LoginDialog } from '@/components/login-dialog';

type Role = 'writer' | 'reader' | 'head-writer';

export default function AuthPage() {
  const router = useRouter();
  const { isLoaded } = useWriters();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogRole, setDialogRole] = useState<Role | null>(null);

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <BatLogo className="w-24 h-12 mx-auto text-primary" />
            <h1 className="font-headline text-4xl font-bold mt-4 tracking-wider">SHADOWLINE</h1>
            <p className="text-muted-foreground text-lg">Writer’s Protocol</p>
          </div>

          <div className="space-y-4">
             <Button 
                className="w-full h-14 text-lg font-headline"
                onClick={() => setDialogRole('writer')}
                disabled={isLoading}
             >
                Writer Access
             </Button>
             <Button 
                variant="secondary"
                className="w-full h-14 text-lg font-headline"
                onClick={() => setDialogRole('reader')}
                disabled={isLoading}
             >
                Reader Access
             </Button>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or
                    </span>
                </div>
            </div>
             <Button 
                variant="ghost" 
                className="w-full text-primary hover:text-primary/90" 
                onClick={() => setDialogRole('head-writer')}
                disabled={!isLoaded || isLoading}
              >
                {isLoading ? 'Accessing...' : 'Head Writer Access'}
            </Button>
          </div>

          <div className="text-center text-sm">
              <p className="text-muted-foreground">
                  Need an account? <Link href="/signup" className="text-primary hover:underline">Request Access</Link>
              </p>
          </div>
        </div>
      </div>

      <LoginDialog 
        role={dialogRole}
        onClose={() => setDialogRole(null)}
      />
    </>
  );
}
