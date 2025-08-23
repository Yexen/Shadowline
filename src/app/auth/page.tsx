'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { login, loginAsHeadWriter, isLoaded } = useWriters();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      // The onAuthStateChanged listener in the hook will handle redirection.
      router.push('/home');
    } catch (e: any) {
      setError(e.message);
      toast({ variant: 'destructive', title: 'Login Failed', description: e.message });
      setIsLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    setIsLoading(true);
    setError(null);
    try {
        await loginAsHeadWriter();
        router.push('/home');
    } catch (e: any) {
        setError(e.message);
        toast({ variant: 'destructive', title: 'Head Writer Access Failed', description: e.message });
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <BatLogo className="w-24 h-12 mx-auto text-primary" />
            <h1 className="font-headline text-3xl font-bold mt-4">Shadowline</h1>
            <p className="font-headline text-xl text-muted-foreground">Writer’s Protocol</p>
            <p className="text-muted-foreground">Access your Gotham chronicles.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access the terminal.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="agent@gotham.net" {...form.register('email')} disabled={isLoading} />
                  {form.formState.errors.email && <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput id="password" {...form.register('password')} disabled={isLoading} />
                  {form.formState.errors.password && <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>}
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={!isLoaded || isLoading}>
                  {isLoading ? 'Accessing...' : isLoaded ? 'Access Terminal' : 'Loading...'}
                </Button>
              </form>
            </FormProvider>
             <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or
                    </span>
                </div>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleGuestAccess} disabled={!isLoaded || isLoading}>
              Head Writer Access
            </Button>
          </CardContent>
        </Card>
        <div className="text-center text-sm">
            <p className="text-muted-foreground">
                Need an account? <Link href="/signup" className="text-primary hover:underline">Request Access</Link>
            </p>
        </div>
      </div>
    </div>
  );
}
