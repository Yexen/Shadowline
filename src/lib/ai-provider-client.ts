/**
 * Client-side utility to get AI provider settings from localStorage
 * This function is used by AI flows that run on the client side
 */
export function getAiProviderSettings() {
  let provider = 'openai';
  let apiKey = '';
  
  if (typeof window !== 'undefined') {
    const settings = localStorage.getItem('gotham-ai-provider-storage');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        provider = parsed.state?.selectedProvider || 'openai';
        switch (provider) {
          case 'openai':
            apiKey = parsed.state?.openAiApiKey || '';
            break;
          case 'claude':
            apiKey = parsed.state?.claudeApiKey || '';
            break;
          case 'gemini':
            apiKey = parsed.state?.geminiApiKey || '';
            break;
        }
      } catch (e) {
        console.warn('Failed to parse AI provider settings');
      }
    }
  }
  
  return { provider, apiKey };
}