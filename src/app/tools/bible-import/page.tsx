'use client';

import { useRef, useState } from 'react';

type Field = { label: string; value: string };
type BibleItem = { title: string; fields: Field[] };
type BibleCategory = { category: string; items: BibleItem[] };

async function writeFile(path: string, content: string, message?: string) {
  const r = await fetch('/api/repo/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content, message: message || `update ${path}` }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'write failed');
  return j;
}

export default function BibleImportPage() {
  const [raw, setRaw] = useState('');
  const [doc, setDoc] = useState<BibleCategory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  function append(msg: string) {
    setLog(l => (l ? l + '\n' : '') + msg);
  }

  async function fromFile(f: File) {
    const text = await f.text();
    setRaw(text);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) await fromFile(f);
  }

  function prevent(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function structure() {
    if (!raw.trim()) {
      append('Paste text or choose a file first.');
      return;
    }
    try {
      setLoading(true);
      append('→ Sending to AI for structuring…');
      const r = await fetch('/api/ai/structure-bible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: raw }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'AI error');
      setDoc(j.doc);
      append('✓ Structured preview ready.');
    } catch (e: any) {
      append('❌ ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!doc) return append('Nothing to save.');
    try {
      setLoading(true);
      const path = 'src/data/bible.json';
      const content = JSON.stringify(doc, null, 2);
      await writeFile(path, content, 'feat(bible): import structured bible');
      append(`✓ Saved to ${path} (committed on GitHub).`);
    } catch (e: any) {
      append('❌ ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Bible Import</h1>
      <p className="opacity-70">
        Drop your document, paste text, click <b>Structure</b>, review, then <b>Save</b>.
        Output matches your app’s <code>useBible</code> format.
      </p>

      <section className="grid gap-3">
        <div
          onDrop={handleDrop}
          onDragOver={prevent}
          onDragEnter={prevent}
          className="border-2 border-dashed rounded p-6 text-center text-sm opacity-80"
        >
          Drop a .txt/.md/.rtf/.docx (docx becomes plain text) or
          <button
            className="ml-2 underline"
            onClick={() => fileRef.current?.click()}
          >choose a file</button>.
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.rtf,.doc,.docx"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await fromFile(f);
            }}
          />
        </div>

        <textarea
          className="border rounded px-3 py-2 min-h-[140px] bg-neutral-950/70 border-neutral-800"
          placeholder="…or paste bible text here"
          value={raw}
          onChange={e => setRaw(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={structure}
            disabled={loading || !raw.trim()}
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {loading ? 'Structuring…' : 'Structure with AI'}
          </button>
          <button
            onClick={save}
            disabled={loading || !doc}
            className="px-3 py-2 rounded border"
          >
            Save to GitHub
          </button>
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="font-semibold">Preview</h2>
        {!doc ? (
          <div className="text-sm opacity-70">No structured output yet.</div>
        ) : (
          <pre className="border rounded p-3 overflow-auto max-h-[50vh] bg-neutral-950 text-neutral-100 text-sm">
{JSON.stringify(doc, null, 2)}
          </pre>
        )}
      </section>

      <section className="grid gap-2">
        <h2 className="font-semibold">Log</h2>
        <pre className="border rounded p-3 min-h-[80px] bg-neutral-950 text-neutral-100 text-sm whitespace-pre-wrap">
          {log || '(empty)'}
        </pre>
      </section>
    </main>
  );
}
