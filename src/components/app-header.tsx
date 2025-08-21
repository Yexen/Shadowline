
'use client';

import Image from "next/image";
import { usePathname } from "next/navigation";

const pathToTitle: { [key: string]: string } = {
    '/home': "Welcome, Writer",
    '/editor': "The Editor",
    '/ai-tools': "Oracle AI Tools",
    '/gallery': "Visual Archives",
    '/about': "Project Intel"
};


export function AppHeader() {
    const pathname = usePathname();
    const pageKey = Object.keys(pathToTitle).find(key => pathname.startsWith(key)) || '/home';
    const title = pageKey.startsWith('/editor/') ? "The Editor" : pathToTitle[pageKey];


    return (
        <div className="relative w-full h-48 rounded-lg overflow-hidden mb-6">
            <Image 
                src="https://placehold.co/1600x400" 
                alt="Gotham City skyline with Bat-signal"
                fill
                className="object-cover"
                data-ai-hint="gotham city batman"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
                <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-wider text-white drop-shadow-lg">
                    {title}
                </h1>
            </div>
        </div>
    )
}
