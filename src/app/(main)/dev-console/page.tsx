'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, RotateCcw, Send, TerminalSquare, MessageSquare, FileCode2, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ---------- types ----------
type ChatMsg = { role: 'user'|'assistant'|'system'; content: string };
type Op =
  | { type: 'write'; path: string; content: string; message?: string }
  | { type: 'mkdir'; path: string; message?: string }
  | { type: 'delete'; path: string; message?: string };

type PlanResponse = {
  summary: string;
  files?: string[];
  ops: Op[];
};

type FileNode = { name: string; path: string; type: 'file'|'dir'; children?: FileNode[] };

// ---------- tiny API helper ----------
async function api<T=any>(path: string, body?: any, extraHeaders?: Record<string,string>) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body ?? {}),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || `API ${path} failed`);
  return j as T;
}

// ---------- localStorage helpers ----------
const LS_TAB = 'devconsole.tab';
const LS_CHATS = 'devconsole.chats.v1';
const LS_ACTIVE_CHAT = 'devconsole.activeChatId';

type ChatSession = { id: string; title: string; messages: ChatMsg[]; createdAt: number };

function loadChats(): ChatSession[] {
  try { return JSON.parse(localStorage.getItem(LS_CHATS) || '[]'); } catch { return []; }
}
function saveChats(chats: ChatSession[]) {
  localStorage.setItem(LS_CHATS, JSON.stringify(chats));
}

