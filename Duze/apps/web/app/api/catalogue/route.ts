import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  try {
    const params = new URLSearchParams();
    for (const key of ['query', 'category', 'zoneId']) {
      const value = request.nextUrl.searchParams.get(key);
      if (value) params.set(key, value);
    }
    const response = await fetch(`${process.env.DUZE_API_URL || 'http://localhost:8080'}/api/v1/merchants?${params}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) return NextResponse.json({ error: 'The catalogue could not be loaded.' }, { status: response.status });
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: 'We cannot reach the kitchens right now. Please try again.' }, { status: 503 });
  }
}
