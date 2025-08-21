
'use client';

import { useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useLogo } from "@/hooks/use-logo";


interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const { setLogoUrl } = useLogo();
    const logoFileInputRef = useRef<HTMLInputElement>(null);

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
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Settings</DialogTitle>
                    <DialogDescription>
                        Customize your application settings. Changes are saved automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <h3 className="font-bold">Change Logo</h3>
                    <p className="text-sm text-muted-foreground">
                        Upload a new logo for the application. SVG, PNG, or JPG are recommended.
                    </p>
                    <Input type="file" accept="image/*" className="hidden" ref={logoFileInputRef} onChange={handleLogoFileSelect} />
                    <Button variant="outline" className="w-full" onClick={() => logoFileInputRef.current?.click()}>Browse Device</Button>
                </div>
                <DialogFooter>
                    <Button onClick={onClose}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

    