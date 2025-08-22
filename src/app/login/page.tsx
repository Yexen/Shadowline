
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BatLogo } from '@/components/bat-logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useWriters } from '@/hooks/use-writers';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/password-input';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isLoaded, activeWriter } = useWriters();

  useEffect(() => {
    if (isLoaded && activeWriter) {
        router.replace('/home');
    }
  }, [isLoaded, activeWriter, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.status === 'pending') {
                setError('ACCESS DENIED: Your account is pending approval.');
                await auth.signOut(); // Sign out the user
            } else if (userData.status === 'rejected') {
                 setError('ACCESS DENIED: Your account registration was rejected.');
                 await auth.signOut();
            } else {
                // Success, onAuthStateChanged will handle redirect
            }
        } else {
             setError('ACCESS DENIED: User profile not found in database.');
             await auth.signOut();
        }

    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setError('ACCESS DENIED: INCORRECT CREDENTIALS');
        } else {
            setError('An unknown error occurred. Please try again.');
            console.error('Firebase login error:', error);
        }
    } finally {
        setIsLoading(false);
    }
  };
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm text-center">
        <BatLogo className="mx-auto mb-8 text-primary" />
        <h1 className="font-headline text-3xl font-bold uppercase tracking-wider text-foreground">
          Writer's Protocol
        </h1>
        <p className="mt-2 mb-8 text-muted-foreground">
          Sign In. Restricted Access.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
             <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER EMAIL"
              required
              className="text-center font-code tracking-widest h-12 text-lg"
              aria-label="Email"
              autoComplete="email"
            />
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER PASSWORD"
              required
              className="text-center font-code tracking-widest h-12 text-lg"
              aria-label="Password"
              autoComplete="current-password"
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
          <Button type="submit" className="w-full font-headline h-12 text-lg" disabled={isLoading || !isLoaded}>
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
            <Button variant="link" onClick={() => router.push('/auth')}>
                Back to main menu
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
