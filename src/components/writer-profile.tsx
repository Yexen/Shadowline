
'use client';

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useWriters, Writer, UserRole, UserStatus } from "@/hooks/use-writers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CheckCircle, Pencil, Plus, Trash2, User, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";

interface WriterProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WriterProfile({ isOpen, onClose }: WriterProfileProps) {
    const { writers, activeWriter, updateWriterStatus, updateWriterRole } = useWriters();
    const { toast } = useToast();

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

    const canManageUsers = activeWriter?.role === 'head-writer';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Manage Users</DialogTitle>
                    <DialogDescription>
                        {canManageUsers ? "Approve, edit roles for, or reject user profiles." : "You do not have permission to manage users."}
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
                                    <>
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
                                    </>
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
