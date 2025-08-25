export type ChatTurn = { role: 'user'|'assistant'; content: string };
export type ChatInput = { messages: ChatTurn[] };
export type ChatOutput = { messages: ChatTurn[] };

export async function runOracleChat(_: ChatInput): Promise<ChatOutput> {
  return {
    messages: [{ role: 'assistant', content: '🔒 Chat AI is temporarily disabled on this build.' }],
  };
}
export const oracleChatFlow = runOracleChat;
export default runOracleChat;
