'use client';

import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useLogo } from "@/hooks/use-logo";
import { Separator } from "./ui/separator";
import { Download, Shield, Bot, Save } from "lucide-react";
import { useWriters } from "@/hooks/use-writers";
import { PasswordInput } from "./password-input";
import { useToast } from "@/hooks/use-toast";
import { useAiProvider } from "@/hooks/use-ai-provider";
import { Label } from "./ui/label";

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenUserManagement: () => void;
}

export function SettingsDialog({ isOpen, onClose, onOpenUserManagement }: SettingsDialogProps) {
    const { setLogoUrl } = useLogo();
    const logoFileInputRef = useRef<HTMLInputElement>(null);
    const { activeWriter } = useWriters();
    const { toast } = useToast();
    const { openAiApiKey, setOpenAiApiKey, isLoaded } = useAiProvider();
    
    const [apiKey, setApiKey] = useState('');
    
    useEffect(() => {
        if(isLoaded) {
            setApiKey(openAiApiKey);
        }
    }, [isLoaded, openAiApiKey, isOpen]);

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
        const keysToExport = Object.keys(localStorage);

        keysToExport.forEach(key => {
            if (key.startsWith('gotham-')) {
                const item = localStorage.getItem(key);
                if (item) {
                    try {
                        data[key] = JSON.parse(item);
                    } catch (e) {
                        data[key] = item;
                    }
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

    const handleSaveAiSettings = () => {
        setOpenAiApiKey(apiKey);
        toast({ title: "AI Settings Saved", description: "Your API key has been updated." });
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
                                <Button variant="outline" className="w-full mt-2" onClick={() => {onClose(); onOpenUserManagement();}}>
                                <Shield className="mr-2"/> Go to User Management
                                </Button>
                            </div>
                            <Separator />
                         </>
                    )}

                    <div>
                        <h3 className="font-bold flex items-center gap-2"><Bot /> AI & Image Generation</h3>
                         <div className="space-y-4 mt-2 p-3 border rounded-md">
                            <div className="space-y-2">
                                <Label htmlFor="openai-key">OpenAI API Key</Label>
                                <p className="text-xs text-muted-foreground">This key is stored locally and never shared. It is currently only used for certain image generation features.</p>
                                <PasswordInput id="openai-key" placeholder="sk-..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
                            </div>
                            <Button onClick={handleSaveAiSettings} className="w-full"><Save className="mr-2"/> Save AI Settings</Button>
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
