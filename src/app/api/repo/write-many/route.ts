import { NextResponse } from 'next/server';
import { writeFile } from '@/lib/github';

// Safety: allow only in src/ or public/
function safePath(p: string) {
  return /^src\/|^public\//.test(p);
}

export async function POST(req: Request) {
  try {
    const { files, message } = await req.json() as {
      files: { path: string; content: string }[];
      message?: string;
    };

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'No files to write' }, { status: 400 });
    }

    for (const f of files) {
      if (!f?.path || typeof f.content !== 'string') {
        return NextResponse.json({ error: 'Bad file entry' }, { status: 400 });
      }
      if (!safePath(f.path)) {
        return NextResponse.json({ error: `Path not allowed: ${f.path}` }, { status: 400 });
      }
    }

    // Simple approach: one PUT per file (multiple commits).
    // (A single tree/commit API could batch, but this is simpler.)
    for (const f of files) {
      await writeFile(f.path, f.content, message || `update ${f.path} (console multi)`);
    }

    return NextResponse.json({ ok: true, count: files.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'write-many error' }, { status: 500 });
  }
}
