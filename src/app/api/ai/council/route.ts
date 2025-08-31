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
    const { messages, temperature = 0.7, mode = 'collaborative' } = await req.json();

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

    // Check if all required API keys are available (try common variations)
    const openaiKey = process.env.OPENAI_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!openaiKey || !claudeKey || !geminiKey) {
      return NextResponse.json({ 
        error: 'Council Chamber unavailable - missing AI service credentials',
        details: {
          openai: !!openaiKey,
          claude: !!claudeKey,
          gemini: !!geminiKey
        },
        debug: {
          openaiChecked: ['OPENAI_API_KEY'],
          claudeChecked: ['CLAUDE_API_KEY', 'ANTHROPIC_API_KEY'],
          geminiChecked: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'],
          foundKeys: {
            openai: process.env.OPENAI_API_KEY ? 'OPENAI_API_KEY' : 'none',
            claude: process.env.CLAUDE_API_KEY ? 'CLAUDE_API_KEY' : process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY' : 'none',
            gemini: process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY' : process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'GOOGLE_GENERATIVE_AI_API_KEY' : 'none'
          }
        }
      }, { status: 503 });
    }

    if (mode === 'discussion') {
      // Interactive discussion mode - sequential responses that build on each other
      return await handleInteractiveDiscussion(openaiKey, claudeKey, geminiKey, messages, temperature);
    } else {
      // Original collaborative mode - parallel responses
      return await handleCollaborativeMode(openaiKey, claudeKey, geminiKey, messages, temperature);
    }

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

async function handleCollaborativeMode(
  openaiKey: string,
  claudeKey: string, 
  geminiKey: string,
  messages: AiMessage[],
  temperature: number
) {
  // Original parallel processing mode
  const [openaiResult, claudeResult, geminiResult] = await Promise.allSettled([
    callOpenAI(openaiKey, messages, temperature),
    callClaude(claudeKey, messages, temperature),
    callGemini(geminiKey, messages, temperature),
  ]);

  const responses: AiResponse[] = [];
  
  if (openaiResult.status === 'fulfilled') {
    responses.push({ ...openaiResult.value, model: 'OpenAI: ' + openaiResult.value.model });
  }
  
  if (claudeResult.status === 'fulfilled') {
    responses.push({ ...claudeResult.value, model: 'Claude: ' + claudeResult.value.model });
  }
  
  if (geminiResult.status === 'fulfilled') {
    responses.push({ ...geminiResult.value, model: 'Gemini: ' + geminiResult.value.model });
  }

  if (responses.length === 0) {
    throw new Error('All AI services failed to respond');
  }

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
}

async function handleInteractiveDiscussion(
  openaiKey: string,
  claudeKey: string,
  geminiKey: string, 
  messages: AiMessage[],
  temperature: number
) {
  const discussionResponses: Array<{
    participant: string;
    content: string;
    model: string;
    tokensUsed?: number;
  }> = [];

  let conversationHistory = [...messages];

  // Always try all three AIs in sequence, even if one fails
  const aiParticipants = [
    {
      name: 'Claude',
      call: () => callClaude(claudeKey, [
        {
          role: 'system' as const,
          content: `You are Claude, speaking first in a Council Chamber discussion. Establish an analytical foundation that GPT-4 and Gemini can build upon. Be thoughtful and structured, but leave openings for others to expand on your ideas.`
        },
        ...conversationHistory
      ], temperature),
      systemPrompt: 'You are Claude, speaking first in a Council Chamber discussion. Establish an analytical foundation that GPT-4 and Gemini can build upon.'
    },
    {
      name: 'GPT-4',
      call: () => callOpenAI(openaiKey, [
        {
          role: 'system' as const,
          content: `You are GPT-4, speaking second in a Council Chamber discussion. Claude has spoken first. Build upon, complement, or respectfully challenge Claude's points while adding your own insights. Gemini will speak after you.`
        },
        ...conversationHistory
      ], temperature),
      systemPrompt: 'You are GPT-4, speaking second. Build upon or challenge Claude\'s points.'
    },
    {
      name: 'Gemini',
      call: () => callGemini(geminiKey, [
        {
          role: 'system' as const,
          content: `You are Gemini, speaking last in a Council Chamber discussion. You've heard from Claude and GPT-4. Synthesize their points, highlight agreements/disagreements, and provide additional perspectives they may have missed.`
        },
        ...conversationHistory
      ], temperature),
      systemPrompt: 'You are Gemini, speaking last. Synthesize and add unique perspectives.'
    }
  ];

  // Call each AI in sequence, continuing even if one fails
  for (const participant of aiParticipants) {
    try {
      console.log(`Calling ${participant.name}...`);
      const response = await participant.call();
      
      discussionResponses.push({
        participant: participant.name,
        content: response.content,
        model: response.model,
        tokensUsed: response.tokensUsed
      });

      // Add this AI's response to conversation history for next AI
      conversationHistory.push({
        role: 'assistant',
        content: `**${participant.name}:** ${response.content}`
      });
      
      console.log(`${participant.name} responded successfully`);
      
    } catch (error) {
      console.error(`${participant.name} failed:`, error);
      
      // Add a fallback response so the conversation can continue
      discussionResponses.push({
        participant: participant.name,
        content: `*${participant.name} is currently unavailable and could not participate in this discussion.*`,
        model: 'Error',
        tokensUsed: 0
      });
      
      // Add error to conversation history so next AI knows this one failed
      conversationHistory.push({
        role: 'assistant',
        content: `**${participant.name}:** *Unable to respond at this time*`
      });
    }
  }

  // Return results even if some AIs failed
  return NextResponse.json({
    mode: 'discussion',
    participants: discussionResponses,
    totalTokens: discussionResponses.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
    discussionSummary: `Interactive discussion with ${discussionResponses.filter(r => r.model !== 'Error').length}/${discussionResponses.length} participants responding`
  });
}