export type ImageGenInput = { prompt: string };
export type ImageGenOutput = { url?: string; note: string };

export async function generateImage(_: ImageGenInput): Promise<ImageGenOutput> {
  return { note: '🔒 Image generation is temporarily disabled on this build.' };
}
export const imageGenFlow = generateImage;
export default generateImage;
