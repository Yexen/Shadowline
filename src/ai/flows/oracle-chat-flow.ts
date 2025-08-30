export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };
export type OracleMode = 'shadows' | 'canon' | 'all';

import { getAiProviderSettings } from '@/lib/ai-provider-client';

const SYSTEM_PROMPTS = {
  shadows: `You are The Oracle (Gotham), connected to the Shadows of Gotham world bible. 
  You have access to detailed information about characters, locations, gadgets, and lore from this specific Batman universe.
  When answering questions, draw exclusively from the world bible data provided. 
  Be concise, helpful, and maintain the mysterious Oracle persona. 
  If information isn't in the world bible, say so clearly.`,
  
  canon: `You are The Oracle (Gotham), with comprehensive knowledge of DC Universe and Batman lore.
  Draw from canonical DC Comics, movies, TV shows, and official Batman material.
  Provide accurate information about Batman characters, storylines, continuity, and DC Universe connections.
  Be concise, helpful, and maintain the mysterious Oracle persona.
  Distinguish between different continuities when relevant (comics, movies, TV shows).`,
  
  all: `You are The Oracle (Gotham), with access to both the Shadows of Gotham world bible AND canonical DC/Batman knowledge.
  You can compare and contrast information from the world bible with official DC continuity.
  When responding, specify whether information comes from "Shadows of Gotham" or "DC Canon" or both.
  Make connections and suggest creative possibilities by combining both sources.
  Be concise, helpful, and maintain the mysterious Oracle persona.`
};

export async function runOracleChat(
  history: ChatMsg[], 
  mode: OracleMode = 'shadows',
  bibleData?: any
): Promise<string> {
  const { provider, apiKey } = getAiProviderSettings();
  
  let systemPrompt = SYSTEM_PROMPTS[mode];
  
  // For 'shadows' and 'all' modes, append bible data context
  if ((mode === 'shadows' || mode === 'all') && bibleData) {
    const bibleContext = formatBibleDataForAI(bibleData);
    systemPrompt += `\n\nCurrent World Bible Data:\n${bibleContext}`;
  }
  
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'chat',
      system: systemPrompt,
      history,
      provider,
      apiKey
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'oracle chat failed');
  return String(j.reply || '');
}

function formatBibleDataForAI(bibleData: any): string {
  if (!bibleData || !Array.isArray(bibleData)) return '';
  
  return bibleData.map((category: any) => {
    const items = category.items.map((item: any) => {
      const fields = item.fields.map((field: any) => `${field.label}: ${field.value}`).join('\n  ');
      const pages = item.pages && item.pages.length > 0 
        ? `\n  Pages: ${item.pages.map((p: any) => `${p.title}: ${p.content.substring(0, 200)}...`).join('; ')}`
        : '';
      return `- ${item.title}:\n  ${fields}${pages}`;
    }).join('\n');
    
    return `${category.category}:\n${items}`;
  }).join('\n\n');
}

