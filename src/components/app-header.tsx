
'use client';

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCoverImage } from "@/hooks/use-cover-image";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRef, useState, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { BatLogo } from "./bat-logo";
import { Slider } from "./ui/slider";
import { InstallPwaButton } from "./install-pwa-button";

const pathToTitle: { [key: string]: string } = {
    '/home': "welcome Gothamite",
    '/search': "Universal Search",
    '/editor': "The Editor",
    '/drafts': "Unfinished Business",
    '/ai-tools': "Oracle AI Tools",
    '/council-chamber': "Council Chamber",
    '/gallery': "Visual Archives",
    '/games': "Batcave Arcades",
    '/maps': "Cartography",
    '/classification': "Content Classification",
    '/organization': "Mission Control",
    '/messages': "Secure Comms",
    '/sources/comics': "Comics Database",
    '/sources/media': "Media Database",
    '/sources': "Intel",
    '/about': "Project Intel",
    '/nyxen': "Nyxen Chat",
    '/dev-console': "Batcomputer"
};

export function AppHeader() {
    const pathname = usePathname();
    const { coverImage, setCoverImage, dataAiHint, coverImagePosition, setCoverImagePosition } = useCoverImage();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState(coverImage);
    const [newPosition, setNewPosition] = useState([coverImagePosition]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (dialogOpen) {
            setNewImageUrl(coverImage);
            setNewPosition([coverImagePosition]);
        }
    }, [dialogOpen, coverImage, coverImagePosition]);

    const pageKey = Object.keys(pathToTitle).find(key => pathname.startsWith(key)) || '/home';
    let title = pathToTitle[pageKey] || "Shadows of Gotham";
    if (pathname.startsWith('/editor/')) {
        title = "The Editor";
    } else if (pathname === '/sources/comics') {
        title = "Comics Database";
    } else if (pathname === '/sources/media') {
        title = "Media Database";
    } else if (pathname.startsWith('/sources')) {
        title = "Intel";
    }


    const handleSave = () => {
        if (newImageUrl !== coverImage) {
            setCoverImage(newImageUrl, 'gotham city batman');
        }
        setCoverImagePosition(newPosition[0]);
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
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden mb-6 group">
            <Image 
                src="https://qh7zmtvimx9i7m9w.public.blob.vercel-storage.com/Header.png"
                alt="Gotham City skyline with Bat-signal"
                fill
                className="object-cover"
                style={{ objectPosition: `center ${coverImagePosition}%` }}
                data-ai-hint="gotham city batman header"
                key="hardcoded-header"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            <div className="absolute top-2 right-2">
                <InstallPwaButton />
            </div>
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
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
                            <div className="relative h-32 w-full rounded-md overflow-hidden border">
                                <Image src="https://qh7zmtvimx9i7m9w.public.blob.vercel-storage.com/Header.png" alt="Cover preview" fill className="object-cover" style={{ objectPosition: `center ${newPosition[0]}%` }} />
                            </div>
                            <div className="space-y-2">
                                <Label>Adjust Vertical Position</Label>
                                <Slider
                                    value={newPosition}
                                    onValueChange={setNewPosition}
                                    max={100}
                                    step={1}
                                />
                            </div>
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
            <div className="absolute bottom-0 left-0 p-6 flex items-center gap-2">
                <SidebarTrigger className="md:hidden bg-black/50 hover:bg-black/70 rounded-md p-2 transition-colors">
                    <BatLogo className="w-6 h-3 text-white" />
                </SidebarTrigger>
                <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-wider text-white drop-shadow-lg">
                    {title}
                </h1>
            </div>
        </div>
    )
}
