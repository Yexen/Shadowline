import { NextResponse } from 'next/server';

export async function GET() {
  const surveillanceFootage: any[] = [];
  return NextResponse.json(surveillanceFootage);
}
