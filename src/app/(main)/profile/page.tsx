
'use client';

import { useState } from 'react';
import { useWriters } from '@/hooks/use-writers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatLogo } from '@/components/bat-logo';
import { useWatchlist, type Video } from '@/hooks/use-watchlist';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlayCircle, Trash2 } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

function WatchlistSection() {
    const { videos, removeVideo, isLoaded } = useWatchlist();

    if (!isLoaded) {
        return <p>Loading watchlist...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Watchlist</CardTitle>
                <CardDescription>Videos you've saved to watch later.</CardDescription>
            </CardHeader>
            <CardContent>
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.map(video => (
                            <Card key={video.id} className="group overflow-hidden bg-card/50">
                                <a href={video.url} target="_blank" rel="noopener noreferrer">
                                    <div className="relative aspect-video">
                                        <Image
                                            src={video.thumbnail}
                                            alt={video.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <PlayCircle className="w-12 h-12 text-white/80" />
                                        </div>
                                    </div>
                                </a>
                                <div className="p-3">
                                    <h4 className="font-semibold truncate">{video.title}</h4>
                                    <div className="flex justify-between items-center mt-2">
                                      <p className="text-xs text-muted-foreground truncate">{video.uploader}</p>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeVideo(video.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">Your watchlist is empty.</p>
                )}
            </CardContent>
        </Card>
    );
}

function ChangePasswordSection() {
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        // This is a placeholder for real auth. In a real app, this would be an API call.
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
            return;
        }
        // Simulate success
        toast({ title: 'Success', description: 'Your password has been changed.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your login credentials.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <PasswordInput placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                <Separator />
                <PasswordInput placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password"/>
                <PasswordInput placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password"/>
                <Button onClick={handleChangePassword} className="w-full">Update Password</Button>
            </CardContent>
        </Card>
    )
}

export default function ProfilePage() {
    const { activeWriter, isLoaded } = useWriters();

    if (!isLoaded || !activeWriter) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <BatLogo className="w-24 h-12 text-primary animate-pulse" />
            </div>
        );
    }
    
  return (
    <div className="space-y-8">
        <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/50">
                <AvatarImage src={activeWriter.avatarUrl} />
                <AvatarFallback className="text-3xl">{activeWriter.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-4xl font-headline font-bold">{activeWriter.name}</h1>
                <p className="text-lg text-muted-foreground">{activeWriter.email}</p>
                <p className="text-sm text-primary uppercase font-bold tracking-widest">{activeWriter.role}</p>
            </div>
        </div>

       <WatchlistSection />
       <ChangePasswordSection />
    </div>
  );
}
