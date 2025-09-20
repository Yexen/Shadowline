'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BatLogo } from '@/components/bat-logo';
import { PasswordInput } from '@/components/password-input';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface InviteData {
  token: string;
  role: UserRole;
  expires?: Date;
  isValid: boolean;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  useEffect(() => {
    // Validate invitation token
    const token = params.token as string;
    if (token) {
      validateInvite(token);
    }
  }, [params.token]);

  const validateInvite = async (token: string) => {
    setIsValidating(true);
    try {
      // Simple token validation - for now we'll use a basic format
      // Token format: role-randomstring (e.g., "viewer-abc123", "analyst-def456")
      const parts = token.split('-');
      if (parts.length >= 2) {
        const role = parts[0] as UserRole;
        if (['viewer', 'analyst', 'contributor'].includes(role)) {
          setInvite({
            token,
            role,
            isValid: true,
          });
        } else {
          setInvite({ token, role: 'viewer', isValid: false });
        }
      } else {
        setInvite({ token, role: 'viewer', isValid: false });
      }
    } catch (error) {
      setInvite({ token, role: 'viewer', isValid: false });
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    if (!invite?.isValid) return;

    setIsLoading(true);
    try {
      // Create user account with invitation
      const user = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        password: data.password, // In real app, this would be hashed
        avatarUrl: 'https://placehold.co/128x128.png',
        dataAiHint: 'user portrait',
        role: invite.role,
        status: 'approved' as const,
        inviteToken: invite.token,
      };

      // Store user account for future logins
      localStorage.setItem(`shadowline-user-${user.id}`, JSON.stringify(user));

      // Set current session
      localStorage.setItem('shadowline-user', JSON.stringify(user));

      // Mark invitation as used (in a real app, this would be server-side)
      localStorage.setItem(`invite-used-${invite.token}`, 'true');

      toast({
        title: 'Account Created!',
        description: `Welcome to Shadowline as ${invite.role}.`,
      });

      router.push('/home');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'An error occurred while creating your account.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <BatLogo className="w-24 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!invite?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 mx-auto mb-6">
              <BatLogo />
            </div>
            <h1 className="font-headline text-4xl font-bold text-destructive mb-4">
              Invalid Invitation
            </h1>
            <p className="text-muted-foreground text-lg">
              This invitation link is invalid or has expired.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.push('/auth')}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <BatLogo />
          </div>
          <h1 className="font-headline text-4xl font-bold bg-gradient-to-br from-yellow-600 via-yellow-200 to-yellow-600 bg-clip-text text-transparent animate-shimmer mb-2">
            Join Shadowline
          </h1>
          <p className="text-muted-foreground text-lg">
            You've been invited as <span className="text-primary font-semibold capitalize">{invite.role}</span>
          </p>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Your full name"
                {...form.register('name')}
                disabled={isLoading}
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...form.register('email')}
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                {...form.register('password')}
                disabled={isLoading}
              />
              {form.formState.errors.password && (
                <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-headline text-lg h-12"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Join Shadowline'}
            </Button>
          </form>
        </FormProvider>

        <div className="text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth')}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}