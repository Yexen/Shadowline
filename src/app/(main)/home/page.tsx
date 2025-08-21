import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Youtube, Newspaper } from "lucide-react";

const surveillanceFootage = [
  { id: 1, title: "The Dark Knight - Hospital Scene", uploader: "WB Official", views: "15M", thumbnail: "https://placehold.co/600x400", dataAiHint: "dark knight movie" },
  { id: 2, title: "Batman (1989) - Batmobile Scene", uploader: "Fan Archives", views: "8.2M", thumbnail: "https://placehold.co/600x400", dataAiHint: "batmobile retro" },
  { id: 3, title: "The Batman - Penguin Chase", uploader: "Scene City", views: "21M", thumbnail: "https://placehold.co/600x400", dataAiHint: "car chase night" },
  { id: 4, title: "Arkham Knight - Gameplay Trailer", uploader: "Rocksteady", views: "30M", thumbnail: "https://placehold.co/600x400", dataAiHint: "video game" },
];

const latestIntel = [
    { id: 1, title: "New Gotham Knights DLC Announced", source: "Gotham Gazette", date: "2 hours ago", snippet: "A new story expansion is coming to Gotham Knights, focusing on the Court of Owls...", image: "https://placehold.co/600x400", dataAiHint: "gotham city skyline" },
    { id: 2, title: "Analysis: The Philosophy of Batman's Villains", source: "Wayne Foundation Journal", date: "1 day ago", snippet: "An in-depth look at the complex ideologies that drive Gotham's most infamous rogues...", image: "https://placehold.co/600x400", dataAiHint: "dark abstract" },
    { id: 3, title: "The Architecture of Gotham City", source: "Metropolis Times", date: "3 days ago", snippet: "Exploring the gothic and art deco influences that define Gotham's iconic skyline...", image: "https://placehold.co/600x400", dataAiHint: "gothic architecture night" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-wider text-foreground">
          Welcome, Writer
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your watch has begun. Here is the latest from the shadows.
        </p>
      </div>

      <section>
        <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3 mb-4">
            <Youtube className="text-primary" />
            Surveillance Footage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {surveillanceFootage.map(video => (
            <Card key={video.id} className="overflow-hidden bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-0">
                <Image src={video.thumbnail} alt={video.title} width={600} height={400} className="aspect-video object-cover" data-ai-hint={video.dataAiHint} />
                <div className="p-4">
                    <h3 className="font-bold font-headline truncate">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{video.uploader}</p>
                    <p className="text-xs text-muted-foreground">{video.views} views</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3 mb-4">
            <Newspaper className="text-primary" />
            Latest Intel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestIntel.map(news => (
                <Card key={news.id} className="flex flex-col bg-card hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <Image src={news.image} alt={news.title} width={600} height={400} className="aspect-video object-cover rounded-t-lg -mt-6 -mx-6" data-ai-hint={news.dataAiHint} />
                        <CardTitle className="font-headline pt-4">{news.title}</CardTitle>
                        <CardDescription>{news.source} - {news.date}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{news.snippet}</p>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button variant="link" className="p-0 text-primary">Read More</Button>
                    </div>
                </Card>
            ))}
        </div>
      </section>
    </div>
  );
}
