import { NextResponse } from 'next/server';

export async function GET() {
  const surveillanceFootage = [
      {id: 1, title: 'Top 10 Batmobile Gadgets You Never Knew!', uploader: 'Bat-Fans United', views: '2.1M', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'batmobile gadgets', url: 'https://youtube.com'},
      {id: 2, title: 'Arkham Asylum: A Deep Dive into its Architecture', uploader: 'Gotham Historian', views: '870K', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'gothic architecture asylum', url: 'https://youtube.com'},
      {id: 3, title: 'Ranking Every Robin: From Best to Worst', uploader: 'Comic Geek', views: '1.5M', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'superhero sidekick', url: 'https://youtube.com'},
  ];
  return NextResponse.json(surveillanceFootage);
}
