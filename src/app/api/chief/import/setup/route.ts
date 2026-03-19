import { auth } from '@clerk/nextjs/server';
import { isClerkEnabled } from '@/lib/clerk';
import { ensureChiefTables } from '@/lib/chief-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  if (isClerkEnabled()) {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureChiefTables();
    return Response.json({ status: 'ok', message: 'Chief tables created successfully' });
  } catch (err: unknown) {
    return Response.json({ error: `Setup failed: ${String(err)}` }, { status: 500 });
  }
}
