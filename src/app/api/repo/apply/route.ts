// src/app/api/repo/apply/route.ts
import { NextResponse } from 'next/server';
import { readFile, writeFile, deletePath, mkdirp } from '@/lib/github';

type Op =
  | { type: 'write'; path: string; content: string; message?: string }
  | { type: 'mkdir'; path: string; message?: string }
  | { type: 'delete'; path: string; message?: string };

type UndoOp =
  | { type: 'write'; path: string; content: string; message?: string } // restore old content
  | { type: 'delete'; path: string; message?: string }                 // remove file we created
  | { type: 'delete'; path: string; message?: string }                 // removing .gitkeep for mkdir

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function onlySafePath(p: string) {
  return /^src\/|^public\//.test(p);
}

export async function POST(req: Request) {
  const key = req.headers.get('x-dev-key') || '';
  if (!process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || key !== process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY) {
    return unauthorized();
  }

  const { ops } = await req.json() as { ops: Op[] };
  if (!Array.isArray(ops) || ops.length === 0) {
    return NextResponse.json({ error: 'No operations' }, { status: 400 });
  }

  let log = '';
  const undoOps: UndoOp[] = [];

  for (const op of ops) {
    try {
      if (op.type === 'write') {
        if (!onlySafePath(op.path)) throw new Error('Path not allowed');
        const prev = await readFile(op.path);          // may be null if new
        await writeFile(op.path, op.content, op.message || `update ${op.path}`);
        log += `✔ write ${op.path}\n`;
        if (prev !== null) {
          // restore old content on undo
          undoOps.push({ type: 'write', path: op.path, content: prev, message: `undo: restore ${op.path}` });
        } else {
          // file didn’t exist before -> undo = delete it
          undoOps.push({ type: 'delete', path: op.path, message: `undo: remove ${op.path}` });
        }
      } else if (op.type === 'mkdir') {
        if (!onlySafePath(op.path)) throw new Error('Path not allowed');
        // We "mkdir" by committing a .gitkeep
        const clean = op.path.replace(/^\/+|\/+$/g, '');
        await mkdirp(clean);
        log += `✔ mkdir ${clean}\n`;
        // undo: remove the .gitkeep we added
        undoOps.push({ type: 'delete', path: `${clean}/.gitkeep`, message: `undo: rmdir ${clean}` });
      } else if (op.type === 'delete') {
        if (!onlySafePath(op.path)) throw new Error('Path not allowed');
        const prev = await readFile(op.path); // must exist to make a good undo
        await deletePath(op.path, op.message || `remove ${op.path}`);
        log += `✔ delete ${op.path}\n`;
        if (prev !== null) {
          // undo: restore the deleted content
          undoOps.push({ type: 'write', path: op.path, content: prev, message: `undo: restore ${op.path}` });
        }
      } else {
        log += `• skipped unknown op\n`;
      }
    } catch (e: any) {
      log += `✖ ${op.type} ${'path' in op ? op.path : ''}: ${e?.message || e}\n`;
    }
  }

  // Optional: trigger a Vercel deploy hook after changes
  let deployTriggered = false;
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (hook) {
    try {
      await fetch(hook, { method: 'POST' });
      deployTriggered = true;
      log += '↺ Triggered Vercel deploy hook.\n';
    } catch {
      log += '⚠ Failed to trigger Vercel deploy hook.\n';
    }
  }

  return NextResponse.json({ ok: true, log, undo: { ops: undoOps }, deployTriggered });
}
