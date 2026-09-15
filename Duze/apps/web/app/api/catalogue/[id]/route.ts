import { NextResponse } from 'next/server';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid kitchen.' }, { status: 400 });
  try {
    const response = await fetch(`${process.env.DUZE_API_URL || 'http://localhost:8080'}/api/v1/merchants/${id}/menu`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    if (!response.ok) return NextResponse.json({ error: response.status === 404 ? 'This kitchen is no longer available.' : 'The menu could not be loaded.' }, { status: response.status });
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ error: 'The menu could not be loaded. Please try again.' }, { status: 503 });
  }
}
