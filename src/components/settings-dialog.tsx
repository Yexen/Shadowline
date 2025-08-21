
'use client';

import { useRef } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { useLogo } from "@/hooks/use-logo";
import { Separator } from "./ui/separator";
import { Download } from "lucide-react";


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
    
    const handleExportAllData = () => {
        const data: { [key: string]: any } = {};
        const keysToExport = [
            'gotham-bible-entries',
            'gotham-cover-image',
            'gotham-drafts',
            'gotham-gallery-data',
            'gotham-app-logo',
            'gotham-writers',
            'gotham-active-writer',
            'gotham-volumes-data',
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">Settings</DialogTitle>
                    <DialogDescription>
                        Customize your application settings.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
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
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onClose}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
