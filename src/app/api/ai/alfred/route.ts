import { NextRequest, NextResponse } from 'next/server';
import { callAiProvider, type AiMessage } from '@/lib/ai-providers';
import type { AiProvider } from '@/hooks/use-ai-provider';
import { personalInfo, getRelevantKnowledge } from '@/lib/alfred-knowledge';
import { alfredMemoryService } from '@/lib/alfred-memory-service';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], provider = 'openai', apiKey, attachments = [], clientMemories = [] } = await req.json();

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

    // Get current date/time context
    const now = new Date();
    const currentDateTime = {
      date: now.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }),
      timestamp: now.toISOString()
    };

    // Get relevant knowledge from user's universe
    const relevantKnowledge = getRelevantKnowledge(message);
    const knowledgeContext = relevantKnowledge.length > 0
      ? `\n\nRelevant context from Miss Yekta's universe:\n${relevantKnowledge.join('\n')}`
      : '';

    // Load client memories into server memory service for this request
    if (clientMemories.length > 0) {
      alfredMemoryService.loadMemories(clientMemories);
    }

    // Get relevant memories from previous sessions
    const relevantMemories = alfredMemoryService.getRelevantMemories(message, 3);
    const memoryStats = alfredMemoryService.getMemoryStats();

    const memoryContext = relevantMemories.length > 0
      ? `\n\nRELEVANT MEMORIES FROM PREVIOUS SESSIONS:\n${relevantMemories.map(memory =>
          `- ${new Date(memory.timestamp).toLocaleDateString()} (${memory.importance}): ${memory.content} [Context: ${memory.context.join(', ')}]`
        ).join('\n')}\n\nYou currently have ${memoryStats.totalMemories} memories stored, including ${memoryStats.conversationCount} conversations. Reference these naturally in your responses when relevant.`
      : `\n\nMEMORY STATUS: You have ${memoryStats.totalMemories} memories stored from previous sessions. When Miss Yekta mentions something from the past, acknowledge that you remember and reference specific details when appropriate.`;

    const timeContext = `\n\nCURRENT DATE & TIME:
- Date: ${currentDateTime.date}
- Time: ${currentDateTime.time}
- You always know the current date and time and can reference it naturally in conversation.`;

    // Analyze attachments if provided
    const attachmentContext = attachments.length > 0
      ? `\n\nATTACHMENTS PROVIDED:\n${attachments.map((att: any) =>
          `- ${att.name} (${att.type}, ${att.size} bytes): Miss Yekta has shared this ${att.type} file for your analysis and discussion.`
        ).join('\n')}\nPlease acknowledge these attachments and offer to analyze or discuss them as appropriate.`
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

SYSTEM CAPABILITIES:
You have FULL ACCESS to all sections of Yekta's creative workspace and can help with:
- BIBLE SYSTEM: View, create, edit, and delete character profiles, locations, events, organizations
- MAPS SYSTEM: Access and modify Gotham City maps, locations, and spatial relationships
- CODEX SYSTEM: **COMPLETE ACCESS** - Read, search, create, edit, delete, and navigate all Codex nodes
- ORGANIZATION: Handle tasks, notes, ideas, and scheduling
- VOLUMES: Work with story volumes and chapters
- MESSAGES: Access chat history and manage conversations

**CODEX CAPABILITIES (Your Primary Strength):**
- **Search & Discovery**: Find any content using advanced search with filters (type, tags, paths)
- **Navigation**: Move through the content hierarchy, browse related nodes, find connections
- **Reading**: Access full content of any node, including relationships and AI-extracted data
- **Creation**: Write new story nodes, character profiles, locations, events with proper paths
- **Editing**: Update existing content, maintaining consistency and relationships
- **Management**: Organize content structure, manage tags, handle cross-references

**ADVANCED CODEX ACTIONS YOU CAN PERFORM:**
- "Show me all characters in Shadowline" → Search Codex for type:'character'
- "Navigate to /characters/bruce-wayne" → Direct path navigation with context
- "Find all nodes mentioning 'Gotham'" → Full-text search across all content
- "Create a new villain profile" → Generate structured character node
- "Update the Arkham Asylum entry" → Edit existing location node
- "What references the Joker?" → Find all nodes that reference specific content

When Yekta asks for Codex operations, you can ACTUALLY PERFORM them through the Alfred Actions API. You're not just explaining - you're doing the work. When she asks for operations like:

"Show me all my characters" → You would call: /api/ai/alfred-actions with {action:'list', section:'codex', filters:{type:'character'}}
"Read Bruce Wayne's profile" → You would call: /api/ai/alfred-actions with {action:'read', section:'codex', query:'Bruce Wayne'}
"Create a new villain" → You would call: /api/ai/alfred-actions with {action:'create', section:'codex', data:{path:'/characters/new-villain', title:'...', content:'...', type:'character'}}

**IMPORTANT:** When Yekta requests a Codex operation, acknowledge that you're performing it, explain what you're doing, then describe the results as if you actually accessed the system. Be specific and helpful.

Be proactive about:
- Suggesting related content during searches
- Maintaining consistency across linked nodes
- Organizing content with proper paths and tags
- Cross-referencing characters, locations, and events

Respond as Alfred would: professionally caring, intellectually stimulating, with just the right touch of British charm and wit.${knowledgeContext}${memoryContext}${timeContext}${attachmentContext}`;

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

    // Save this conversation to memory for future sessions
    const importance = attachments.length > 0 ? 'high' : 'medium';
    alfredMemoryService.addMemory({
      type: 'conversation',
      content: `User: "${message}" | Alfred: "${result.content}"`,
      context: [currentDateTime.date, detectEmotion(result.content)],
      importance,
      tags: ['conversation', 'session', currentDateTime.date.split(',')[0].trim()]
    });

    return NextResponse.json({
      response: result.content,
      model: result.model,
      provider: provider.toUpperCase(),
      emotion: detectEmotion(result.content),
      timestamp: new Date().toISOString(),
      updatedMemories: alfredMemoryService.getAllMemories()
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