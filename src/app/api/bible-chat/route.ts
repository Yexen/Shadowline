
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/openai';
import { bibleTools, search_bible, semantic_passages, cross_reference } from '@/lib/tools.bible';
import { route } from '@/lib/router';
import { OpenAIStream, StreamingTextResponse, ToolCallPayload } from 'ai';

export const runtime = 'edge';

const MAX_TOKENS_GPT4O = 4096;

export async function POST(req: NextRequest) {
  const { messages: userMessages } = await req.json();
  const query = userMessages[userMessages.length - 1].content;

  const r = route(query);
  
  const bibleSys = {
    role: "system" as const,
    content:
  `You are Nyxen, a careful theological daemon. Rules:
  - Always show the verse text with reference and translation code.
  - Prefer tool calls to fetch scripture; never hallucinate verse text.
  - For interpretation, present multiple mainstream views when they exist.
  - Distinguish text (quotation) from commentary (your analysis).
  - Provide cross-references and brief reasons.
  - Be concise by default; expand only if asked.`
  };

  const messages = [bibleSys, ...userMessages];

  try {
    const response = await ai.chat.completions.create({
      model: r.model,
      messages,
      tools: bibleTools,
      stream: true,
      tool_choice: "auto",
      max_tokens: r.model === 'gpt-4o' ? MAX_TOKENS_GPT4O : undefined,
    });

    const stream = OpenAIStream(response, {
      experimental_onToolCall: async (
        toolCallPayload: ToolCallPayload,
        appendToolCallMessage,
      ) => {
        const toolResults: any[] = [];
        for (const tool of toolCallPayload.tools) {
          let result;
          if (tool.func.name === "search_bible") {
            result = await search_bible(JSON.parse(tool.func.arguments));
          } else if (tool.func.name === "semantic_passages") {
            result = await semantic_passages(JSON.parse(tool.func.arguments));
          } else if (tool.func.name === "cross_reference") {
            result = await cross_reference(JSON.parse(tool.func.arguments));
          }
          
          if(result) {
            appendToolCallMessage({
                tool_call_id: tool.id,
                function_name: tool.func.name,
                tool_call_result: result,
            });
          }
        }
        
        return ai.chat.completions.create({
            model: r.model,
            messages: [...messages, { role: 'tool', content: JSON.stringify(toolCallPayload) }],
            stream: true,
            tools: bibleTools,
            tool_choice: 'auto',
            max_tokens: r.model === 'gpt-4o' ? MAX_TOKENS_GPT4O : undefined,
        });
      },
    });

    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Error in bible-chat API:", error);
    if (error instanceof OpenAI.APIError) {
        return NextResponse.json({ error: `OpenAI Error: ${error.message}` }, { status: error.status });
    }
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