// ========================================
// PAGE
// ========================================
export default function DevConsolePage() {
  // ----- tabs -----
  const [tab, setTab] = useState<'chat'|'editor'|'terminal'>(() => (localStorage.getItem(LS_TAB) as any) || 'chat');
  useEffect(() => { localStorage.setItem(LS_TAB, tab); }, [tab]);

  // ----- live log -----
  const [log, setLog] = useState<string[]>([
    '> Initializing Bat Computer OS v3.1',
    '> File system integrity: OK.',
    '> Power levels: 98.7%',
    '> Running diagnostics on all subsystems…',
  ]);
  const pushLog = (line: string) => setLog((l) => [...l, line]);

  // ----- file explorer (right side) -----
  const [tree, setTree] = useState<FileNode[] | null>(null);
  const [rootLabel, setRootLabel] = useState('shadows-of-gotham');

  async function refreshTree() {
    try {
      const res = await api<{ entries: { name: string; path: string; type: 'file'|'dir' }[] }>('/api/repo/ls', { path: '.' });
      const nodes: FileNode[] = res.entries
        .sort((a,b) => (a.type===b.type ? a.name.localeCompare(b.name) : a.type==='dir' ? -1 : 1))
        .map(e => ({ name: e.name, path: e.path, type: e.type }));
      setTree(nodes);
      pushLog('> Repo tree loaded.');
    } catch (e:any) {
      pushLog(`> ls error: ${e.message}`);
    }
  }
  useEffect(() => { refreshTree(); }, []);

  // ----- selection / editor -----
  const [openedPath, setOpenedPath] = useState<string>('');
  const [openedContent, setOpenedContent] = useState<string>('');
  const [editorSearch, setEditorSearch] = useState('');
  const [editorDirty, setEditorDirty] = useState(false);

  async function openFile(path: string) {
    try {
      const res = await api<{ content: string }>('/api/repo/read', { path });
      setOpenedPath(path);
      setOpenedContent(res.content || '');
      setEditorDirty(false);
      setTab('editor');
      pushLog(`> opened: ${path}`);
    } catch (e:any) {
      pushLog(`> read error: ${e.message}`);
    }
  }

  async function saveOpenedFile() {
    if (!openedPath) return;
    try {
      await api('/api/repo/write', { path: openedPath, content: openedContent });
      setEditorDirty(false);
      pushLog(`> saved: ${openedPath}`);
      await refreshTree();
    } catch (e:any) {
      pushLog(`> write error: ${e.message}`);
    }
  }

  // ----- attach + undo -----
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<{ name: string; dataURL: string }[]>([]);
  const [lastPreviewOps, setLastPreviewOps] = useState<Op[] | null>(null);

  function triggerAttach() { fileInputRef.current?.click(); }
  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setAttachments((a) => [...a, { name: f.name, dataURL: String(reader.result) }]);
      reader.readAsDataURL(f);
    });
    e.currentTarget.value = '';
  }
  async function undoLastPreview() {
    if (!lastPreviewOps?.length) return;
    // naive reverse: delete->write? we can only safely revert writes / mkdir
    const reverse: Op[] = [];
    for (const op of lastPreviewOps) {
      if (op.type === 'write') { reverse.push({ type: 'delete', path: op.path, message: 'undo write' } as Op); }
      if (op.type === 'mkdir') { reverse.push({ type: 'delete', path: op.path, message: 'undo mkdir' } as Op); }
      if (op.type === 'delete') {
        // cannot reliably restore deleted content without snapshot; log a note
        pushLog(`> cannot auto-undo delete for ${op.path} (no snapshot)`);
      }
    }
    if (reverse.length) {
      await api('/api/repo/apply', { ops: reverse });
      pushLog('> undo applied.');
      setLastPreviewOps(null);
      await refreshTree();
    }
  }

  // ========================================
  // CHAT
  // ========================================
  const [chats, setChats] = useState<ChatSession[]>(() => loadChats());
  const [activeChatId, setActiveChatId] = useState<string>(() => localStorage.getItem(LS_ACTIVE_CHAT) || '');
  const activeChat = useMemo(
    () => chats.find(c => c.id === activeChatId) || chats[0],
    [chats, activeChatId]
  );
  useEffect(() => {
    if (!activeChat && chats.length) setActiveChatId(chats[0].id);
  }, [chats, activeChat]);

  function makeNewChat() {
    const id = crypto.randomUUID();
    const session: ChatSession = { id, title: 'New chat', messages: [], createdAt: Date.now() };
    const next = [session, ...chats];
    setChats(next); saveChats(next);
    setActiveChatId(id);
    localStorage.setItem(LS_ACTIVE_CHAT, id);
  }
  function renameChat(id: string, title: string) {
    const next = chats.map(c => c.id === id ? { ...c, title } : c);
    setChats(next); saveChats(next);
  }
  function deleteChat(id: string) {
    const next = chats.filter(c => c.id !== id);
    setChats(next); saveChats(next);
    if (activeChatId === id) {
      const nid = next[0]?.id || '';
      setActiveChatId(nid);
      localStorage.setItem(LS_ACTIVE_CHAT, nid);
    }
  }
  function upsertChatMessages(id: string, messages: ChatMsg[]) {
    const next = chats.map(c => c.id === id ? { ...c, messages } : c);
    setChats(next); saveChats(next);
  }

  const [chatInput, setChatInput] = useState('');
  const [chatThinking, setChatThinking] = useState(false);

  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg || !activeChat) return;
    setChatInput('');

    const withAttachSuffix = attachments.length
      ? `${msg}\n\n[attachments:${attachments.map(a => a.name).join(', ')}]`
      : msg;

    const messages = [...activeChat.messages, { role: 'user', content: withAttachSuffix }];
    upsertChatMessages(activeChat.id, messages);
    setAttachments([]);
    setChatThinking(true);

    try {
      const res = await api<{ plan?: PlanResponse; explainer?: string }>('/api/ai/devchat', { messages });
      const reply: ChatMsg = { role: 'assistant', content: res.explainer || 'I prepared a plan. Check the Editor tab.' };
      upsertChatMessages(activeChat.id, [...messages, reply]);

      if (res.plan) {
        setTab('editor');
        setSuggestedPlan(res.plan);
        pushLog('> AI proposed a plan with operations.');
      }
    } catch (e:any) {
      upsertChatMessages(activeChat.id, [...messages, { role: 'assistant', content: '❌ ' + (e?.message || 'AI error') }]);
    } finally {
      setChatThinking(false);
    }
  }

  // ========================================
  // EDITOR (suggested plan / ops)
  // ========================================
  const [suggestedPlan, setSuggestedPlan] = useState<PlanResponse | null>(null);

  async function executePreview() {
    if (!suggestedPlan?.ops?.length) return;
    try {
      const res = await api<{ log?: string; deployTriggered?: boolean }>('/api/repo/apply', { ops: suggestedPlan.ops });
      setLastPreviewOps(suggestedPlan.ops);
      pushLog('> preview executed.');
      if (res?.log) pushLog(res.log);
      await refreshTree();
    } catch (e:any) {
      pushLog(`> apply error: ${e.message}`);
    }
  }
  async function commitChanges() {
    if (!suggestedPlan?.ops?.length) return;
    try {
      const res = await api<{ log?: string; deployTriggered?: boolean }>('/api/repo/apply', { ops: suggestedPlan.ops, commit: true });
      setLastPreviewOps(null);
      pushLog('> committed.');
      if (res?.log) pushLog(res.log);
      await refreshTree();
    } catch (e:any) {
      pushLog(`> commit error: ${e.message}`);
    }
  }

  // ========================================
  // TERMINAL (very small command set)
  // ========================================
  const [termLines, setTermLines] = useState<string[]>(['Bat Computer CLI v1.0. Type "help" for commands.']);
  const [termInput, setTermInput] = useState('');

  function termPrint(line = '') { setTermLines(l => [...l, line]); }
  async function runTerm(cmdline: string) {
    const [cmd, ...rest] = cmdline.trim().split(/\s+/);
    if (!cmd) return;

    if (cmd === 'help') {
      termPrint('Commands:');
      termPrint('  ls [path]');
      termPrint('  read <path>');
      termPrint('  write <path> -- then paste, finish with a single "." line');
      termPrint('  mkdir <path>');
      termPrint('  rm <path>');
      return;
    }
    if (cmd === 'ls') {
      const p = rest[0] || '.';
      try {
        const res = await api<{ entries: { name:string; type:'file'|'dir' }[] }>('/api/repo/ls', { path: p });
        res.entries.forEach(e => termPrint(`${e.type === 'dir' ? 'dir ' : 'file'}  ${e.name}`));
      } catch (e:any) { termPrint('err: ' + e.message); }
      return;
    }
    if (cmd === 'read') {
      const p = rest.join(' ');
      if (!p) return termPrint('usage: read <path>');
      try {
        const res = await api<{ content: string }>('/api/repo/read', { path: p });
        termPrint(res.content);
      } catch (e:any) { termPrint('err: ' + e.message); }
      return;
    }
    if (cmd === 'mkdir') {
      const p = rest.join(' ');
      if (!p) return termPrint('usage: mkdir <path>');
      try { await api('/api/repo/mkdir', { path: p }); termPrint('ok'); refreshTree(); } catch (e:any) { termPrint('err: '+e.message); }
      return;
    }
    if (cmd === 'rm') {
      const p = rest.join(' ');
      if (!p) return termPrint('usage: rm <path>');
      try { await api('/api/repo/rm', { path: p }); termPrint('ok'); refreshTree(); } catch (e:any) { termPrint('err: '+e.message); }
      return;
    }
    termPrint(`unknown: ${cmd}`);
  }

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="mx-auto w-full max-w-screen-2xl px-3 md:px-6 py-6">
      {/* Title (we do NOT touch your app header) */}
      <h1 className="font-headline text-4xl tracking-[0.15em] mb-6">BAT COMPUTER</h1>

      <div className="grid grid-cols-12 gap-4">
        {/* CENTER PANEL */}
        <section className="col-span-12 lg:col-span-8 rounded-xl border border-yellow-500/20 bg-black/30 p-0">
          {/* Tabs */}
          <div className="flex items-center gap-2 justify-center py-3">
            <TabChip icon={<MessageSquare className="mr-1 h-4 w-4" />} active={tab==='chat'} onClick={()=>setTab('chat')}>AI Chat</TabChip>
            <TabChip icon={<FileCode2 className="mr-1 h-4 w-4" />} active={tab==='editor'} onClick={()=>setTab('editor')}>Editor</TabChip>
            <TabChip icon={<TerminalSquare className="mr-1 h-4 w-4" />} active={tab==='terminal'} onClick={()=>setTab('terminal')}>Terminal</TabChip>
          </div>

          {/* BODY */}
          <div className="px-4 pb-4">
            {/* CHAT */}
            {tab === 'chat' && (
              <div className="grid grid-cols-12 gap-4">
                {/* sessions */}
                <div className="col-span-4">
                  <div className="rounded-lg border border-white/10 p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs uppercase tracking-wider text-zinc-400">Conversations</div>
                      <Button size="sm" variant="outline" onClick={makeNewChat}>New</Button>
                    </div>
                    <div className="space-y-1 max-h-[46vh] overflow-auto">
                      {chats.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setActiveChatId(c.id); localStorage.setItem(LS_ACTIVE_CHAT, c.id); }}
                          className={cn(
                            'w-full text-left rounded-md px-2 py-1.5 text-sm hover:bg-white/5',
                            (activeChat?.id===c.id) && 'ring-1 ring-yellow-500/60'
                          )}
                        >
                          <div className="font-medium">{c.title}</div>
                          <div className="text-xs text-zinc-500 truncate">{new Date(c.createdAt).toLocaleString()}</div>
                        </button>
                      ))}
                      {!chats.length && <div className="text-sm text-zinc-500">No chats yet.</div>}
                    </div>
                  </div>
                </div>

                {/* messages */}
                <div className="col-span-8">
                  <div className="rounded-lg border border-white/10 p-3 h-[46vh] overflow-auto bg-black/40">
                    {activeChat?.messages?.length
                      ? activeChat.messages.map((m, i) => (
                          <div key={i} className="mb-3">
                            <div className={cn(
                              'text-xs mb-1',
                              m.role==='user' ? 'text-yellow-400' : 'text-zinc-400'
                            )}>{m.role.toUpperCase()}</div>
                            <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                          </div>
                        ))
                      : <div className="text-sm text-zinc-500">Say hi to the Bat Computer.</div>
                    }
                  </div>

                  {/* command bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={triggerAttach} title="Attach" className="rounded-md border border-yellow-500/40 px-2 py-2 text-yellow-400 hover:bg-yellow-500/10">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button onClick={undoLastPreview} title="Undo last Execute" className="rounded-md border border-yellow-500/40 px-2 py-2 text-yellow-400 hover:bg-yellow-500/10">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <div className="flex-1">
                      <Input
                        placeholder="Ask me to modify the app…"
                        value={chatInput}
                        onChange={(e)=>setChatInput(e.target.value)}
                        onKeyDown={(e)=> e.key==='Enter' && sendChat()}
                      />
                    </div>
                    <Button onClick={sendChat} disabled={chatThinking}>
                      <Send className="h-4 w-4 mr-1" /> {chatThinking ? 'Thinking…' : 'Send'}
                    </Button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onPickFiles} />
                  </div>

                  {/* show attachments */}
                  {!!attachments.length && (
                    <div className="mt-2 text-xs text-zinc-400">
                      Attaching: {attachments.map(a=>a.name).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EDITOR */}
            {tab === 'editor' && (
              <div className="grid grid-cols-12 gap-4">
                {/* plan */}
                <div className="col-span-6">
                  <div className="rounded-lg border border-white/10 p-3 h-[46vh] overflow-auto">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs uppercase tracking-wider text-zinc-400">Suggested Changes</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={executePreview}>Execute</Button>
                        <Button size="sm" onClick={commitChanges}>Commit</Button>
                      </div>
                    </div>
                    {!suggestedPlan ? (
                      <div className="text-sm text-zinc-500">Ask the AI in Chat to propose changes.</div>
                    ) : (
                      <>
                        <div className="mb-2 text-sm whitespace-pre-wrap">{suggestedPlan.summary}</div>
                        <div className="text-xs text-zinc-400 mb-1">Operations:</div>
                        <pre className="text-xs bg-black/40 rounded p-2 overflow-auto">{JSON.stringify(suggestedPlan.ops, null, 2)}</pre>
                      </>
                    )}
                  </div>
                </div>

                {/* editor */}
                <div className="col-span-6">
                  <div className="rounded-lg border border-white/10 p-3 h-[46vh] flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        placeholder="Select or type a file path…"
                        value={openedPath}
                        onChange={(e)=>setOpenedPath(e.target.value)}
                        onKeyDown={(e)=> e.key==='Enter' && openFile(openedPath)}
                      />
                      <Button variant="outline" onClick={()=> openFile(openedPath)}>Open</Button>
                      <Button onClick={saveOpenedFile} disabled={!editorDirty || !openedPath}>Save</Button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <SearchIcon className="h-4 w-4 text-zinc-500" />
                      <Input
                        placeholder="Search in file…"
                        value={editorSearch}
                        onChange={(e)=>setEditorSearch(e.target.value)}
                        className="h-8"
                      />
                    </div>

                    <textarea
                      className="flex-1 rounded-md bg-black/40 border border-white/10 p-2 text-sm font-mono leading-5"
                      value={openedContent}
                      onChange={(e)=>{ setOpenedContent(e.target.value); setEditorDirty(true); }}
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TERMINAL */}
            {tab === 'terminal' && (
              <div className="rounded-lg border border-white/10 p-3">
                <div className="h-[46vh] overflow-auto font-mono text-sm">
                  {termLines.map((l,i)=><div key={i}>{l}</div>)}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-yellow-400">›</span>
                  <Input
                    placeholder="Enter command…"
                    value={termInput}
                    onChange={(e)=>setTermInput(e.target.value)}
                    onKeyDown={async (e)=> {
                      if (e.key==='Enter') {
                        const cmd = termInput;
                        setTermInput('');
                        termPrint(`$ ${cmd}`);
                        await runTerm(cmd);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: FILE EXPLORER + LIVE LOG (yellow) */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* FILE EXPLORER (yellow) */}
          <div className="rounded-xl border border-yellow-500/25 bg-black/30">
            <div className="border-b border-yellow-500/20 px-4 py-3 text-sm font-semibold tracking-wider text-yellow-400">
              FILE EXPLORER
            </div>
            <div className="max-h-[44vh] overflow-auto px-3 py-2 text-sm">
              <div className="flex items-center gap-2 py-1 text-zinc-200">
                <span className="text-yellow-500">▸</span>
                <span className="font-medium">{rootLabel}</span>
              </div>
              {!tree ? (
                <div className="text-zinc-500 text-sm px-2 py-1">Loading…</div>
              ) : (
                <ul className="pl-5">
                  {tree.map((n) => (
                    <li key={n.path} className="py-0.5">
                      <button
                        className="text-left w-full hover:text-yellow-300"
                        onClick={() => (n.type === 'file' ? openFile(n.path) : undefined)}
                      >
                        <span className="text-zinc-400 mr-2">{n.type === 'dir' ? 'dir' : 'file'}</span>
                        <span className="text-zinc-200">{n.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* LIVE LOG (yellow) */}
          <div className="rounded-xl border border-yellow-500/25 bg-black/30">
            <div className="border-b border-yellow-500/20 px-4 py-3 text-sm font-semibold tracking-wider text-yellow-400">
              LIVE LOG
            </div>
            <div className="max-h-[28vh] overflow-auto px-4 py-3 text-xs font-mono leading-relaxed text-yellow-300">
              {log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------- tiny tab chip ----------
function TabChip({ children, active, onClick, icon }: { children: React.ReactNode; active?: boolean; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1 text-sm text-zinc-300 border border-white/10 hover:bg-white/5 flex items-center',
        active && 'border-yellow-500 text-yellow-300'
      )}
    >
      {icon}{children}
    </button>
  );
}
