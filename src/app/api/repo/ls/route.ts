export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { list } from '@/lib/github';

export async function POST(req: Request) {
  const { path } = await req.json();
  const items = await list(path || '');
  return NextResponse.json({ items });
}

