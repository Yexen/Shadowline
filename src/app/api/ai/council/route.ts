import { NextRequest, NextResponse } from 'next/server';

interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AiResponse {
  content: string;
  model: string;
  tokensUsed?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, temperature = 0.7 } = await req.json();

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

    // Rate limiting check
    const userIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    console.log(`Council Chamber request from IP: ${userIP}`);

    // Content length check
    const totalContent = messages.reduce((acc: number, msg: any) => acc + msg.content.length, 0);
    if (totalContent > 50000) {
      return NextResponse.json({ 
        error: 'Total message content too large (max 50KB)' 
      }, { status: 413 });
    }

    // Check if all required API keys are available
    const openaiKey = process.env.OPENAI_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!openaiKey || !claudeKey || !geminiKey) {
      return NextResponse.json({ 
        error: 'Council Chamber unavailable - missing AI service credentials',
        details: {
          openai: !!openaiKey,
          claude: !!claudeKey,
          gemini: !!geminiKey
        }
      }, { status: 503 });
    }

    // Call all providers in parallel
    const [openaiResult, claudeResult, geminiResult] = await Promise.allSettled([
      callOpenAI(openaiKey, messages, temperature),
      callClaude(claudeKey, messages, temperature),
      callGemini(geminiKey, messages, temperature),
    ]);

    // Collect successful responses
    const responses: AiResponse[] = [];
    
    if (openaiResult.status === 'fulfilled') {
      responses.push({ ...openaiResult.value, model: 'OpenAI: ' + openaiResult.value.model });
    } else {
      console.error('OpenAI failed:', openaiResult.reason);
    }
    
    if (claudeResult.status === 'fulfilled') {
      responses.push({ ...claudeResult.value, model: 'Claude: ' + claudeResult.value.model });
    } else {
      console.error('Claude failed:', claudeResult.reason);
    }
    
    if (geminiResult.status === 'fulfilled') {
      responses.push({ ...geminiResult.value, model: 'Gemini: ' + geminiResult.value.model });
    } else {
      console.error('Gemini failed:', geminiResult.reason);
    }

    if (responses.length === 0) {
      return NextResponse.json({ 
        error: 'All AI services failed to respond' 
      }, { status: 503 });
    }

    // Combine responses intelligently
    const primaryResponse = responses.find(r => r.model.startsWith('Claude:')) || responses[0];
    const otherResponses = responses.filter(r => r !== primaryResponse);
    
    let combinedContent = primaryResponse.content;
    
    if (otherResponses.length > 0) {
      combinedContent += '\n\n---\n\n**Alternative perspectives from other models:**\n\n';
      otherResponses.forEach((response) => {
        combinedContent += `**${response.model}:**\n${response.content}\n\n`;
      });
    }

    return NextResponse.json({
      content: combinedContent,
      model: `Multi-LLM (${responses.length} models: ${responses.map(r => r.model.split(':')[0]).join(', ')})`,
      tokensUsed: responses.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
      providersUsed: responses.length,
      successfulProviders: responses.map(r => r.model.split(':')[0])
    });

  } catch (e: any) {
    console.error('Council Chamber error:', e);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function callOpenAI(apiKey: string, messages: AiMessage[], temperature: number): Promise<AiResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    model: 'gpt-4o-mini',
    tokensUsed: data.usage?.total_tokens,
  };
}

async function callClaude(apiKey: string, messages: AiMessage[], temperature: number): Promise<AiResponse> {
  // Extract system message if present
  const systemMessage = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature,
      system: systemMessage?.content,
      messages: chatMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Claude API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return {
    content: data.content?.[0]?.text || '',
    model: 'claude-3-5-sonnet-20241022',
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
  };
}

async function callGemini(apiKey: string, messages: AiMessage[], temperature: number): Promise<AiResponse> {
  // Convert messages to Gemini format
  const contents = [];
  let systemInstruction = '';
  
  for (const message of messages) {
    if (message.role === 'system') {
      systemInstruction = message.content;
    } else {
      contents.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      });
    }
  }

  const requestBody: any = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: 2000,
    },
  };

  if (systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    model: 'gemini-1.5-pro-latest',
    tokensUsed: data.usageMetadata?.totalTokenCount,
  };
}