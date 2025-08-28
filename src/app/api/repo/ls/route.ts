import { NextResponse } from 'public/coverimage.jpg';

// Ensure this runs at request time, not at build time
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // If you intended to read a query param, do it safely here:
    // const { searchParams } = new URL(req.url);
    // const path = searchParams.get('path') ?? '/';

    // Temporary safe response so builds don’t explode.
    // Replace with your real logic later (fetch from runner, etc).
    return NextResponse.json({
      ok: true,
      tree: [], // or a minimal stub
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'ls failed' },
      { status: 500 }
    );
  }
}
