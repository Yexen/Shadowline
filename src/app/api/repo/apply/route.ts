import { NextResponse } from 'next/server';
import { Op, validateOps } from '@/lib/pathPolicy';
import { writeFile, deletePath, mkdirp } from '@/lib/github';

const DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL;

export async function POST(req: Request) {
  try {
    const { ops }:{ ops: Op[] } = await req.json();
    if (!Array.isArray(ops) || !ops.length) {
      return NextResponse.json({ error: 'No ops' }, { status: 400 });
    }

    const { fixed, errors } = validateOps(ops);
    if (errors.length) {
      return NextResponse.json({ error: `Invalid ops:\n${errors.join('\n')}` }, { status: 400 });
    }

    let log = '';
    const commits: string[] = [];

    for (const op of fixed) {
      if (op.type === 'mkdir') {
        await mkdirp(op.path);
        log += `mkdir ${op.path}\n`;
      } else if (op.type === 'write') {
        const res:any = await writeFile(op.path, op.content, op.message || `update ${op.path}`);
        commits.push(res?.commit?.sha || '');
        log += `write ${op.path} (${(op.content||'').length} bytes)\n`;
      } else if (op.type === 'delete') {
        await deletePath(op.path, op.message || `remove ${op.path}`);
        log += `delete ${op.path}\n`;
      }
    }

    // optional deploy hook
    let deployTriggered = false;
    if (DEPLOY_HOOK) {
      try {
        await fetch(DEPLOY_HOOK, { method: 'POST' });
        deployTriggered = true;
        log += 'deploy hook triggered\n';
      } catch {
        log += 'deploy hook failed (ignored)\n';
      }
    }

    return NextResponse.json({ ok: true, log, commits, deployTriggered });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'apply error' }, { status: 500 });
  }
}

