
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

export default function GamesPage() {
  const router = useRouter();

  const games = [
    {
      title: "Batmobile Endless Runner",
      description: "Chase villains through the streets of Gotham in this high-speed endless runner. Dodge obstacles, collect power-ups, and see how long you can last!",
      imageUrl: "https://firebasestorage.googleapis.com/v0/b/shadows-of-gotham.firebasestorage.app/o/batmobile-game-cover.png?alt=media&token=8e24c3a5-11e2-4b2a-89a1-0f723829141b",
      dataAiHint: "batmobile racing game",
      link: "/games/batmobile-runner",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          Welcome to the Batcave Arcades. Take a break from writing and test your skills with these custom-built training simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card key={game.title} className="bg-card hover:border-primary/50 transition-colors flex flex-col group">
            <CardHeader>
              <CardTitle className="font-headline">{game.title}</CardTitle>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow relative aspect-video cursor-pointer" onClick={() => router.push(game.link)}>
               <Image 
                    src={game.imageUrl}
                    alt={game.title}
                    fill
                    className="object-cover rounded-md"
                    data-ai-hint={game.dataAiHint}
               />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary">Play Simulation</Button>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
