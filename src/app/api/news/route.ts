import { NextResponse } from 'next/server';

export async function GET() {
  const latestIntel: any[] = [];
  return NextResponse.json(latestIntel);
}
