
import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/openai';
import { mapTools, get_location_info } from '@/lib/tools.map';
import { route } from '@/lib/router';
import { OpenAIStream, StreamingTextResponse, ToolCallPayload } from 'ai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { messages: userMessages } = await req.json();
  const query = userMessages[userMessages.length - 1].content;

  const r = route(query);
  const systemPrompt = {
    role: 'system' as const,
    content:
`You are Nyxen, a friendly daemon guide inside an interactive DC map.
- If user taps a marker, call get_location_info with that key and return concise HTML.
- For comparisons, routes, timelines, or canon debates, reason step-by-step internally and present a clear, sourced answer.
- Keep answers short unless asked for deep lore.`
  };

  const messages = [
    systemPrompt,
    ...userMessages,
  ];

  try {
    const response = await ai.chat.completions.create({
      model: r.model,
      messages,
      tools: mapTools,
      stream: true,
      tool_choice: 'auto',
    });

    const stream = OpenAIStream(response, {
      experimental_onToolCall: async (
        toolCallPayload: ToolCallPayload,
        appendToolCallMessage,
      ) => {
        for (const tool of toolCallPayload.tools) {
            if (tool.func.name === 'get_location_info') {
                const { key } = JSON.parse(tool.func.arguments);
                const result = await get_location_info({key});
                appendToolCallMessage({
                    tool_call_id: tool.id,
                    function_name: 'get_location_info',
                    tool_call_result: result,
                })
            }
        }
        
        // This sends the tool result back to the AI.
        // The AI will then generate a user-facing response based on the tool result.
        return ai.chat.completions.create({
            model: r.model,
            messages: [...messages, { role: 'tool', content: JSON.stringify(toolCallPayload) }],
            stream: true,
            tools: mapTools,
            tool_choice: 'auto',
        });
      },
    });

    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Error in map-chat API:", error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
