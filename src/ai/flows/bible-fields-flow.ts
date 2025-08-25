export type BibleFieldsInput = { text: string };
export type BibleFieldsOutput = { fields: Record<string, string> };

export async function extractBibleFields(_: BibleFieldsInput): Promise<BibleFieldsOutput> {
  return { fields: {} };
}
export const bibleFieldsFlow = extractBibleFields;
export default extractBibleFields;
