
'use client';

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { useWriters, Writer, UserRole, UserStatus } from "@/hooks/use-writers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CheckCircle, MessageSquare, Pencil, Plus, Trash2, User, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useRouter } from "next/navigation";

interface WriterProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WriterProfile({ isOpen, onClose }: WriterProfileProps) {
    const { writers, activeWriter, updateWriterStatus, updateWriterRole, deleteWriter } = useWriters();
    const { toast } = useToast();
    const router = useRouter();

    const handleStatusChange = async (writerId: string, status: UserStatus) => {
        try {
            await updateWriterStatus(writerId, status);
            toast({
                title: 'Status Updated',
                description: `User status has been set to ${status}.`,
            });
        } catch(error) {
            console.error("Failed to update status:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update user status.',
            });
        }
    };
    
     const handleRoleChange = async (writerId: string, role: UserRole) => {
        try {
            await updateWriterRole(writerId, role);
            toast({
                title: 'Role Updated',
                description: `User role has been set to ${role}.`,
            });
        } catch(error) {
            console.error("Failed to update role:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update user role.',
            });
        }
    };

    const handleDeleteWriter = async (writerId: string) => {
        try {
            await deleteWriter(writerId);
            toast({
                title: 'User Deleted',
                description: 'The user has been removed from the system.',
                variant: 'destructive'
            });
        } catch(error) {
            console.error("Failed to delete user:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete user.',
            });
        }
    }

    const handleStartMessage = (writerId: string) => {
        // Navigate to the messages page with a query param to start a new conversation
        onClose();
        router.push(`/messages?new=${writerId}`);
    }

    const canManageUsers = activeWriter?.role === 'head-writer';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Manage Users</DialogTitle>
                    <DialogDescription>
                        {canManageUsers ? "Approve, edit roles for, or remove user profiles." : "You do not have permission to manage users."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
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
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={writer.role} onValueChange={(value: UserRole) => handleRoleChange(writer.id, value)}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder="Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="head-writer">Head Writer</SelectItem>
                                                <SelectItem value="writer">Writer</SelectItem>
                                                <SelectItem value="reader">Reader</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" onClick={() => handleStartMessage(writer.id)}>
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete {writer.name}'s profile. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteWriter(writer.id)}>Delete User</AlertDialogAction>
                                                </AlertDialogFooter>
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
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
