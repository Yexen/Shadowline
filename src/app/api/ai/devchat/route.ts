import { NextRequest, NextResponse } from 'next/server';
import { callAiProvider, type AiMessage } from '@/lib/ai-providers';
import type { AiProvider } from '@/hooks/use-ai-provider';
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { message, context, provider = 'openai', apiKey } = await req.json();
  if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  
  // If no local API key provided, fall back to server environment variables
  let effectiveApiKey = apiKey;
  if (!effectiveApiKey) {
    switch (provider) {
      case 'openai':
        effectiveApiKey = process.env.OPENAI_API_KEY;
        break;
      case 'claude':
        effectiveApiKey = process.env.CLAUDE_API_KEY;
        break;
      case 'gemini':
        effectiveApiKey = process.env.GEMINI_API_KEY;
        break;
    }
  }
  
  if (!effectiveApiKey) {
    return NextResponse.json({ 
      error: `${provider.toUpperCase()} API key not configured. Please set it in settings or as an environment variable.` 
    }, { status: 503 });
  }

  // Always fetch the tree first so the model knows the project
  const treeRes = await fetch(new URL('/api/repo/tree', req.url), { cache: 'no-store' });
  const treeJson = await treeRes.json();
  const files: string[] = Array.isArray(treeJson?.files) ? treeJson.files : [];
  const head = files.slice(0, 500).join('\n');

  const system = [
    `You are Batcomputer, a Next.js repo assistant.`,
    `You ALWAYS read the repository tree before answering.`,
    `Propose precise diffs (path + unified patch) and short reasoning.`,
    `When asked to apply, return JSON: {"changes":[{"path":"...","patch":"---\\n+++\\n..."}]}.`,
  ].join('\n');

  const repoCtx = [
    `--- REPO TREE (first 500) ---`,
    head || '(empty)',
    `--- CURRENT FILE ---`,
    context?.openPath ? `${context.openPath}\n\n${context.openContent ?? ''}` : '(none)',
  ].join('\n');

  try {
    const messages: AiMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: `${message}\n\n${repoCtx}` },
    ];

    const result = await callAiProvider(provider as AiProvider, effectiveApiKey, messages, 0.2);
    
    return NextResponse.json({ 
      reply: result.content || '(no reply)', 
      saw: files.length,
      model: result.model,
      provider: provider.toUpperCase()
    });
  } catch (error: any) {
    console.error('AI Provider error:', error);
    return NextResponse.json({ 
      error: `AI Error: ${error.message}` 
    }, { status: 500 });
  }
}
