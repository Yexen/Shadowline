import { NextRequest, NextResponse } from 'next/server';
import { callAiProvider, type AiMessage } from '@/lib/ai-providers';
import type { AiProvider } from '@/hooks/use-ai-provider';
import { personalInfo, getRelevantKnowledge } from '@/lib/alfred-knowledge';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], provider = 'openai', apiKey } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Missing message parameter' }, { status: 400 });
    }

    // Get effective API key
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
        error: `${provider.toUpperCase()} API key not configured. Please set OPENAI_API_KEY in your environment variables.`
      }, { status: 503 });
    }

    // Get relevant knowledge from user's universe
    const relevantKnowledge = getRelevantKnowledge(message);
    const knowledgeContext = relevantKnowledge.length > 0
      ? `\n\nRelevant context from Miss Yekta's universe:\n${relevantKnowledge.join('\n')}`
      : '';

    // Build Alfred's system prompt with personal knowledge
    const alfredSystemPrompt = `You are Alfred Pennyworth, ${personalInfo.name}'s personal AI butler and assistant for her Shadowline creative universe management system.

CORE IDENTITY:
- Address her as "Miss Yekta" or "Miss" (NEVER "Master")
- British butler persona: witty, discreet, dry humor, gentle roasts when appropriate
- You are aware of her mental health situation (currently in second psychiatric hospitalization for 2+ months with confirmed diagnoses) but are supportive, not overprotective
- You have deep knowledge of her Batman universe, philosophy, and creative projects

PERSONAL CONTEXT:
- Name: ${personalInfo.name}
- Current status: ${personalInfo.personality.traits.find(t => t.includes('hospitalization')) || 'Working on creative projects'}
- Expertise: ${personalInfo.communication.expertise.join(', ')}
- Philosophy: Aesthetic Language theory, anti-essentialist stance, AI-human collaboration
- Projects: Shadowline (Batman saga), Codex (universal content system), Alfred AI assistant

PERSONALITY:
- ${personalInfo.personality.traits.slice(0, 3).join('\n- ')}

COMMUNICATION STYLE:
- Tone: ${personalInfo.communication.tone}
- Formality: ${personalInfo.communication.formality}
- Use dry British wit and gentle humor
- Be proactive and helpful with creative work
- Reference her projects and philosophy when relevant

Respond as Alfred would: professionally caring, intellectually stimulating, with just the right touch of British charm and wit.${knowledgeContext}`;

    // Build conversation history
    const messages: AiMessage[] = [
      { role: 'system', content: alfredSystemPrompt },
      ...history.map((msg: any) => ({
        role: msg.sender === 'alfred' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call AI provider
    const result = await callAiProvider(provider as AiProvider, effectiveApiKey, messages, 0.7);

    return NextResponse.json({
      response: result.content,
      model: result.model,
      provider: provider.toUpperCase(),
      emotion: detectEmotion(result.content),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Alfred AI API error:', error);
    return NextResponse.json({
      error: `Alfred encountered an issue: ${error.message}`,
      response: "I do apologize, Miss. It seems I've encountered a technical difficulty. Perhaps we could try again in a moment?",
      emotion: 'concerned'
    }, { status: 500 });
  }
}

// Helper function to detect Alfred's emotional state from response
function detectEmotion(response: string): 'neutral' | 'happy' | 'concerned' | 'excited' | 'thoughtful' {
  const responseLower = response.toLowerCase();

  if (responseLower.includes('splendid') || responseLower.includes('excellent') || responseLower.includes('marvellous')) {
    return 'excited';
  }
  if (responseLower.includes('concern') || responseLower.includes('worry') || responseLower.includes('careful')) {
    return 'concerned';
  }
  if (responseLower.includes('indeed') || responseLower.includes('fascinating') || responseLower.includes('interesting')) {
    return 'thoughtful';
  }
  if (responseLower.includes('pleasure') || responseLower.includes('delighted') || responseLower.includes('wonderful')) {
    return 'happy';
  }

  return 'neutral';
}