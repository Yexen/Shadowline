import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info, Github, Twitter, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-wider text-foreground flex items-center gap-3">
          <Info className="text-primary" />
          About This Project
        </h1>
        <p className="mt-2 text-muted-foreground">
          The story behind the Shadows of Gotham Writer's Protocol.
        </p>
      </div>

      <Card className="overflow-hidden bg-card">
        <Image src="https://placehold.co/1200x400" alt="Gotham skyline" width={1200} height={400} className="w-full h-48 object-cover" data-ai-hint="gotham city dark" />
        <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
                <Avatar className="w-32 h-32 border-4 border-background ring-2 ring-primary">
                    <AvatarImage src="https://placehold.co/128x128" data-ai-hint="writer portrait" />
                    <AvatarFallback className="text-4xl font-headline">W</AvatarFallback>
                </Avatar>
                <div className="pt-16">
                    <h2 className="font-headline text-3xl font-bold">The Writer</h2>
                    <p className="text-primary">Creator & Guardian of Gotham's Stories</p>
                </div>
            </div>

            <div className="mt-6 space-y-4 text-lg text-foreground/80">
                <p>
                    Shadows of Gotham Writer was forged in the heart of the city's darkness, born from a need for a dedicated space where tales of heroism, villainy, and the complex morality of Gotham could be crafted without distraction. This tool is more than just a text editor; it is a sanctuary for chroniclers of the night.
                </p>
                <p>
                    Built with cutting-edge Wayne Enterprises technology (simulated via Next.js, TypeScript, and Tailwind CSS), this application provides a secure, immersive environment. Every feature, from the AI-powered 'Oracle' tools to the integrated 'Gotham Bible' for lore management, is designed to empower writers to bring their visions of Gotham to life.
                </p>
                <p>
                    This is a personal project, a love letter to the enduring legacy of the Dark Knight and the universe he protects. It stands as a testament to the power of stories and the inspiration found within the shadows.
                </p>
            </div>
            
            <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-headline text-muted-foreground">CONNECT WITH THE CREATOR</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon"><Github /></Button>
                    <Button variant="outline" size="icon"><Twitter /></Button>
                    <Button variant="outline" size="icon"><Mail /></Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
