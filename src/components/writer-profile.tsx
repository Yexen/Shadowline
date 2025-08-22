
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

interface WriterProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WriterProfile({ isOpen, onClose }: WriterProfileProps) {
    const { writers, activeWriter, addWriter, updateWriter, deleteWriter, setActiveWriter } = useWriters();
    const [editingWriter, setEditingWriter] = useState<Writer | null>(null);
    const [newWriterName, setNewWriterName] = useState('');
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
        if (newWriterName.trim()) {
            addWriter(newWriterName.trim());
            setNewWriterName('');
        }
    };

    const canEditRole = activeWriter?.role === 'head-writer';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Manage Users</DialogTitle>
                    <DialogDescription>
                        Add, edit, or switch between user profiles. The active user is shown in the sidebar.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
                                            {canEditRole && writer.id !== activeWriter.id && (
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
                                            <p className="text-xs text-muted-foreground">{writer.role}</p>
                                        </div>
                                         {activeWriter?.id !== writer.id ? (
                                            <Button variant="outline" size="sm" onClick={() => setActiveWriter(writer.id)}>Set Active</Button>
                                        ) : <div className="text-xs text-primary font-bold pr-2">ACTIVE</div> }
                                        {canEditRole && (
                                            <Button size="icon" variant="ghost" onClick={() => handleStartEdit(writer)}><Pencil/></Button>
                                        )}
                                        {canEditRole && writer.id !== activeWriter.id && (
                                            <Button size="icon" variant="ghost" onClick={() => deleteWriter(writer.id)} disabled={writers.length <= 1}><Trash2 className="text-destructive"/></Button>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {canEditRole && (
                        <div className="flex items-center gap-2 pt-4 border-t">
                            <Input 
                                placeholder="New user name..."
                                value={newWriterName}
                                onChange={(e) => setNewWriterName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNewWriter()}
                            />
                            <Button onClick={handleAddNewWriter} disabled={!newWriterName.trim()}><Plus className="mr-2"/> Add User</Button>
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
