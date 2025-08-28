import http from 'http'
import { WebSocketServer } from 'ws'
import * as os from 'os'
import * as pty from 'node-pty'

const DEV_KEY = process.env.DEV_CONSOLE_KEY || ''

const server = http.createServer((_req, res) => {
  res.writeHead(200); res.end('Runner OK')
})

const wss = new WebSocketServer({ server })

wss.on('connection', (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`)
  const key = url.searchParams.get('key') || ''
  if (!DEV_KEY || key !== DEV_KEY) { ws.close(4001, 'unauthorized'); return }

  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
  const term = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 120,
    rows: 30,
    cwd: process.env.WORKDIR || process.cwd(),
    env: process.env,
  })

  term.onData(d => ws.send(JSON.stringify({ t: 'data', d })))
  term.onExit(e => ws.send(JSON.stringify({ t: 'exit', code: e.exitCode })))

  ws.on('message', (raw) => {
    try {
      const m = JSON.parse(raw.toString())
      if (m.t === 'input') term.write(m.d)
      if (m.t === 'resize') term.resize(m.cols, m.rows)
    } catch {}
  })
  ws.on('close', () => term.kill())
})

const PORT = process.env.PORT || 8080
server.listen(PORT, () => console.log(`runner listening :${PORT}`))
// server.js (runner)
// minimal express server with a /api/term that understands basic repo ops

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';

const pexec = promisify(exec);
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const KEY = process.env.DEV_CONSOLE_KEY || '';
const WORKDIR = process.env.WORKDIR || '/workspace/shadowline';

function auth(req, res, next) {
  const key = req.query.key || req.body?.key || req.headers['x-dev-key'];
  if (!KEY || key !== KEY) return res.status(401).send('Unauthorized');
  next();
}

// ---- FS TREE for the right sidebar ----
app.get('/api/fs/tree', auth, async (req, res) => {
  async function statSafe(p) {
    try { return await fs.stat(p); } catch { return null; }
  }
  async function walk(dir, base = dir) {
    const out = [];
    let entries = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const rel = '/' + path.relative(base, full).replaceAll('\\','/');
      if (e.isDirectory()) {
        out.push({ name: e.name, path: rel === '/' ? '/' : rel, type: 'dir', children: await walk(full, base) });
      } else {
        out.push({ name: e.name, path: rel, type: 'file' });
      }
    }
    return out.sort((a,b)=>a.name.localeCompare(b.name));
  }
  const st = await statSafe(WORKDIR);
  if (!st) return res.json({ tree: [{ name: path.basename(WORKDIR), path: '/', type: 'dir', children: [] }] });
  const children = await walk(WORKDIR, WORKDIR);
  res.json({ tree: [{ name: path.basename(WORKDIR), path: '/', type: 'dir', children }] });
});

// ---- EDITOR endpoints (open/save/preview/commit) ----
app.get('/api/repo/open', auth, async (req, res) => {
  const rel = req.query.path || '';
  const full = path.join(WORKDIR, '.' + rel);
  const content = await fs.readFile(full, 'utf8').catch(()=>'');
  res.json({ path: rel, content });
});

app.post('/api/repo/save', auth, async (req, res) => {
  const { path: rel, content } = req.body || {};
  const full = path.join(WORKDIR, '.' + (rel || ''));
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content ?? '', 'utf8');
  res.json({ ok: true, path: rel });
});

app.post('/api/repo/preview', auth, async (req, res) => {
  // just a placeholder; run tests or typecheck if you want
  res.json({ output: '✅ Preview ok (placeholder). Wire to your test/build step here.' });
});

app.post('/api/repo/commit', auth, async (req, res) => {
  const msg = req.body?.message || `BatConsole commit ${new Date().toISOString()}`;
  try {
    await pexec(`git add -A`, { cwd: WORKDIR });
    await pexec(`git -c user.name="BatConsole" -c user.email="dev@local" commit -m "${msg.replace(/"/g,'\\"')}"`, { cwd: WORKDIR });
    res.json({ result: 'Committed locally.' });
  } catch (e) {
    res.json({ result: `No changes to commit or git disabled. ${e?.stderr || e?.message || ''}` });
  }
});

// ---- TERMINAL: run shell OR built-ins (mkdir, rm, read, write) ----
app.post('/api/term', auth, async (req, res) => {
  let cmd = String(req.body?.cmd || '').trim();
  if (!cmd) return res.status(400).send('No command');

  // built-ins
  if (cmd === 'help') {
    return res.send([
      'Built-ins:',
      '  help                        Show this help',
      '  ls [path]                   List files',
      '  read <path>                 Print file',
      '  write <path> ---\\n<content>\\n---   Write content (use --- delimiters)',
      '  mkdir <path>                Create directory',
      '  rm <path>                   Remove file or folder (dangerous!)',
      '  build                       npm run build (project)',
      '  deploy                      (hook this to your CI/CD)',
      '',
      'Or use any shell command (npm, git, etc.)',
    ].join('\n'));
  }

  try {
    const parts = cmd.split(/\s+/);
    const head = parts[0];
    const rest = parts.slice(1);

    if (head === 'ls') {
      const p = path.join(WORKDIR, '.' + (rest[0] || '/'));
      const out = await fs.readdir(p, { withFileTypes: true }).then(d =>
        d.map(e => (e.isDirectory() ? e.name + '/' : e.name)).join('\n')
      );
      return res.send(out);
    }

    if (head === 'read') {
      const rel = rest[0];
      if (!rel) return res.status(400).send('Usage: read <path>');
      const full = path.join(WORKDIR, '.' + rel);
      const content = await fs.readFile(full, 'utf8').catch(()=>'');
      return res.send(content);
    }

    if (head === 'write') {
      // format: write <path> ---\n<content>\n---
      const rel = rest[0];
      const m = cmd.match(/---\n([\s\S]*)\n---\s*$/);
      if (!rel || !m) return res.status(400).send('Usage: write <path> ---\\n<content>\\n---');
      const full = path.join(WORKDIR, '.' + rel);
      await fs.mkdir(path.dirname(full), { recursive: true });
      await fs.writeFile(full, m[1], 'utf8');
      return res.send(`wrote ${rel}`);
    }

    if (head === 'mkdir') {
      const rel = rest[0];
      if (!rel) return res.status(400).send('Usage: mkdir <path>');
      const full = path.join(WORKDIR, '.' + rel);
      await fs.mkdir(full, { recursive: true });
      return res.send(`mkdir ${rel}`);
    }

    if (head === 'rm') {
      const rel = rest[0];
      if (!rel) return res.status(400).send('Usage: rm <path>');
      const full = path.join(WORKDIR, '.' + rel);
      await fs.rm(full, { recursive: true, force: true });
      return res.send(`rm ${rel}`);
    }

    if (head === 'build') {
      const { stdout, stderr } = await pexec('npm run build', { cwd: WORKDIR, maxBuffer: 10 * 1024 * 1024 });
      return res.send(stdout || stderr || '(no output)');
    }

    if (head === 'deploy') {
      return res.send('Hook me to your CI/CD (e.g., Vercel CLI) from the runner.');
    }

    // fallback: run as raw shell command
    const { stdout, stderr } = await pexec(cmd, { cwd: WORKDIR, maxBuffer: 10 * 1024 * 1024 });
    res.send(stdout || stderr || '(no output)');
  } catch (e) {
    res.status(500).send(e?.stderr || e?.message || String(e));
  }
});

app.get('/api/ping', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Runner listening on', PORT));
