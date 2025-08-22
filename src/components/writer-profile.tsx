
'use client';

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useWriters, Writer, UserRole } from "@/hooks/use-writers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CheckCircle, Pencil, Plus, Trash2, User, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface WriterProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WriterProfile({ isOpen, onClose }: WriterProfileProps) {
    const { writers, activeWriter, addWriter, updateWriter, deleteWriter, setActiveWriter } = useWriters();
    const [editingWriter, setEditingWriter] = useState<Writer | null>(null);
    const [newWriterName, setNewWriterName] = useState('');
    const [newWriterEmail, setNewWriterEmail] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleStartEdit = (writer: Writer) => {
        setEditingWriter(JSON.parse(JSON.stringify(writer))); // deep copy
    };

    const handleCancelEdit = () => {
        setEditingWriter(null);
    };

    const handleSaveEdit = () => {
        if (editingWriter) {
            updateWriter(editingWriter.id, editingWriter);
            setEditingWriter(null);
        }
    };

    const handleFieldChange = (field: keyof Writer, value: string | UserRole) => {
        if (editingWriter) {
            setEditingWriter({ ...editingWriter, [field]: value });
        }
    };
    
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editingWriter) {
            const reader = new FileReader();
            reader.onload = (event) => {
                handleFieldChange('avatarUrl', event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddNewWriter = () => {
        if (newWriterName.trim() && newWriterEmail.trim()) {
            addWriter(newWriterName.trim(), newWriterEmail.trim(), 'writer');
            setNewWriterName('');
            setNewWriterEmail('');
        }
    };

    const canManageUsers = activeWriter?.role === 'head-writer';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Manage Users</DialogTitle>
                    <DialogDescription>
                        {canManageUsers ? "Approve, edit, or switch between user profiles." : "Switch between user profiles."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        {writers.map(writer => (
                            <div key={writer.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50">
                                {editingWriter?.id === writer.id ? (
                                    <>
                                        <div className="relative group">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={editingWriter.avatarUrl} data-ai-hint={editingWriter.dataAiHint} />
                                                <AvatarFallback>{editingWriter.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <Button size="icon" variant="secondary" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 h-10 w-10" onClick={() => fileInputRef.current?.click()}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleAvatarUpload} />
                                        </div>
                                        <div className="flex-grow space-y-1">
                                            <Input value={editingWriter.name} onChange={e => handleFieldChange('name', e.target.value)} />
                                            {canManageUsers && writer.id !== activeWriter.id && (
                                                <Select value={editingWriter.role} onValueChange={(value: UserRole) => handleFieldChange('role', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="head-writer">Head Writer</SelectItem>
                                                        <SelectItem value="writer">Writer</SelectItem>
                                                        <SelectItem value="reader">Reader</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={handleSaveEdit}><CheckCircle className="text-green-500"/></Button>
                                        <Button size="icon" variant="ghost" onClick={handleCancelEdit}><X/></Button>
                                    </>
                                ) : (
                                    <>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={writer.avatarUrl} data-ai-hint={writer.dataAiHint} />
                                            <AvatarFallback>{writer.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{writer.name}</p>
                                            <p className="text-xs text-muted-foreground">{writer.email} ({writer.role})</p>
                                        </div>
                                         {writer.status === 'pending' && <Badge variant="secondary">Pending</Badge>}
                                         {activeWriter?.id !== writer.id && writer.status === 'approved' ? (
                                            <Button variant="outline" size="sm" onClick={() => setActiveWriter(writer.id)}>Set Active</Button>
                                        ) : writer.status === 'approved' && <Badge variant="default">ACTIVE</Badge> }
                                        {canManageUsers && (
                                            <Button size="icon" variant="ghost" onClick={() => handleStartEdit(writer)}><Pencil/></Button>
                                        )}
                                        {canManageUsers && writer.id !== activeWriter.id && (
                                            <Button size="icon" variant="ghost" onClick={() => deleteWriter(writer.id)} disabled={writers.length <= 1}><Trash2 className="text-destructive"/></Button>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {canManageUsers && (
                        <div className="pt-4 border-t">
                            <h4 className="font-headline mb-2">Add New User</h4>
                            <div className="flex items-center gap-2">
                                <Input 
                                    placeholder="New user name..."
                                    value={newWriterName}
                                    onChange={(e) => setNewWriterName(e.target.value)}
                                />
                                 <Input 
                                    placeholder="New user email..."
                                    value={newWriterEmail}
                                    onChange={(e) => setNewWriterEmail(e.target.value)}
                                />
                                <Button onClick={handleAddNewWriter} disabled={!newWriterName.trim() || !newWriterEmail.trim()}><Plus /></Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
