
'use client';

import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useLogo } from "@/hooks/use-logo";
import { Separator } from "./ui/separator";
import { Download, Shield, Bot } from "lucide-react";
import { useWriters } from "@/hooks/use-writers";
import { PasswordInput } from "./password-input";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useAiProvider, AiProvider } from "@/hooks/use-ai-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";


interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const { setLogoUrl } = useLogo();
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const { activeWriter } = useWriters();
    const { toast } = useToast();
    const { provider, setProvider, openAiApiKey, setOpenAiApiKey, isLoaded } = useAiProvider();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [apiKey, setApiKey] = useState(openAiApiKey);
    
    useEffect(() => {
        if(isLoaded) {
            setApiKey(openAiApiKey);
        }
    }, [isLoaded, openAiApiKey]);

    const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setLogoUrl(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    
    const handleExportAllData = () => {
        const data: { [key: string]: any } = {};
        const keysToExport = [
            'gotham-bible-entries',
            'gotham-cover-image',
            'gotham-drafts',
            'gotham-gallery-data',
            'gotham-app-logo',
            'gotham-volumes-data',
            'gotham-ai-provider',
            'gotham-openai-key'
        ];

        keysToExport.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                try {
                    data[key] = JSON.parse(item);
                } catch (e) {
                    data[key] = item;
                }
            }
        });

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'gotham_protocol_backup.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleChangePassword = async () => {
        const user = auth.currentUser;
        if (!user || !user.email) {
            toast({ variant: 'destructive', title: 'Error', description: 'No authenticated user found.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            toast({ title: 'Success', description: 'Your password has been changed.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error("Password change error:", error);
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Failed to change password. Please check your current password and try again.' });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Settings</DialogTitle>
                    <DialogDescription>
                        Customize your application settings.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                    {activeWriter?.role === 'head-writer' && (
                         <>
                            <div>
                                <h3 className="font-bold">Head Writer's Console</h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage users, permissions, and approve changes.
                                </p>
                                <Button variant="outline" className="w-full mt-2" onClick={() => {onClose(); /* TODO: navigate to a dedicated admin page */}}>
                                <Shield className="mr-2"/> Go to User Management
                                </Button>
                            </div>
                            <Separator />
                         </>
                    )}
                    
                    <div>
                        <h3 className="font-bold">Change Password</h3>
                        <div className="space-y-2 mt-2">
                             <PasswordInput placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                             <PasswordInput placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password"/>
                             <PasswordInput placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password"/>
                             <Button onClick={handleChangePassword} className="w-full">Update Password</Button>
                        </div>
                    </div>
                    
                    <Separator />

                    <div>
                        <h3 className="font-bold">Change Logo</h3>
                        <p className="text-sm text-muted-foreground">
                            Upload a new logo for the application. SVG, PNG, or JPG are recommended.
                        </p>
                        <Input type="file" accept="image/*" className="hidden" ref={logoFileInputRef} onChange={handleLogoFileSelect} />
                        <Button variant="outline" className="w-full mt-2" onClick={() => logoFileInputRef.current?.click()}>Browse Device</Button>
                    </div>

                    <Separator />
                    
                    <div>
                        <h3 className="font-bold">Share Progress</h3>
                        <p className="text-sm text-muted-foreground">
                            Export all your project data (bible, drafts, volumes, etc.) into a single file to share or back up your work.
                        </p>
                        <Button variant="outline" className="w-full mt-2" onClick={handleExportAllData}>
                           <Download className="mr-2"/> Export All Data
                        </Button>
                    </div>

                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
