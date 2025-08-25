import { NextResponse } from 'next/server';
import { writeFile, mkdirp, deletePath } from '@/lib/github';

export const runtime = 'nodejs';

type Op =
  | { type: 'write'; path: string; content: string; message?: string }
  | { type: 'mkdir'; path: string; message?: string }
  | { type: 'delete'; path: string; message?: string };

function isAllowed(key?: string) {
  const lock = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY;
  if (!lock) return true;
  return key === lock;
}

export async function POST(req: Request) {
  try {
    const key = req.headers.get('x-dev-key') || '';
    if (!isAllowed(key)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ops } = await req.json();
    if (!Array.isArray(ops)) {
      return NextResponse.json({ error: 'ops must be an array' }, { status: 400 });
    }

    let log = '';
    for (const op of ops as Op[]) {
      if (op.type === 'mkdir') {
        await mkdirp(op.path);
        log += `mkdir ${op.path}\n`;
      } else if (op.type === 'write') {
        // Safety: restrict to repo-safe areas
        if (!/^src\/|^public\//.test(op.path)) {
          log += `SKIP write (path not allowed): ${op.path}\n`;
          continue;
        }
        await writeFile(op.path, op.content, op.message || `update ${op.path} (AI studio)`);
        log += `write ${op.path} (${op.content.length} bytes)\n`;
      } else if (op.type === 'delete') {
        await deletePath(op.path, op.message || `remove ${op.path}`);
        log += `delete ${op.path}\n`;
      } else {
        log += `UNKNOWN op skipped: ${JSON.stringify(op)}\n`;
      }
    }

    let deployTriggered = false;
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      try {
        await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' });
        deployTriggered = true;
        log += `deploy hook: POST ${process.env.VERCEL_DEPLOY_HOOK_URL}\n`;
      } catch {
        log += 'deploy hook: FAILED\n';
      }
    }

    return NextResponse.json({ ok: true, log, deployTriggered });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'apply error' }, { status: 500 });
  }
}
