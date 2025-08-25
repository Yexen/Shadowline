'use client';

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChatBox() {
  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('shadowline_chat') : null;
    return saved ? JSON.parse(saved) as Msg[] : [{ role: 'assistant', content: 'Hi! Tell me what you want to add or fix in your app.' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('shadowline_chat', JSON.stringify(messages));
    boxRef.current?.scrollTo(0, 1e9);
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setMessages([...next, { role: 'assistant', content: j.content }]);
    } catch (e: any) {
      setMessages([...next, { role: 'assistant', content: '❌ ' + (e.message || 'Error') }]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="grid gap-3">
      <div ref={boxRef} className="rounded border border-neutral-800 bg-neutral-950/60 p-3 h-[50vh] overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-white' : 'text-neutral-300'}`}>
            <div className="text-xs opacity-60 mb-1">{m.role === 'user' ? 'You' : 'AI'}</div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}
        {loading && <div className="text-neutral-400 text-sm">…thinking…</div>}
      </div>

      <div className="grid gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Describe what you want. Example: “Add a /about page under src/app/about/page.tsx with a dark hero and two sections.”"
          className="border rounded px-3 py-2 bg-neutral-950/70 border-neutral-800 min-h-[80px]"
        />
        <div className="flex gap-2">
          <button
            onClick={send}
            disabled={loading}
            className="px-3 py-2 rounded bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Send (⌘/Ctrl + Enter)
          </button>
        </div>
      </div>
    </div>
  );
}
