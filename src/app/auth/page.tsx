
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BatLogo } from '@/components/bat-logo';
import { useWriters } from '@/hooks/use-writers';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const router = useRouter();
  const { isLoaded } = useWriters();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleHeadWriterAccess = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, 'yekta.kjs@gmail.com', 'LivFreya');
      // onAuthStateChanged in useWriters will handle the redirect and state update
      router.replace('/home');
    } catch (error: any) {
      console.error('Head Writer login failed:', error);
      toast({
        variant: 'destructive',
        title: 'Head Writer Access Failed',
        description: 'Could not sign in. Please check console for details.',
      })
    } finally {
        setIsLoading(false);
    }
  };


  if (!isLoaded) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
             <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p className="font-headline text-muted-foreground">INITIALIZING PROTOCOL...</p>
            </div>
        </main>
    )
  }


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
            onClick={handleHeadWriterAccess} 
            variant="destructive"
            className="w-full font-headline h-14 text-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary"
            disabled={isLoading || !isLoaded}
          >
            {isLoading ? "ACCESSING..." : "Head Writer Access"}
          </Button>
          <div className="flex items-center gap-4">
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
      </div>
       <footer className="absolute bottom-4 text-center text-xs text-muted-foreground/50 font-code">
        <p>A SANCTUARY FOR CHRONICLERS OF THE NIGHT</p>
      </footer>
    </main>
  );
}
