import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path);
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const backendBase = process.env.DUZE_API_URL || 'http://localhost:8080';
  const path = pathSegments ? pathSegments.join('/') : '';
  const search = request.nextUrl.search || '';
  const targetUrl = `${backendBase}/api/v1/${path}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  let body: string | undefined = undefined;
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      body = await request.text();
    } catch {
      // Body may be empty
    }
  }

  try {
    const apiRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    const responseText = await apiRes.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    return NextResponse.json(responseData, { status: apiRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Duze API backend service unavailable', details: err.message },
      { status: 503 }
    );
  }
}
