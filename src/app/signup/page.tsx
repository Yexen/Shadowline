'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWriters } from '@/hooks/use-writers';
import { BatLogo } from '@/components/bat-logo';
import Link from 'next/link';
import { PasswordInput } from '@/components/password-input';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { addWriter } = useWriters();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      await addWriter(data.name, data.email, data.password);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6 text-center">
            <BatLogo className="w-24 h-12 mx-auto text-primary" />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Request Sent</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your request for access has been submitted. The Head Writer will review it shortly. You may now return to the login page.</p>
                     <Button asChild className="w-full mt-4">
                        <Link href="/auth">Return to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <BatLogo className="w-24 h-12 mx-auto text-primary" />
            <h1 className="font-headline text-3xl font-bold mt-4">Request Access</h1>
            <p className="text-muted-foreground">Join the league of writers.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Fill out the form to request access to the Writer's Protocol.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="Selina Kyle" {...register('name')} disabled={isLoading} />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="cat@gotham.net" {...register('email')} disabled={isLoading} />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" {...register('password')} disabled={isLoading} />
                {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Request Access'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="text-center text-sm">
            <p className="text-muted-foreground">
                Already have an account? <Link href="/auth" className="text-primary hover:underline">Log in</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
