import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    // Validate input
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages must be an array' }, { status: 400 });
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        return NextResponse.json({ 
          error: 'Invalid message format. Each message needs role and content.' 
        }, { status: 400 });
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return NextResponse.json({ error: 'Invalid message role' }, { status: 400 });
      }
    }

    // Rate limiting check (basic)
    const userIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log(`Chat request from IP: ${userIP}`);

    // Content length check
    const totalContent = messages.reduce((acc: number, msg: any) => acc + msg.content.length, 0);
    if (totalContent > 50000) {
      return NextResponse.json({ 
        error: 'Total message content too large (max 50KB)' 
      }, { status: 413 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    // Build system message with context
    let systemMessage = 'You are a helpful coding assistant for a web-based code editor called Shadowline. Keep answers concise and practical. Focus on TypeScript/TSX, React, and Next.js. Help with code editing, debugging, and file management.';
    
    if (context?.currentFile) {
      systemMessage += `\n\nCurrent file: ${context.currentFile}`;
    }
    if (context?.selectedText) {
      systemMessage += `\n\nSelected text: ${context.selectedText.substring(0, 1000)}`;
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: systemMessage },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
      }),
      cache: 'no-store',
    });

    if (!r.ok) {
      const errData = await r.json().catch(() => ({}));
      console.error('OpenAI API error:', r.status, errData);
      
      if (r.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }, { status: 429 });
      }
      if (r.status === 401) {
        return NextResponse.json({ error: 'AI service authentication failed' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'AI service temporarily unavailable' 
      }, { status: 503 });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    
    if (!content) {
      return NextResponse.json({ error: 'No response from AI service' }, { status: 500 });
    }

    return NextResponse.json({ 
      content,
      model: 'gpt-4o-mini',
      tokensUsed: data.usage?.total_tokens || 0
    });
  } catch (e: any) {
    console.error('AI chat error:', e);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
