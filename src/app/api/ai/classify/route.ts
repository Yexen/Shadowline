import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content, instructions, fileName } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing content to classify' }, { status: 400 });
    }

    // Use server-side API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    // Build classification prompt
    const systemPrompt = `You are an AI that classifies content for a Batman story project. You must classify content as either:

1. "bible" - World-building content like character profiles, location descriptions, gadgets, lore, reference material
2. "volumes" - Story content like chapters, scenes, narratives, plot outlines, dialogue

For Bible content, suggest a section like: Characters, Locations, Gadgets, Organizations, Timeline, Lore
For Volume content, suggest a target volume name if mentioned in instructions.

Respond with ONLY valid JSON in this format:
{
  "category": "bible" | "volumes",
  "confidence": 0-100,
  "reasoning": "explanation",
  "suggestedSection": "section name for bible content",
  "targetVolume": "volume name for story content",
  "suggestedTags": ["tag1", "tag2"],
  "parsedContent": {
    "title": "extracted or suggested title",
    "fields": [{"label": "field name", "value": "field content"}],
    "sections": [{"title": "section title", "content": "section content"}]
  }
}`;

    const userPrompt = `Classify this content:

FILENAME: ${fileName || 'Unknown'}

CONTENT:
${content}

${instructions ? `\nUSER INSTRUCTIONS: ${instructions}` : ''}

Remember to respond with ONLY the JSON object, no other text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, error);
      return NextResponse.json({ 
        error: 'AI classification failed' 
      }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json({ error: 'No classification response' }, { status: 500 });
    }

    try {
      const classification = JSON.parse(aiResponse);
      
      // Validate the response structure
      if (!classification.category || !['bible', 'volumes'].includes(classification.category)) {
        throw new Error('Invalid category in classification');
      }

      return NextResponse.json(classification);
    } catch (parseError) {
      console.error('Failed to parse AI classification:', parseError);
      return NextResponse.json({ 
        error: 'Invalid AI response format' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Classification API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}