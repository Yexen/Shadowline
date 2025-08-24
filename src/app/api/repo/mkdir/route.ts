export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { mkdirp } from '@/lib/github';

export async function POST(req: Request) {
  const { path } = await req.json();
  await mkdirp(path);
  return NextResponse.json({ ok: true });
}
