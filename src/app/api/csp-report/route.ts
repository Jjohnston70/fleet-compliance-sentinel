export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractUserAgent(request: Request): string {
  return request.headers.get('user-agent')?.slice(0, 512) ?? 'unknown';
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.warn('[csp-report]', {
      userAgent: extractUserAgent(request),
      report: payload?.['csp-report'] ?? payload,
    });
  } catch (error) {
    console.warn('[csp-report] failed to parse payload', error);
  }

  return new Response(null, { status: 204 });
}
