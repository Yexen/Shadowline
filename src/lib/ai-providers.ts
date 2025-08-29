import type { AiProvider } from '@/hooks/use-ai-provider';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiResponse {
  content: string;
  model: string;
  tokensUsed?: number;
}

export async function callAiProvider(
  provider: AiProvider,
  apiKey: string,
  messages: AiMessage[],
  temperature: number = 0.2
): Promise<AiResponse> {
  if (!apiKey) {
    throw new Error(`API key not configured for ${provider.toUpperCase()}`);
  }

  switch (provider) {
    case 'openai':
      return await callOpenAI(apiKey, messages, temperature);
    case 'claude':
      return await callClaude(apiKey, messages, temperature);
    case 'gemini':
      return await callGemini(apiKey, messages, temperature);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
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