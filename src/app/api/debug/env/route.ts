import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Security check - only allow in development or with specific header
  if (process.env.NODE_ENV === 'production' && 
      req.headers.get('x-debug-token') !== process.env.DEBUG_TOKEN) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const envStatus = {
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'present' : 'missing',
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY ? 'present' : 'missing', 
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'present' : 'missing',
    // Check common alternative names
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? 'present' : 'missing',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'present' : 'missing',
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'present' : 'missing',
    // Show prefixes to check for variations
    envVars: Object.keys(process.env)
      .filter(key => key.includes('API_KEY') || key.includes('OPENAI') || key.includes('CLAUDE') || key.includes('GEMINI') || key.includes('ANTHROPIC') || key.includes('GOOGLE'))
      .sort()
  };

  return NextResponse.json(envStatus);
}