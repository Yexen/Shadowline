export type OracleInput = { question: string; context?: string };
export type OracleOutput = { answer: string };

export async function runOracleFlow(_: OracleInput): Promise<OracleOutput> {
  return { answer: '🔒 Oracle AI is temporarily disabled on this build.' };
}
export const oracleFlow = runOracleFlow;
export default runOracleFlow;
