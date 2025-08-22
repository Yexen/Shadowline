
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BatLogo } from '@/components/bat-logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, CheckCircle, UserPlus, BookUser } from 'lucide-react';
import { useWriters, UserRole } from '@/hooks/use-writers';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/password-input';

type SignUpStep = 'role' | 'form' | 'pending';

export default function SignUpPage() {
  const [step, setStep] = useState<SignUpStep>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addWriter, getWriterByEmail, isLoaded } = useWriters();

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
     if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (getWriterByEmail(email)) {
        setError('An account with this email already exists.');
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (role) {
        addWriter(name, email, role, password);
        setStep('pending');
      } else {
          setError('A user role must be selected.');
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const renderContent = () => {
    switch(step) {
      case 'role':
        return (
          <>
            <h1 className="font-headline text-2xl font-bold uppercase tracking-wider text-foreground">
              Join the Protocol
            </h1>
            <p className="mt-2 mb-8 text-muted-foreground">
              Choose your role. Access requires approval from the Head Writer.
            </p>
            <div className="space-y-4">
              <Button onClick={() => handleRoleSelect('writer')} className="w-full font-headline h-16 text-lg flex items-center justify-center gap-2">
                <UserPlus />
                Sign Up as a Writer
              </Button>
              <Button onClick={() => handleRoleSelect('reader')} className="w-full font-headline h-16 text-lg flex items-center justify-center gap-2" variant="secondary">
                <BookUser />
                Sign Up as a Reader
              </Button>
            </div>
             <Button variant="link" onClick={() => router.push('/auth')} className="mt-4">
                Back to main menu
            </Button>
          </>
        );
      case 'form':
        return (
          <>
            <h1 className="font-headline text-2xl font-bold uppercase tracking-wider text-foreground">
              Register as {role}
            </h1>
            <p className="mt-2 mb-8 text-muted-foreground">
              Your registration will be submitted for approval.
            </p>
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-4">
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ENTER NAME" required className="text-center font-code tracking-widest h-12 text-lg" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER EMAIL" required className="text-center font-code tracking-widest h-12 text-lg" />
                <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="CREATE PASSWORD" required className="text-center font-code tracking-widest h-12 text-lg" />
                <PasswordInput id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="CONFIRM PASSWORD" required className="text-center font-code tracking-widest h-12 text-lg" />
              </div>
              {error && (
                <Alert variant="destructive" className="text-left">
                  <Terminal className="h-4 w-4" />
                  <AlertDescription className="font-code text-sm">{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full font-headline h-12 text-lg" disabled={isLoading || !isLoaded}>
                {isLoading ? 'SUBMITTING...' : 'Request Access'}
              </Button>
               <Button variant="link" onClick={() => setStep('role')}>
                    Back to role selection
                </Button>
            </form>
          </>
        );
        case 'pending':
            return (
                <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="font-headline">Registration Submitted!</AlertTitle>
                    <AlertDescription>
                        Your request for access has been sent to the Head Writer for approval. You will be notified via email once your account is activated.
                    </AlertDescription>
                    <Button onClick={() => router.push('/auth')} className="w-full mt-4">
                        Return to Main Menu
                    </Button>
                </Alert>
            )
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm text-center">
        <BatLogo className="mx-auto mb-8 text-primary" />
        {renderContent()}
      </div>
       <footer className="absolute bottom-4 text-center text-xs text-muted-foreground/50 font-code">
        <p>ALL COMMUNICATIONS ARE MONITORED</p>
      </footer>
    </main>
  );
}

