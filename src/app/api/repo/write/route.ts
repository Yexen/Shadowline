
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { writeFile } from '@/lib/github';

export async function POST(req: Request) {
  const { path, content, message } = await req.json();
  // simple safety: only allow src/* or public/*
  if (!/^src\/|^public\//.test(path)) return NextResponse.json({ error: 'Path not allowed' }, { status: 400 });
  await writeFile(path, content, message || `update ${path}`);
  return NextResponse.json({ ok: true });
}
