
'use client';

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCoverImage } from "@/hooks/use-cover-image";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";

const pathToTitle: { [key: string]: string } = {
    '/home': "Welcome, Writer",
    '/editor': "The Editor",
    '/ai-tools': "Oracle AI Tools",
    '/gallery': "Visual Archives",
    '/about': "Project Intel"
};

export function AppHeader() {
    const pathname = usePathname();
    const { coverImage, setCoverImage } = useCoverImage();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState(coverImage);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const pageKey = Object.keys(pathToTitle).find(key => pathname.startsWith(key)) || '/home';
    const title = pathname.startsWith('/editor/') ? "The Editor" : pathToTitle[pageKey];

    const handleSave = () => {
        setCoverImage(newImageUrl);
        setDialogOpen(false);
    }
    
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setNewImageUrl(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6 group">
            <Image 
                src={coverImage}
                alt="Gotham City skyline with Bat-signal"
                fill
                className="object-cover"
                data-ai-hint="gotham city batman"
                key={coverImage} // Force re-render on image change
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="sm">
                            <ImagePlus className="mr-2"/>
                            Change Cover
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Change Header Image</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cover-url">Image URL</Label>
                                <Input 
                                    id="cover-url" 
                                    value={newImageUrl} 
                                    onChange={(e) => setNewImageUrl(e.target.value)} 
                                    placeholder="Paste image URL here"
                                />
                            </div>
                            <div className="text-center text-sm text-muted-foreground">OR</div>
                             <div className="space-y-2">
                                <Label>Upload from device</Label>
                                <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Browse Device</Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="absolute bottom-0 left-0 p-6">
                <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-wider text-white drop-shadow-lg">
                    {title}
                </h1>
            </div>
        </div>
    )
}
