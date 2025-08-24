import { NextResponse } from 'next/server';
import { readFile } from '@/lib/github';

export async function POST(req: Request) {
  const { path } = await req.json();
  const content = await readFile(path);
  return NextResponse.json({ content });
}
