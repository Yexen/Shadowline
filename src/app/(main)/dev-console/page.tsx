'use client';

import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Paperclip, Undo2, Send, Search, FileText, Folder,
  ChevronRight, ChevronDown, Play, GitCommitVertical, X,
  Database, Activity, Settings, Save, Trash2, GitCommit, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiProvider } from '@/hooks/use-ai-provider';
import { EnhancedTerminal, EnhancedTerminalHandle } from '@/components/dev-console/enhanced-terminal';
import { MonacoCodeEditor } from '@/components/dev-console/monaco-editor';
import { useToast } from '@/hooks/use-toast';

// API endpoints
const API = {
  ls: '/api/repo/ls',
  tree: '/api/repo/tree',
  read: '/api/repo/read',
  write: '/api/repo/write',
  preview: '/api/repo/preview',
  commit: '/api/repo/commit',
  chatUpload: '/api/ai/chat',
  devchat: '/api/ai/devchat',
};

// Types
type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string; ts: number };
type ChatThread = { id: string; title: string; messages: ChatMsg[] };
const LS_THREADS_KEY = 'devconsole_threads_v1';
const LS_ACTIVE_THREAD = 'devconsole_active_thread_v1';

interface SuggestedAction {
  type: 'file' | 'command' | 'code';
  label: string;
  path?: string;
  content?: string;
  description?: string;
}

type FsItem = { name: string; path: string; type: 'dir' | 'file'; children?: FsItem[] };

// Helpers
const uid = (p='id') => `${p}_${Math.random().toString(36).slice(2,10)}`;
const loadThreads = (): ChatThread[] => {
  try { return JSON.parse(localStorage.getItem(LS_THREADS_KEY) || '[]'); } catch { return []; }
};
const saveThreads = (t: ChatThread[]) => localStorage.setItem(LS_THREADS_KEY, JSON.stringify(t));

// Build tree from paths
function buildTree(paths: string[]): FsItem[] {
  const root: Record<string, any> = {};
  (paths || []).forEach((p) => {
    if (!p || typeof p !== 'string') return;
    const segs = p.replace(/^\/+/, '').split('/').filter(Boolean);
    let cur = root;
    segs.forEach((seg, i) => {
      cur[seg] = cur[seg] || { __children: {}, __file: false };
      if (i === segs.length - 1) cur[seg].__file = true;
      cur = cur[seg].__children;
    });
  });

  const toItems = (node: Record<string, any>, base = ''): FsItem[] =>
    Object.keys(node || {}).sort((a,b)=>a.localeCompare(b)).map((name) => {
      const n = node[name] || {};
      const hasKids = n.__children && Object.keys(n.__children).length > 0;
      const full = base ? `${base}/${name}` : name;
      if (n.__file && !hasKids) return { name, path: `/${full}`, type: 'file' };
      return {
        name,
        path: `/${full}`,
        type: 'dir',
        children: toItems(n.__children || {}, full),
      };
    });

  return [{
    name: process.env.NEXT_PUBLIC_REPO_NAME || 'repo',
    path: '/',
    type: 'dir',
    children: toItems(root),
  }];
}

