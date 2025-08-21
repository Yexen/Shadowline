'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BatLogo } from '@/components/bat-logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// In a real app, this would be handled by a proper auth system.
const CORRECT_PASSWORD = 'Livfreya';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        try {
          localStorage.setItem('isLoggedIn', 'true');
          router.replace('/home');
        } catch (e) {
            setError('Local storage is unavailable. Please enable it in your browser settings.');
        }
      } else {
        setError('ACCESS DENIED: INCORRECT PASSWORD');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm text-center">
        <BatLogo className="mx-auto mb-8 text-primary" />
        <h1 className="font-headline text-3xl font-bold uppercase tracking-wider text-foreground">
          Writer's Protocol
        </h1>
        <p className="mt-2 mb-8 text-muted-foreground">
          Restricted Access. Authentication Required.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER PASSWORD"
              required
              className="text-center font-code tracking-widest h-12 text-lg"
              aria-label="Password"
            />
          </div>
          {error && (
            <Alert variant="destructive" className="text-left">
                <Terminal className="h-4 w-4" />
                <AlertDescription className="font-code text-sm">
                    {error}
                </AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full font-headline h-12 text-lg" disabled={isLoading}>
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>VERIFYING...</span>
                </div>
            ) : (
              'ENGAGE'
            )}
          </Button>
        </form>
      </div>
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground/50 font-code">
        <p>SYSTEM ACCESS GRANTED BY WAYNE ENTERPRISES</p>
        <p>SESSION WILL BE MONITORED</p>
      </footer>
    </main>
  );
}
