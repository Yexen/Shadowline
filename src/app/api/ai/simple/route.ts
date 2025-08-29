import { NextRequest, NextResponse } from 'next/server';
import { callAiProvider, type AiMessage } from '@/lib/ai-providers';
import type { AiProvider } from '@/hooks/use-ai-provider';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { mode, provider = 'openai', apiKey, ...params } = await req.json();
    
    if (!mode) {
      return NextResponse.json({ error: 'Missing mode parameter' }, { status: 400 });
    }

    // Get effective API key (local or server environment)
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

    let messages: AiMessage[] = [];
    let temperature = 0.7;

    switch (mode) {
      case 'oracle':
        const { question } = params;
        if (!question) {
          return NextResponse.json({ error: 'Missing question for oracle mode' }, { status: 400 });
        }
        messages = [
          { role: 'system', content: 'You are The Oracle of Gotham, a mystical AI assistant with deep knowledge of Batman lore and storytelling. Be helpful, insightful, and slightly mysterious in your responses. Keep answers concise but thorough.' },
          { role: 'user', content: question }
        ];
        break;

      case 'chat':
        const { system, history } = params;
        if (!Array.isArray(history)) {
          return NextResponse.json({ error: 'Invalid history for chat mode' }, { status: 400 });
        }
        messages = [
          { role: 'system', content: system || 'You are a helpful AI assistant.' },
          ...history.map((msg: any) => ({
            role: msg.role === 'model' ? 'assistant' : msg.role,
            content: msg.content
          }))
        ];
        break;

      case 'summary':
        const { text, length = 'short' } = params;
        if (!text) {
          return NextResponse.json({ error: 'Missing text for summary mode' }, { status: 400 });
        }
        const lengthInstruction = {
          short: 'in 1-2 sentences',
          medium: 'in a short paragraph',
          long: 'in 2-3 paragraphs'
        }[length] || 'concisely';
        
        messages = [
          { role: 'system', content: `You are an expert at summarizing content. Provide clear, accurate summaries ${lengthInstruction}.` },
          { role: 'user', content: `Please summarize the following text: ${text}` }
        ];
        break;

      case 'scene':
        const { prompt, context } = params;
        if (!prompt) {
          return NextResponse.json({ error: 'Missing prompt for scene mode' }, { status: 400 });
        }
        const contextText = context ? `\n\nContext: ${context}` : '';
        messages = [
          { role: 'system', content: 'You are a skilled creative writer specializing in dramatic scenes. Write vivid, engaging prose with strong dialogue and atmospheric descriptions. Focus on showing rather than telling.' },
          { role: 'user', content: `Write a scene based on this prompt: ${prompt}${contextText}` }
        ];
        temperature = 0.8; // More creative for scene generation
        break;

      case 'image':
        const { imagePrompt } = params;
        if (!imagePrompt) {
          return NextResponse.json({ error: 'Missing imagePrompt for image mode' }, { status: 400 });
        }
        // For now, only OpenAI supports image generation via DALL-E
        if (provider !== 'openai') {
          return NextResponse.json({ 
            error: 'Image generation is currently only supported with OpenAI (DALL-E)' 
          }, { status: 400 });
        }
        
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
          }),
        });

        if (!imageResponse.ok) {
          const error = await imageResponse.json().catch(() => ({}));
          return NextResponse.json({ 
            error: `Image generation failed: ${error.error?.message || 'Unknown error'}` 
          }, { status: 500 });
        }

        const imageData = await imageResponse.json();
        return NextResponse.json({ 
          url: imageData.data?.[0]?.url,
          model: 'dall-e-3',
          provider: 'OPENAI'
        });

      default:
        return NextResponse.json({ error: `Unknown mode: ${mode}` }, { status: 400 });
    }

    // Make AI call for text-based modes
    const result = await callAiProvider(provider as AiProvider, effectiveApiKey, messages, temperature);
    
    // Return response based on mode
    switch (mode) {
      case 'oracle':
        return NextResponse.json({ 
          answer: result.content,
          model: result.model,
          provider: provider.toUpperCase()
        });
      case 'chat':
        return NextResponse.json({ 
          reply: result.content,
          model: result.model,
          provider: provider.toUpperCase()
        });
      case 'summary':
        return NextResponse.json({ 
          summary: result.content,
          model: result.model,
          provider: provider.toUpperCase()
        });
      case 'scene':
        return NextResponse.json({ 
          text: result.content,
          model: result.model,
          provider: provider.toUpperCase()
        });
    }

  } catch (error: any) {
    console.error('AI Simple API error:', error);
    return NextResponse.json({ 
      error: `AI Error: ${error.message}` 
    }, { status: 500 });
  }
}