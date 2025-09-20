
'use client';

import { useState, useRef } from 'react';
import { useWriters } from '@/hooks/use-writers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatLogo } from '@/components/bat-logo';
import { useWatchlist, type Video } from '@/hooks/use-watchlist';
import { useReadlist, type NewsArticle } from '@/hooks/use-readlist';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlayCircle, Trash2, Camera, Link as LinkIcon, Newspaper, UserPlus, Users, Copy, Shield } from 'lucide-react';
import { PasswordInput } from '@/components/password-input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/auth';

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

function ReadlistSection() {
    const { articles, removeArticle, isLoaded } = useReadlist();

    if (!isLoaded) {
        return <p>Loading read list...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Read List</CardTitle>
                <CardDescription>Articles you've saved to read later.</CardDescription>
            </CardHeader>
            <CardContent>
                {articles.length > 0 ? (
                     <div className="space-y-4">
                        {articles.map(article => (
                             <Card key={article.id} className="bg-card/50 flex items-center p-3">
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex-grow flex items-center gap-4 min-w-0">
                                   <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                                     {article.image ? (
                                       <Image src={article.image} alt={article.title} fill className="object-cover" />
                                     ) : (
                                       <div className="w-full h-full bg-muted flex items-center justify-center">
                                         <Newspaper className="w-8 h-8 text-muted-foreground" />
                                       </div>
                                     )}
                                   </div>
                                   <div className="flex-grow min-w-0">
                                     <p className="font-semibold truncate">{article.title}</p>
                                     <p className="text-sm text-muted-foreground truncate">{article.source}</p>
                                   </div>
                                </a>
                                <Button variant="ghost" size="icon" className="h-8 w-8 ml-4 flex-shrink-0" onClick={() => removeArticle(article.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                             </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">Your read list is empty.</p>
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

interface InviteLink {
  id: string;
  token: string;
  role: UserRole;
  createdAt: Date;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

function InvitationsManagementSection() {
    const { activeUser } = useWriters();
    const { toast } = useToast();
    const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
    const [maxUses, setMaxUses] = useState<string>('1');
    const [invites, setInvites] = useState<InviteLink[]>([]);

    // Only show for authors
    if (!activeUser || activeUser.role !== 'author') {
        return null;
    }

    const generateInviteToken = (role: UserRole): string => {
        const randomId = Math.random().toString(36).substring(2, 15);
        return `${role}-${randomId}`;
    };

    const createInvite = () => {
        const token = generateInviteToken(selectedRole);
        const newInvite: InviteLink = {
            id: `invite-${Date.now()}`,
            token,
            role: selectedRole,
            createdAt: new Date(),
            maxUses: maxUses === 'unlimited' ? undefined : parseInt(maxUses),
            currentUses: 0,
            isActive: true,
        };

        setInvites(prev => [newInvite, ...prev]);

        toast({
            title: 'Invitation Created!',
            description: `New ${selectedRole} invitation link generated.`,
        });
    };

    const copyInviteLink = (token: string) => {
        const baseUrl = window.location.origin;
        const inviteUrl = `${baseUrl}/invite/${token}`;
        navigator.clipboard.writeText(inviteUrl);

        toast({
            title: 'Link Copied!',
            description: 'Invitation link has been copied to clipboard.',
        });
    };

    const deactivateInvite = (id: string) => {
        setInvites(prev =>
            prev.map(invite =>
                invite.id === id
                    ? { ...invite, isActive: false }
                    : invite
            )
        );

        toast({
            title: 'Invitation Deactivated',
            description: 'The invitation link has been deactivated.',
        });
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case 'viewer': return 'text-blue-500';
            case 'analyst': return 'text-green-500';
            case 'contributor': return 'text-purple-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Invitation Management
                </CardTitle>
                <CardDescription>Create and manage invitation links for guest access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Create New Invitation */}
                <div className="space-y-4">
                    <h4 className="font-semibold">Create New Invitation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="analyst">Analyst</SelectItem>
                                    <SelectItem value="contributor">Contributor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxUses">Max Uses</Label>
                            <Select value={maxUses} onValueChange={setMaxUses}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select max uses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 use</SelectItem>
                                    <SelectItem value="5">5 uses</SelectItem>
                                    <SelectItem value="10">10 uses</SelectItem>
                                    <SelectItem value="unlimited">Unlimited</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button onClick={createInvite} className="w-full md:w-auto">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Generate Invitation Link
                    </Button>
                </div>

                <Separator />

                {/* Existing Invitations */}
                <div className="space-y-4">
                    <h4 className="font-semibold">Active Invitations</h4>
                    {invites.length === 0 ? (
                        <div className="text-center py-6">
                            <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground text-sm">No invitations created yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invites.map((invite) => (
                                <div
                                    key={invite.id}
                                    className={`border rounded-lg p-3 ${!invite.isActive ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={getRoleColor(invite.role)}>
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize text-sm">
                                                    {invite.role} Invitation
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Created {invite.createdAt.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-right text-xs">
                                                <p className="text-muted-foreground">
                                                    Uses: {invite.currentUses}/{invite.maxUses || '∞'}
                                                </p>
                                                <p className={`text-xs ${invite.isActive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {invite.isActive ? 'Active' : 'Inactive'}
                                                </p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyInviteLink(invite.token)}
                                                disabled={!invite.isActive}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>

                                            {invite.isActive && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => deactivateInvite(invite.id)}
                                                >
                                                    Deactivate
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ProfilePage() {
    const { activeWriter, isLoaded, updateWriterAvatar } = useWriters();
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    if (!isLoaded || !activeWriter) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <BatLogo className="w-24 h-12 text-primary animate-pulse" />
            </div>
        );
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setNewAvatarUrl(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSave = async () => {
        if (newAvatarUrl) {
            try {
                await updateWriterAvatar(activeWriter.id, newAvatarUrl);
                toast({ title: 'Avatar updated successfully' });
                setAvatarDialogOpen(false);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to update avatar.' });
            }
        }
    };
    
  return (
    <div className="space-y-8">
        <div className="flex items-center gap-6">
            <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                <DialogTrigger asChild>
                    <div className="relative group cursor-pointer">
                        <Avatar className="h-24 w-24 border-4 border-primary/50">
                            <AvatarImage src={activeWriter.avatarUrl} />
                            <AvatarFallback className="text-3xl">{activeWriter.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Profile Picture</DialogTitle>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="avatar-url">Image URL</Label>
                            <Input 
                                id="avatar-url" 
                                value={newAvatarUrl} 
                                onChange={(e) => setNewAvatarUrl(e.target.value)} 
                                placeholder="Paste image URL here"
                            />
                        </div>
                        <div className="text-center text-sm text-muted-foreground">OR</div>
                         <div className="space-y-2">
                            <Label>Upload from device</Label>
                            <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Browse Device</Button>
                        </div>
                        {newAvatarUrl && (
                            <div className="flex justify-center">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={newAvatarUrl} />
                                    <AvatarFallback>Preview</AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAvatarDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAvatarSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div>
                <h1 className="text-4xl font-headline font-bold">{activeWriter.name}</h1>
                <p className="text-lg text-muted-foreground">{activeWriter.email}</p>
                <p className="text-sm text-primary uppercase font-bold tracking-widest">{activeWriter.role}</p>
            </div>
        </div>

       <WatchlistSection />
       <ReadlistSection />
       <ChangePasswordSection />
       <InvitationsManagementSection />
    </div>
  );
}
