'use client';

import { useState, useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-simple-auth';
import { BatLogo } from '@/components/bat-logo';
import Link from 'next/link';
import { PasswordInput } from '@/components/password-input';
import { CheckCircle, XCircle, User, BookOpen, Eye, BarChart3, FileText } from 'lucide-react';
import { UserRole, Invite } from '@/types/auth';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" })
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const roleConfig = {
  viewer: {
    icon: Eye,
    title: "Viewer",
    description: "Read-only access to published content"
  },
  analyst: {
    icon: BarChart3,
    title: "Analyst",
    description: "Read content and add annotations & comments"
  },
  contributor: {
    icon: FileText,
    title: "Contributor",
    description: "Propose new content for Author approval"
  }
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addUser } = useAuth();
  // const { validateInvite } = useInvites(); // Temporarily disabled
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isValidatingInvite, setIsValidatingInvite] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = confirmPassword && password !== confirmPassword;

  // Check for invite token in URL
  useEffect(() => {
    const token = searchParams.get('invite');
    if (token) {
      setIsValidatingInvite(true);
      setInviteToken(token);
      // Temporarily skip invite validation
      setIsValidatingInvite(false);
    }
  }, [searchParams]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    reset();
  };

  const onSubmit = async (data: SignupFormValues) => {
    if (!selectedRole) return;
    setError(null);
    setIsLoading(true);
    try {
      await addUser(data.name, data.email, data.password, selectedRole, inviteToken || undefined);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <BatLogo className="w-24 h-12 text-primary animate-pulse" />
      </div>
    );
  }

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
                    <p>Your request for access has been submitted. An Author will review it shortly. You may now return to the login page.</p>
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
            <p className="text-muted-foreground">
              {invite ? `Join via invite as ${invite.targetRole || 'any role'}` : 'Join the Protocol'}
            </p>
        </div>

        {!selectedRole && !invite?.targetRole ? (
            <Card>
                <CardHeader>
                    <CardTitle>Choose Your Role</CardTitle>
                    <CardDescription>How would you like to contribute to the Protocol?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Object.entries(roleConfig).map(([role, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleSelect(role as UserRole)}
                          className="w-full p-4 border rounded-lg hover:bg-accent hover:border-primary transition-colors flex items-center gap-3 text-left"
                        >
                          <Icon className="w-8 h-8 text-primary"/>
                          <div>
                            <h3 className="font-bold">{config.title}</h3>
                            <p className="text-sm text-muted-foreground">{config.description}</p>
                          </div>
                        </button>
                      );
                    })}
                </CardContent>
            </Card>
        ) : (
            <Card>
            <CardHeader>
                <CardTitle>
                  Sign Up as {selectedRole ? roleConfig[selectedRole]?.title : 'User'}
                  {invite && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (via invite)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Fill out the form to request access.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="Your name" {...register('name')} disabled={isLoading} />
                    {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" {...register('email')} disabled={isLoading} />
                    {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput id="password" {...register('password')} disabled={isLoading} />
                    {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <PasswordInput
                        id="confirmPassword"
                        {...register('confirmPassword')}
                        disabled={isLoading}
                        icon={
                            <>
                                {passwordsMatch && <CheckCircle className="h-5 w-5 text-green-500" />}
                                {passwordsDontMatch && <XCircle className="h-5 w-5 text-destructive" />}
                            </>
                        }
                    />
                    {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>}
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Request Access'}
                </Button>
                {!invite?.targetRole && (
                  <Button variant="link" className="w-full" onClick={() => setSelectedRole(null)}>
                      Back to role selection
                  </Button>
                )}
                </form>
            </CardContent>
            </Card>
        )}

        <div className="text-center text-sm">
            <p className="text-muted-foreground">
                Already have an account? <Link href="/auth" className="text-primary hover:underline">Log in</Link>
            </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <BatLogo className="w-24 h-12 text-primary animate-pulse" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}