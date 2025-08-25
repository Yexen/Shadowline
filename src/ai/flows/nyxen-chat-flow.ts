export type NyxenInput = { prompt: string };
export type NyxenOutput = { reply: string };

export async function runNyxenChat(_: NyxenInput): Promise<NyxenOutput> {
  return { reply: '🔒 Nyxen chat is temporarily disabled on this build.' };
}
export const nyxenChatFlow = runNyxenChat;
export default runNyxenChat;
