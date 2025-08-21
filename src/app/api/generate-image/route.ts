import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    return NextResponse.json({ imageUrl });
    
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 401) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    if (error.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (error.status === 400) {
      return NextResponse.json({ error: 'Invalid prompt or request' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Failed to generate image' 
    }, { status: 500 });
  }
}
