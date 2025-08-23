
'use client';

import React, { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "./ui/dialog";
import { useWriters, UserRole, UserStatus } from "@/hooks/use-writers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageSquare, Trash2, Camera, User, Shield } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Separator } from './ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useReadlist } from '@/hooks/use-readlist';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { PasswordInput } from './password-input';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';


function WatchlistSection() {
    const { videos, removeVideo, isLoaded } = useWatchlist();

    if (!isLoaded) return <p>Loading watchlist...</p>;

    return (
        <Card className="shadow-none border-none">
            <CardHeader>
                <CardTitle>My Watchlist</CardTitle>
                <CardDescription>Videos you've saved to watch later.</CardDescription>
            </CardHeader>
            <CardContent>
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                        {videos.map(video => (
                            <Card key={video.id} className="group overflow-hidden bg-card/50">
                                <a href={video.url} target="_blank" rel="noopener noreferrer">
                                    <div className="relative aspect-video">
                                        <Image src={video.thumbnail} alt={video.title} fill className="object-cover" />
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

    if (!isLoaded) return <p>Loading read list...</p>;

    return (
        <Card className="shadow-none border-none">
            <CardHeader>
                <CardTitle>My Read List</CardTitle>
                <CardDescription>Articles you've saved to read later.</CardDescription>
            </CardHeader>
            <CardContent>
                {articles.length > 0 ? (
                     <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {articles.map(article => (
                             <Card key={article.id} className="bg-card/50 flex items-center p-3">
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex-grow flex items-center gap-4 min-w-0">
                                   <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md">
                                     <Image src={article.image} alt={article.title} fill className="object-cover" />
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
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
            return;
        }
        toast({ title: 'Success', description: 'Your password has been changed.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    return (
         <Card className="shadow-none border-none">
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

function UserManagementPanel({ canManageUsers }: { canManageUsers: boolean }) {
    const { writers, activeWriter, updateWriterStatus, updateWriterRole, deleteWriter } = useWriters();
    const { toast } = useToast();
    const router = useRouter();

    const handleStatusChange = async (writerId: string, status: UserStatus) => {
        await updateWriterStatus(writerId, status);
        toast({ title: 'Status Updated', description: `User status has been set to ${status}.` });
    };
    
    const handleRoleChange = async (writerId: string, role: UserRole) => {
        await updateWriterRole(writerId, role);
        toast({ title: 'Role Updated', description: `User role has been set to ${role}.` });
    };

    const handleDeleteWriter = async (writerId: string) => {
        await deleteWriter(writerId);
        toast({ title: 'User Deleted', description: 'The user has been removed from the system.', variant: 'destructive' });
    };

    const handleStartMessage = (writerId: string) => {
        router.push(`/messages?new=${writerId}`);
    };

    return (
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {writers.map(writer => (
                <div key={writer.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={writer.avatarUrl} data-ai-hint={writer.dataAiHint} />
                        <AvatarFallback>{writer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">{writer.name}</p>
                        <p className="text-xs text-muted-foreground">{writer.email}</p>
                    </div>
                    {canManageUsers && writer.id !== activeWriter?.id ? (
                        <div className="flex items-center gap-2">
                            <Select value={writer.status} onValueChange={(value: UserStatus) => handleStatusChange(writer.id, value)}>
                                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={writer.role} onValueChange={(value: UserRole) => handleRoleChange(writer.id, value)}>
                                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Role" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="head-writer">Head Writer</SelectItem>
                                    <SelectItem value="writer">Writer</SelectItem>
                                    <SelectItem value="reader">Reader</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => handleStartMessage(writer.id)}><MessageSquare className="h-4 w-4" /></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {writer.name}'s profile. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteWriter(writer.id)}>Delete User</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    ) : (
                        <>
                            <Badge variant={writer.status === 'approved' ? 'default' : 'secondary'}>{writer.status}</Badge>
                            <Badge variant="outline">{writer.role}</Badge>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export function WriterProfile({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
    const { activeWriter, updateWriterAvatar } = useWriters();
    const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => setNewAvatarUrl(loadEvent.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSave = async () => {
        if (newAvatarUrl && activeWriter) {
            await updateWriterAvatar(activeWriter.id, newAvatarUrl);
            toast({ title: 'Avatar updated successfully' });
            setAvatarDialogOpen(false);
        }
    };
    
    if (!activeWriter) return null;

    const canManageUsers = activeWriter.role === 'head-writer';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-6">
                         <div className="relative group cursor-pointer" onClick={() => setAvatarDialogOpen(true)}>
                            <Avatar className="h-24 w-24 border-4 border-primary/50">
                                <AvatarImage src={activeWriter.avatarUrl} key={activeWriter.avatarUrl} />
                                <AvatarFallback className="text-3xl">{activeWriter.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <DialogTitle className="text-4xl font-headline font-bold">{activeWriter.name}</DialogTitle>
                            <p className="text-lg text-muted-foreground">{activeWriter.email}</p>
                            <p className="text-sm text-primary uppercase font-bold tracking-widest">{activeWriter.role}</p>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="my-content" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="my-content"><User className="mr-2"/> My Profile</TabsTrigger>
                        <TabsTrigger value="user-management" disabled={!canManageUsers}><Shield className="mr-2"/> User Management</TabsTrigger>
                    </TabsList>
                    <TabsContent value="my-content" className="flex-grow overflow-y-auto space-y-6 pt-4">
                        <WatchlistSection />
                        <ReadlistSection />
                        <ChangePasswordSection />
                    </TabsContent>
                    <TabsContent value="user-management" className="flex-grow overflow-y-auto">
                        {canManageUsers && <UserManagementPanel canManageUsers={canManageUsers} />}
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                     <DialogClose asChild>
                        <Button onClick={onClose}>Done</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
            
            <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Change Profile Picture</DialogTitle></DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="avatar-url">Image URL</Label>
                            <Input id="avatar-url" value={newAvatarUrl} onChange={(e) => setNewAvatarUrl(e.target.value)} placeholder="Paste image URL here" />
                        </div>
                        <div className="text-center text-sm text-muted-foreground">OR</div>
                         <div className="space-y-2">
                            <Label>Upload from device</Label>
                            <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Browse Device</Button>
                        </div>
                        {newAvatarUrl && (
                            <div className="flex justify-center">
                                <Avatar className="h-32 w-32"><AvatarImage src={newAvatarUrl} /><AvatarFallback>Preview</AvatarFallback></Avatar>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAvatarDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAvatarSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
