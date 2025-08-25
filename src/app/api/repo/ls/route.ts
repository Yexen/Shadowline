export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { list } from '@/lib/github';

export async function POST(req: Request) {
  const { path } = await req.json();
  const items = await list(path || '');
  return NextResponse.json({ items });
}

