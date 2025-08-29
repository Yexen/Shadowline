import { NextRequest, NextResponse } from 'next/server';
import type { NewsArticle } from "@/hooks/use-readlist";
import { getIntel } from '@/lib/intel';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '9');
    
    const news: NewsArticle[] = await getIntel({ limit });
    
    return NextResponse.json({ 
      news, 
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (e: any) {
    console.error("News fetching error:", e);
    return NextResponse.json({ 
      error: "Failed to load news feed.",
      news: []
    }, { status: 500 });
  }
}