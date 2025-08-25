export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { deletePath } from '@/lib/github';

export async function POST(req: Request) {
  const { path } = await req.json();
  await deletePath(path, `remove ${path}`);
  return NextResponse.json({ ok: true });
}
