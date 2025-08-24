import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

// use relative import unless your tsconfig defines "@/..."
import { writeFile } from '../../../../lib/github';

export async function POST(req: Request) {
  try {
    const { path, content, message } = await req.json();

    // allow only src/* and public/*
    if (!/^src\/|^public\//.test(path)) {
      return NextResponse.json({ error: 'Path not allowed' }, { status: 400 });
    }

    await writeFile(path, content, message || `update ${path}`);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'write error' }, { status: 500 });
  }
}

