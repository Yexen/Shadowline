export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { writeFile } from '@/lib/github';

export async function POST(req: Request) {
  const { path, content, message } = await req.json();
  await writeFile(path, content, message || `update ${path}`);
  return NextResponse.json({ ok: true });
}
