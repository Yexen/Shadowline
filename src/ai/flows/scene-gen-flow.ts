export type SceneGenInput = { prompt: string; context?: string };
export type SceneGenOutput = { text: string };

export async function generateScene(_: SceneGenInput): Promise<SceneGenOutput> {
  return { text: '🔒 Scene generator AI is temporarily disabled on this build.' };
}

export const sceneGenFlow = generateScene;
export default generateScene;
