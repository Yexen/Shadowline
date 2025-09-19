'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-simple-auth';
import { PasswordInput } from '@/components/password-input';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginDialogProps {
    role: 'author' | 'viewer' | 'analyst' | 'contributor' | null;
    onClose: () => void;
}

export function LoginDialog({ role, onClose }: LoginDialogProps) {
  const router = useRouter();
  const { login, loginAsAuthor, isLoaded } = useAuth();
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
      if (role === 'author') {
        await loginAsAuthor(data.email, data.password);
      } else {
        await login(data.email, data.password, role);
      }
    } catch (e: any) {
      const errorMessage = e.message || 'An unknown error occurred.';
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          form.reset();
          setError(null);
          setIsLoading(false);
          onClose();
      }
  }

  const getTitle = () => {
    if (role === 'author') return 'Author Login';
    if (role === 'viewer') return 'Viewer Login';
    if (role === 'analyst') return 'Analyst Login';
    if (role === 'contributor') return 'Contributor Login';
    return 'Login';
  }

  if (!role) return null;

  return (
    <Dialog open={!!role} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">{getTitle()}</DialogTitle>
          <DialogDescription>
            Enter your credentials to engage with the Protocol.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email-dialog">Email</Label>
              <Input id="email-dialog" type="email" placeholder="agent@gotham.net" {...form.register('email')} disabled={isLoading} />
              {form.formState.errors.email && <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-dialog">Password</Label>
              <PasswordInput id="password-dialog" {...form.register('password')} disabled={isLoading} />
              {form.formState.errors.password && <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full font-headline text-lg h-12" disabled={!isLoaded || isLoading}>
              {isLoading ? 'Engaging...' : 'Engage'}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
