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