export default function EnhancedDevConsolePage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'chat'|'editor'|'terminal'|'system'>('terminal');
  const { selectedProvider, getCurrentApiKey } = useAiProvider();
  const { toast } = useToast();
  const terminalRef = useRef<EnhancedTerminalHandle>(null);

  // Preview panel
  const [preview, setPreview] = useState('');
  const [previewOpen, setPreviewOpen] = useState(true);

  // Chat
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [draft, setDraft] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [contextMemory, setContextMemory] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Editor
  const [openPath, setOpenPath] = useState('');
  const [openContent, setOpenContent] = useState('');
  const [openSha, setOpenSha] = useState<string | undefined>(undefined);
  const [unsaved, setUnsaved] = useState(false);
  const [busyEditor, setBusyEditor] = useState(false);

  // System monitoring
  const [systemStats, setSystemStats] = useState({
    cpu: '23.4%',
    memory: '2.1GB / 16GB (13%)',
    uptime: '42 days, 13 hours',
    activeConnections: 15,
    lastDeployment: new Date().toISOString()
  });

  // File Explorer
  const [tree, setTree] = useState<FsItem[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '/': true });

  // Boot: chats
  useEffect(() => {
    const t = loadThreads();
    if (t.length === 0) {
      const first = { id: uid('thread'), title: 'New chat', messages: [] } as ChatThread;
      setThreads([first]); setActiveThreadId(first.id);
      saveThreads([first]); localStorage.setItem(LS_ACTIVE_THREAD, first.id);
    } else {
      setThreads(t);
      const saved = localStorage.getItem(LS_ACTIVE_THREAD);
      const id = saved && t.some(x=>x.id===saved) ? saved : t[0].id;
      setActiveThreadId(id); localStorage.setItem(LS_ACTIVE_THREAD, id);
    }
  }, []);
  useEffect(() => { chatScrollRef.current?.scrollTo({ top: 9e9 }); }, [threads, activeThreadId]);

  // Boot: file tree
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch(API.tree, { cache: 'no-store' });
        if (!res.ok) throw new Error(`tree HTTP ${res.status}`);
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        const files: string[] = Array.isArray(data?.files) ? data.files : [];
        if (!stop) {
          setTree(buildTree(files));
          setPreview(`✅ Loaded ${files.length} files from GitHub repository`); 
          setPreviewOpen(true);
        }
      } catch (e:any) {
        if (!stop) {
          setTree([{ name: 'error (tree)', path: '/', type: 'dir', children: [] }]);
          setPreview(`⚠️ Could not load file tree: ${e?.message ?? e}`); 
          setPreviewOpen(true);
        }
      }
    })();
    return () => { stop = true; };
  }, []);

  const activeThread = threads.find(t => t.id === activeThreadId)!;

  // Extract suggested actions from AI responses
  const extractSuggestedActions = (response: string): SuggestedAction[] => {
    const actions: SuggestedAction[] = [];
    
    // Extract file paths
    const fileMatches = response.match(/`([^`]+\.(ts|tsx|js|jsx|css|json|md|py|html|xml|yaml|yml))`/g);
    if (fileMatches) {
      fileMatches.forEach(match => {
        const path = match.replace(/`/g, '');
        actions.push({
          type: 'file',
          label: `Open ${path}`,
          path: path,
          description: `Open file ${path}`
        });
      });
    }
    
    // Extract code blocks
    const codeMatches = response.match(/```[\s\S]*?```/g);
    if (codeMatches) {
      codeMatches.forEach((match, index) => {
        actions.push({
          type: 'code',
          label: `Apply Code Block ${index + 1}`,
          content: match.replace(/```[^\n]*\n?|```/g, ''),
          description: `Apply suggested code changes`
        });
      });
    }

    // Extract terminal commands
    const terminalMatches = response.match(/`([^`]*(?:npm|git|yarn|pnpm|node|python|pip|docker|curl|wget|mkdir|cp|mv|rm|ls|cd|chmod|chown|cat|grep|find|sed|awk)\s[^`]*)`/g);
    if (terminalMatches) {
      terminalMatches.forEach(match => {
        const command = match.replace(/`/g, '');
        actions.push({
          type: 'command',
          label: `Run: ${command.substring(0, 30)}...`,
          content: command,
          description: `Execute terminal command`
        });
      });
    }
    
    return actions;
  };

  // Chat actions
  const newThread = () => {
    const t = { id: uid('thread'), title: 'New chat', messages: [] } as ChatThread;
    const next = [t, ...threads]; setThreads(next); saveThreads(next);
    setActiveThreadId(t.id); localStorage.setItem(LS_ACTIVE_THREAD, t.id);
  };

  const sendChat = async (text: string) => {
    if (!text.trim() || !activeThread) return;
    setSending(true);

    const user: ChatMsg = { role: 'user', content: text.trim(), ts: Date.now() };
    const optimistic = threads.map(t =>
      t.id === activeThread.id ? { ...t, messages: [...t.messages, user] } : t
    );
    setThreads(optimistic); saveThreads(optimistic); setDraft('');
    
    // Add to context memory
    setContextMemory(prev => [...prev, text.trim()].slice(-10));

    try {
      let aiReply = '';

      if (pendingFiles.length > 0) {
        let fileContents = '';
        for (const file of pendingFiles) {
          if (file.type.startsWith('text/') || file.name.match(/\.(js|ts|tsx|jsx|css|html|json|md)$/i)) {
            try {
              const content = await file.text();
              fileContents += `\n\n--- File: ${file.name} ---\n${content}`;
            } catch (e) {
              fileContents += `\n\n--- File: ${file.name} (could not read) ---`;
            }
          } else {
            fileContents += `\n\n--- File: ${file.name} (binary file, ${file.size} bytes) ---`;
          }
        }
        
        const r = await fetch(API.devchat, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `${text.trim()}\n\nAttached files:${fileContents}`,
            context: openPath ? { openPath, openContent } : undefined,
            provider: selectedProvider,
            apiKey: getCurrentApiKey(),
          }),
        });
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({}));
          throw new Error(`AI Chat Error: ${errorData.error || `HTTP ${r.status}`}`);
        }
        const jd = await r.json();
        aiReply = jd.reply ?? '(no reply)';
        setPendingFiles([]);
      } else {
        const r = await fetch(API.devchat, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            context: openPath ? { openPath, openContent } : undefined,
            provider: selectedProvider,
            apiKey: getCurrentApiKey(),
          }),
        });
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({}));
          throw new Error(`AI Chat Error: ${errorData.error || `HTTP ${r.status}`}`);
        }
        const jd = await r.json();
        aiReply = jd.reply ?? '(no reply)';
      }

      const ai: ChatMsg = { role: 'assistant', content: aiReply, ts: Date.now()+1 };
      const next = threads.map(t => t.id===activeThread.id ? { ...t, messages:[...t.messages, ai] } : t);
      setThreads(next); saveThreads(next);
      
      // Extract suggested actions from AI response
      const actions = extractSuggestedActions(aiReply);
      setSuggestedActions(actions);
    } catch (e:any) {
      const aiErr: ChatMsg = { role: 'assistant', content:`⚠️ Chat failed: ${e?.message ?? e}`, ts: Date.now()+1 };
      const next = threads.map(t => t.id===activeThread.id ? { ...t, messages:[...t.messages, aiErr] } : t);
      setThreads(next); saveThreads(next);
    } finally {
      setSending(false);
    }
  };

  const undoLast = () => {
    if (!activeThread) return;
    const msgs = [...activeThread.messages]; if (!msgs.length) return;
    const nextThread = { ...activeThread, messages: msgs.slice(0, -1) };
    const next = threads.map(t => t.id===activeThread.id ? nextThread : t);
    setThreads(next); saveThreads(next);
  };

  const attachFiles = (fl: FileList | null) => {
    if (!fl?.length) return;
    setPendingFiles(prev => [...prev, ...Array.from(fl)]);
  };
  const removePending = (idx: number) => setPendingFiles(prev => prev.filter((_, i) => i !== idx));

  // Action handlers for suggested actions
  const handleApplyAction = async (action: SuggestedAction) => {
    try {
      if (action.type === 'file' && action.path) {
        await openFile(action.path);
        toast({ title: "File Opened", description: `Opened ${action.path}` });
      } else if (action.type === 'code' && action.content) {
        await navigator.clipboard.writeText(action.content);
        toast({ title: "Code Copied", description: "Code copied to clipboard" });
      } else if (action.type === 'command' && action.content) {
        if (terminalRef.current) {
          // Switch to terminal tab and execute command
          setActiveTab('terminal');
          setTimeout(() => {
            terminalRef.current?.executeCommand(action.content || '');
          }, 100);
          toast({ title: "Command Executed", description: `Running: ${action.content}` });
        } else {
          await navigator.clipboard.writeText(action.content);
          toast({ title: "Command Copied", description: "Command copied to clipboard" });
        }
      }
    } catch (error) {
      toast({ title: "Action Failed", description: "Could not apply action", variant: "destructive" });
    }
  };

  const handleSaveSession = () => {
    if (!activeThread || activeThread.messages.length < 2) return;
    const sessionName = activeThread.messages[0].content.substring(0, 40) + '...';
    // Update thread title
    const updatedThread = { ...activeThread, title: sessionName };
    const next = threads.map(t => t.id === activeThread.id ? updatedThread : t);
    setThreads(next);
    saveThreads(next);
    toast({ title: "Session Saved", description: "Chat session updated" });
  };

  const handleDismiss = () => {
    setSuggestedActions([]);
    setContextMemory([]);
    toast({ title: "Session Cleared", description: "Context and actions cleared" });
  };

  const handleCommitChat = () => {
    commitChanges();
    toast({ title: "Commit Initiated", description: "Starting commit process..." });
  };

  const handleDeployChat = () => {
    toast({ title: "Deploy", description: "Deploy functionality to be implemented" });
  };

  // Editor actions
  const openFile = async (p: string) => {
    if (!p) return;
    setActiveTab('editor');
    setBusyEditor(true);
    try {
      const res = await fetch(API.read, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p }),
      });
      if (!res.ok) throw new Error(`read HTTP ${res.status}`);
      const json = await res.json();
      setOpenPath(json.path || p);
      setOpenContent(json.content ?? '');
      setOpenSha(json.sha);
      setUnsaved(false);
      setPreview(`Opened ${json.path || p}`); setPreviewOpen(true);
    } catch (e:any) {
      setPreview(`⚠️ Open failed: ${e?.message ?? e}`); setPreviewOpen(true);
    } finally {
      setBusyEditor(false);
    }
  };

  const saveFile = async () => {
    if (!openPath) return;
    setBusyEditor(true);
    try {
      const res = await fetch(API.write, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: openPath,
          content: openContent,
          sha: openSha,
          message: `dev-console: update ${openPath}`,
        }),
      });
      if (!res.ok) throw new Error(`write HTTP ${res.status}`);
      const json = await res.json();
      setUnsaved(false);
      if (json.sha) setOpenSha(json.sha);
      setPreview(`✅ Saved ${json.path || openPath}`); setPreviewOpen(true);
    } catch (e:any) {
      setPreview(`❌ Save failed: ${e?.message ?? e}`); setPreviewOpen(true);
    } finally {
      setBusyEditor(false);
    }
  };

  const execPreview = async () => {
    setBusyEditor(true);
    try {
      const res = await fetch(API.preview, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: openPath || null,
          content: openPath ? openContent : null,
        }),
      });
      if (!res.ok) throw new Error(`preview HTTP ${res.status}`);
      const json = await res.json();
      setPreview(json.output || '(no preview output)'); setPreviewOpen(true);
    } catch (e:any) {
      setPreview(`⚠️ Preview failed: ${e?.message ?? e}`); setPreviewOpen(true);
    } finally {
      setBusyEditor(false);
    }
  };

  const commitChanges = async () => {
    setBusyEditor(true);
    try {
      const res = await fetch(API.commit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `BatConsole commit ${new Date().toISOString()}` }),
      });
      if (!res.ok) throw new Error(`commit HTTP ${res.status}`);
      const json = await res.json();
      setPreview(json.result || 'Committed.'); setPreviewOpen(true);
    } catch (e:any) {
      setPreview(`⚠️ Commit failed: ${e?.message ?? e}`); setPreviewOpen(true);
    } finally {
      setBusyEditor(false);
    }
  };

  // Enhanced Terminal Handler
  const runTerm = async (cmd: string): Promise<string> => {
    if (!cmd.trim()) return '';
    
    const args = cmd.trim().split(/\s+/);
    const command = args[0].toLowerCase();
    
    let output = '';
    
    try {
      switch (command) {
        case 'help':
          output = `🦇 Bat Computer Enhanced CLI v2.0 Commands:
• help - Show this help
• ls [path] - List files
• cat <file> - Show file contents  
• pwd - Show current directory
• whoami - Show current user
• date - Show current date/time
• clear - Clear terminal
• echo <text> - Print text
• tree - Show file tree
• ps - List processes (demo)
• top - Show system info
• git <command> - Git commands
• npm <command> - NPM commands
• build - Build the project
• deploy - Deploy the project
• status - Show system status
• database - Database info (migrated to Vercel)`;
          break;
          
        case 'ls':
          const path = args[1] || '/';
          try {
            if (path === '/' || path === '') {
              const res = await fetch(API.tree);
              if (!res.ok) throw new Error(`ls: ${res.status}`);
              const data = await res.json();
              if (data.error) throw new Error(data.error);
              const files = data.files || [];
              const rootFiles = files.filter((f: string) => !f.includes('/'));
              const rootDirs = Array.from(new Set(files
                .filter((f: string) => f.includes('/'))
                .map((f: string) => f.split('/')[0])
              ));
              output = [
                ...rootDirs.map((d: string) => `📁 ${d}/`),
                ...rootFiles.map((f: string) => `📄 ${f}`)
              ].join('\n') || 'No files found';
            } else {
              const res = await fetch(`${API.ls}?path=${encodeURIComponent(path)}`);
              if (!res.ok) throw new Error(`ls: ${res.status}`);
              const data = await res.json();
              if (data.error) throw new Error(data.error);
              const files = data.tree || [];
              output = files.length 
                ? files.map((f: any) => `${f.type === 'dir' ? '📁' : '📄'} ${f.name}`).join('\n')
                : 'No files found';
            }
          } catch (e: any) {
            output = `ls: error - ${e.message}`;
          }
          break;
          
        case 'cat':
          if (!args[1]) {
            output = 'cat: missing file argument';
            break;
          }
          try {
            const res = await fetch(API.read, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: args[1] })
            });
            if (!res.ok) throw new Error(`cat: ${res.status}`);
            const data = await res.json();
            output = data.content || '(empty file)';
          } catch (e: any) {
            output = `cat: ${args[1]}: ${e.message}`;
          }
          break;
          
        case 'pwd':
          output = process.env.NEXT_PUBLIC_REPO_NAME ? `/${process.env.NEXT_PUBLIC_REPO_NAME}` : '/shadowline';
          break;
          
        case 'whoami':
          output = 'batman';
          break;
          
        case 'date':
          output = new Date().toString();
          break;
          
        case 'clear':
          if (terminalRef.current) {
            terminalRef.current.clear();
          }
          return 'Terminal cleared.';
          
        case 'echo':
          output = args.slice(1).join(' ');
          break;
          
        case 'tree':
          if (tree) {
            const buildTreeString = (nodes: FsItem[], depth = 0): string => {
              return nodes.map(node => {
                const indent = '  '.repeat(depth);
                const icon = node.type === 'dir' ? '📁' : '📄';
                let result = `${indent}${icon} ${node.name}`;
                if (node.children?.length) {
                  result += '\n' + buildTreeString(node.children, depth + 1);
                }
                return result;
              }).join('\n');
            };
            output = buildTreeString(tree);
          } else {
            output = 'tree: file tree not loaded';
          }
          break;
          
        case 'status':
          output = `🦇 Bat Computer System Status:
CPU: ${systemStats.cpu}
Memory: ${systemStats.memory}
Uptime: ${systemStats.uptime}
Active Connections: ${systemStats.activeConnections}
Last Deployment: ${new Date(systemStats.lastDeployment).toLocaleString()}
Status: 🟢 All systems operational`;
          break;
          
        case 'database':
          output = 'Database functionality has been migrated to Vercel Postgres. Use the system tab for monitoring.';
          break;
          
        case 'build':
          output = `🔨 Building Shadowline...
✓ Compiling TypeScript
✓ Bundling assets  
✓ Optimizing images
✓ Generating pages
✅ Build completed successfully!`;
          break;
          
        case 'deploy':
          output = `🚀 Deploying to Gotham Cloud...
✓ Building application
✓ Uploading assets
✓ Updating DNS
✓ Deployment complete
🌐 Live at: https://shadowline.wayne-enterprises.com`;
          break;
          
        default:
          output = `bash: ${command}: command not found
Type 'help' to see available commands`;
      }
      
      return output;
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 pb-10">
      <div className="grid grid-cols-12 gap-4 mt-6">
        {/* Main */}
        <div className="col-span-12 lg:col-span-9">
          <div className="rounded border border-white/10 bg-neutral-950/60">
            {/* Header: tabs + search */}
            <div className="flex flex-col gap-2 border-b border-white/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as any)}>
                  <TabsList className="bg-black/40">
                    <TabsTrigger value="chat" className="data-[state=active]:border data-[state=active]:border-amber-500 data-[state=active]:text-amber-400">
                      AI Chat
                    </TabsTrigger>
                    <TabsTrigger value="editor" className="data-[state=active]:border data-[state=active]:border-amber-500 data-[state=active]:text-amber-400">
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="data-[state=active]:border data-[state=active]:border-amber-500 data-[state=active]:text-amber-400">
                      Terminal
                    </TabsTrigger>
                    <TabsTrigger value="system" className="data-[state=active]:border data-[state=active]:border-amber-500 data-[state=active]:text-amber-400">
                      <Activity className="w-4 h-4 mr-1" />
                      System
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="relative w-full max-w-xl">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60" />
                  <Input
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    placeholder="Search files, commands, or past chats…"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-0">
              <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as any)}>
                {/* Chat */}
                <TabsContent value="chat" className="p-0 m-0">
                  <div className="grid grid-cols-12">
                    <div className="col-span-12 lg:col-span-8 border-r border-white/10">
                      <div ref={chatScrollRef} className="h-[450px] overflow-auto p-3 space-y-3">
                        {activeThread?.messages.length
                          ? activeThread.messages.map((m,i)=>(
                              <div key={i} className="text-sm leading-6">
                                <span className="opacity-60 mr-2">
                                  {m.role === 'user' ? 'You' : m.role === 'assistant' ? 'AI' : 'System'}:
                                </span>
                                <span className={m.role==='assistant' ? 'text-amber-300/90' : ''}>{m.content}</span>
                              </div>
                            ))
                          : <div className="p-3 text-sm opacity-70">Start a conversation. I can help with code edits, terminal commands, and Firebase management.</div>}
                      </div>

                      {/* Attachment chips */}
                      {!!pendingFiles.length && (
                        <div className="border-t border-white/10 px-2 pt-2 flex flex-wrap gap-2">
                          {pendingFiles.map((f, i)=>(
                            <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-amber-500/50 text-amber-300">
                              {f.name}
                              <button onClick={()=>removePending(i)} className="opacity-70 hover:opacity-100">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-white/10 p-2 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <span>AI Provider: {selectedProvider.toUpperCase()}</span>
                            {contextMemory.length > 0 && (
                              <span className="text-amber-400">
                                Context: {contextMemory.length} topics remembered
                              </span>
                            )}
                          </div>
                          <span>{getCurrentApiKey() ? '🟢 Connected' : '🔴 Not configured'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" className="text-amber-400 hover:text-amber-300" onClick={()=>fileInputRef.current?.click()} title="Attach files">
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e)=>attachFiles(e.target.files)} />
                          <Button variant="ghost" className="text-amber-400 hover:text-amber-300" onClick={undoLast} title="Undo last">
                            <Undo2 className="h-4 w-4" />
                          </Button>
                          <Input
                            value={draft}
                            onChange={(e)=>setDraft(e.target.value)}
                            onKeyDown={(e)=>e.key==='Enter' && !sending && sendChat(draft)}
                            placeholder="Ask the Bat Computer to modify the app…"
                            className="flex-1"
                          />
                          <Button onClick={()=>sendChat(draft)} disabled={sending || !draft.trim()}>
                            <Send className="h-4 w-4 mr-1" /> {sending ? 'Sending…' : 'Send'}
                          </Button>
                        </div>
                        {activeThread?.messages.length > 1 && (
                          <div className="flex gap-2 mt-2 justify-between">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={handleSaveSession}>
                                <Save className="h-3 w-3 mr-1"/> Save
                              </Button>
                              <Button variant="destructive" size="sm" onClick={handleDismiss}>
                                <Trash2 className="h-3 w-3 mr-1"/> Clear
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="secondary" size="sm" onClick={handleCommitChat}>
                                <GitCommit className="h-3 w-3 mr-1"/> Commit
                              </Button>
                              <Button variant="default" size="sm" onClick={handleDeployChat}>
                                <Upload className="h-3 w-3 mr-1"/> Deploy
                              </Button>
                            </div>
                          </div>
                        )}
                        {suggestedActions.length > 0 && (
                          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p className="text-sm font-medium mb-2 text-amber-400">Suggested Actions:</p>
                            <div className="flex flex-wrap gap-2">
                              {suggestedActions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApplyAction(action)}
                                  className="text-xs border-amber-500/30 text-amber-300 hover:text-amber-200 hover:border-amber-500/50"
                                >
                                  {action.type === 'file' && <FileText className="mr-1 h-3 w-3" />}
                                  {action.type === 'code' && <Play className="mr-1 h-3 w-3" />}
                                  {action.type === 'command' && <GitCommitVertical className="mr-1 h-3 w-3" />}
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Threads */}
                    <div className="col-span-12 lg:col-span-4">
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs uppercase tracking-wide opacity-70">Threads</div>
                          <Button size="sm" variant="outline" onClick={newThread}>New</Button>
                        </div>
                        <div className="space-y-1 max-h-[420px] overflow-auto">
                          {threads.map(t=>(
                            <button
                              key={t.id}
                              onClick={()=>{ setActiveThreadId(t.id); localStorage.setItem(LS_ACTIVE_THREAD, t.id); }}
                              className={cn(
                                'w-full text-left px-2 py-1 rounded border border-transparent hover:border-white/10',
                                activeThreadId===t.id && 'border-amber-500/70 text-amber-300'
                              )}
                            >
                              <div className="text-sm">{t.title}</div>
                              <div className="text-[11px] opacity-60">{t.messages.length} message{t.messages.length===1?'':'s'}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Editor */}
                <TabsContent value="editor" className="p-0 m-0">
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Input value={openPath} onChange={(e)=>setOpenPath(e.target.value)} placeholder="Type a path (e.g., /src/app/page.tsx) or open from the tree…" />
                      <Button variant="outline" onClick={()=>openFile(openPath)} disabled={!openPath || busyEditor}>
                        Open
                      </Button>
                    </div>
                    <MonacoCodeEditor
                      value={openContent}
                      onChange={(value) => { setOpenContent(value); setUnsaved(true); }}
                      path={openPath}
                      onSave={saveFile}
                      onPreview={execPreview}
                      onCommit={commitChanges}
                      unsaved={unsaved}
                      busy={busyEditor}
                      height="450px"
                    />
                  </div>
                </TabsContent>

                {/* Terminal */}
                <TabsContent value="terminal" className="p-0 m-0">
                  <div className="p-3">
                    <EnhancedTerminal
                      ref={terminalRef}
                      onCommand={runTerm}
                      height="h-[480px]"
                    />
                  </div>
                </TabsContent>


                {/* System */}
                <TabsContent value="system" className="p-0 m-0">
                  <div className="p-3 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-black/40 border border-white/10 rounded p-4 text-center">
                        <div className="text-2xl font-bold text-amber-400">{systemStats.cpu}</div>
                        <div className="text-sm text-gray-400">CPU Usage</div>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded p-4 text-center">
                        <div className="text-lg font-bold text-blue-400">{systemStats.memory}</div>
                        <div className="text-sm text-gray-400">Memory</div>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded p-4 text-center">
                        <div className="text-lg font-bold text-green-400">{systemStats.uptime}</div>
                        <div className="text-sm text-gray-400">Uptime</div>
                      </div>
                      <div className="bg-black/40 border border-white/10 rounded p-4 text-center">
                        <div className="text-2xl font-bold text-purple-400">{systemStats.activeConnections}</div>
                        <div className="text-sm text-gray-400">Connections</div>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 border border-white/10 rounded p-4">
                      <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        System Configuration
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Environment</div>
                          <div className="text-white">{process.env.NODE_ENV || 'development'}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Version</div>
                          <div className="text-white">Shadowline v2.0.0</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Last Deployment</div>
                          <div className="text-white">{new Date(systemStats.lastDeployment).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Build Status</div>
                          <div className="text-green-400">✓ Healthy</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview */}
            <Separator className="bg-white/10" />
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide opacity-70">Preview</div>
                <Button variant="ghost" size="sm" onClick={()=>setPreviewOpen(v=>!v)}>{previewOpen ? 'Hide' : 'Show'}</Button>
              </div>
              {previewOpen && (
                <div className="mt-2 rounded border border-white/10 bg-black/40 min-h-[120px] p-3 text-sm">
                  {preview || <span className="opacity-60">Nothing to preview yet.</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded border border-amber-500/40 bg-black/40">
            <div className="px-3 py-2 text-xs font-semibold tracking-wider text-amber-400">FILE EXPLORER</div>
            <Separator className="bg-amber-500/30" />
            <div className="p-2 max-h-[520px] overflow-auto text-sm">
              <ExplorerTree
                nodes={tree ?? []}
                expanded={expanded}
                onToggle={(p)=>setExpanded(e=>({ ...e, [p]: !e[p] }))}
                onOpenFile={(p)=>openFile(p)}
              />
            </div>
          </div>

          <div className="rounded border border-amber-500/40 bg-black/40">
            <div className="px-3 py-2 text-xs font-semibold tracking-wider text-amber-400">SYSTEM MONITOR</div>
            <Separator className="bg-amber-500/30" />
            <div className="p-3 font-mono text-xs space-y-1 text-amber-200/80">
              <div className="flex items-center justify-between">
                <span>› System Status</span>
                <span className="text-green-400">● ONLINE</span>
              </div>
              <div>› CPU: {systemStats.cpu}</div>
              <div>› Memory: {systemStats.memory.split(' ')[0]}</div>
              <div>› Uptime: {systemStats.uptime}</div>
              <div>› Connections: {systemStats.activeConnections}</div>
              <div>› Last Deploy: {new Date(systemStats.lastDeployment).toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Explorer Tree Component
function ExplorerTree({
  nodes, expanded, onToggle, onOpenFile, depth = 0,
}: {
  nodes: FsItem[];
  expanded: Record<string, boolean>;
  onToggle: (path: string) => void;
  onOpenFile: (path: string) => void;
  depth?: number;
}) {
  if (!nodes?.length) {
    return <div className="text-xs opacity-60 px-3 py-2">No files yet. Loading file tree...</div>;
  }
  return (
    <div className="space-y-1">
      {nodes.map((n) => {
        const isDir = n.type === 'dir';
        const isOpen = !!expanded[n.path];
        return (
          <div key={n.path}>
            <button
              onClick={()=> isDir ? onToggle(n.path) : onOpenFile(n.path)}
              className={cn('w-full flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5', !isDir && 'text-amber-200/90')}
              style={{ paddingLeft: depth * 14 + 8 }}
              title={n.path}
            >
              {isDir ? (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <FileText className="h-4 w-4" />}
              {isDir ? <Folder className="h-4 w-4 opacity-70" /> : null}
              <span className="truncate">{n.name}</span>
            </button>
            {isDir && isOpen && n.children?.length ? (
              <ExplorerTree nodes={n.children} expanded={expanded} onToggle={onToggle} onOpenFile={onOpenFile} depth={depth+1} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}