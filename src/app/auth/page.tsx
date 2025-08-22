
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BatLogo } from '@/components/bat-logo';

export default function AuthPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm text-center">
        <BatLogo className="mx-auto mb-8 text-primary" />
        <h1 className="font-headline text-3xl font-bold uppercase tracking-wider text-foreground">
          Shadows of Gotham
        </h1>
        <p className="mt-2 mb-8 text-muted-foreground">
          The Writer's Protocol
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => router.push('/login')} 
            className="w-full font-headline h-12 text-lg"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => router.push('/signup')} 
            variant="outline" 
            className="w-full font-headline h-12 text-lg"
          >
            Sign Up
          </Button>
        </div>
      </div>
       <footer className="absolute bottom-4 text-center text-xs text-muted-foreground/50 font-code">
        <p>A SANCTUARY FOR CHRONICLERS OF THE NIGHT</p>
      </footer>
    </main>
  );
}
