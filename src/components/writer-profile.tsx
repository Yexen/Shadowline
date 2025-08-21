
'use client';

import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useWriters, Writer } from "@/hooks/use-writers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CheckCircle, Pencil, Plus, Trash2, User, X } from "lucide-react";

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

    const handleFieldChange = (field: keyof Writer, value: string) => {
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Manage Writers</DialogTitle>
                    <DialogDescription>
                        Add, edit, or switch between writer profiles. The active writer is shown in the sidebar.
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
                                        <Input value={editingWriter.name} onChange={e => handleFieldChange('name', e.target.value)} className="flex-grow"/>
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
                                            {activeWriter?.id === writer.id && <p className="text-xs text-primary">Active</p>}
                                        </div>
                                        {activeWriter?.id !== writer.id && (
                                            <Button variant="outline" size="sm" onClick={() => setActiveWriter(writer.id)}>Set Active</Button>
                                        )}
                                        <Button size="icon" variant="ghost" onClick={() => handleStartEdit(writer)}><Pencil/></Button>
                                        <Button size="icon" variant="ghost" onClick={() => deleteWriter(writer.id)} disabled={writers.length <= 1}><Trash2 className="text-destructive"/></Button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t">
                        <Input 
                            placeholder="New writer name..."
                            value={newWriterName}
                            onChange={(e) => setNewWriterName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddNewWriter()}
                        />
                        <Button onClick={handleAddNewWriter} disabled={!newWriterName.trim()}><Plus className="mr-2"/> Add Writer</Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
