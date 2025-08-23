import { NextResponse } from 'next/server';

export async function GET() {
  const latestIntel = [
      {id: 1, title: 'Wayne Enterprises Announces New Tech Initiative', source: 'The Gotham Gazette', date: '4 hours ago', snippet: 'Wayne Enterprises has pledged to revitalize Burnley with a new technology center, promising jobs and innovation.', image: 'https://placehold.co/600x400.png', dataAiHint: 'modern cityscape', url: 'https://google.com/news'},
      {id: 2, title: 'Riddler Strikes Again With City-Wide Puzzle', source: 'Channel 52 News', date: '1 day ago', snippet: 'The enigmatic Riddler has challenged Gotham\'s finest with a series of complex puzzles, threatening to release sensitive city data.', image: 'https://placehold.co/600x400.png', dataAiHint: 'question mark neon', url: 'https://google.com/news'},
      {id: 3, title: 'The Penguin\'s Iceberg Lounge Under Investigation', source: 'Gotham PD Press', date: '3 days ago', snippet: 'Sources confirm the GCPD is building a case against Oswald Cobblepot, owner of the popular Iceberg Lounge.', image: 'https://placehold.co/600x400.png', dataAiHint: 'crime investigation board', url: 'https://google.com/news'},
  ];
  return NextResponse.json(latestIntel);
}
