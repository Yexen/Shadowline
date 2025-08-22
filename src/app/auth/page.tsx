
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BatLogo } from '@/components/bat-logo';
import { useWriters } from '@/hooks/use-writers';

export default function AuthPage() {
  const router = useRouter();
  const { writers, setActiveWriter, isLoaded } = useWriters();

  const handleHeadWriterAccess = () => {
    // This check is now mostly for robustness, the button's disabled state is the primary guard.
    if (!isLoaded) {
      console.log("Writer data not loaded yet, please wait a moment and try again.");
      return;
    }

    const headWriter = writers.find(w => w.role === 'head-writer');
    if (headWriter) {
        try {
            setActiveWriter(headWriter.id);
            localStorage.setItem('isLoggedIn', 'true');
            router.replace('/home');
        } catch (e) {
            console.error('Failed to set Head Writer session:', e);
        }
    } else {
        console.error("Head Writer profile not found.");
        // This can happen if the default data hasn't been set in local storage yet.
        // A page refresh should typically solve this after the first load.
    }
  };


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
            disabled={!isLoaded}
          >
            {isLoaded ? 'Head Writer Access' : 'Loading...'}
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
