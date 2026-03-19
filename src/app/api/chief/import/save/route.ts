import { auth } from '@clerk/nextjs/server';
import { isClerkEnabled } from '@/lib/clerk';
import { ensureChiefTables, insertChiefRecords, clearChiefCollection } from '@/lib/chief-db';
import { IMPORT_SCHEMAS, type CollectionKey } from '@/lib/chief-import-schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SaveCollectionPayload {
  collection: string;
  rows: Record<string, string>[];
  replace?: boolean;
}

interface SaveRequest {
  collections: SaveCollectionPayload[];
}

export async function POST(request: Request) {
  let userId: string | null = null;
  if (isClerkEnabled()) {
    const authResult = await auth();
    userId = authResult.userId;
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SaveRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.collections || !Array.isArray(body.collections) || body.collections.length === 0) {
    return Response.json({ error: 'collections array is required' }, { status: 400 });
  }

  // Validate all collection keys before writing anything
  for (const item of body.collections) {
    if (!(item.collection in IMPORT_SCHEMAS)) {
      return Response.json(
        { error: `Unknown collection: ${item.collection}. Must be one of: ${Object.keys(IMPORT_SCHEMAS).join(', ')}` },
        { status: 400 }
      );
    }
    if (!Array.isArray(item.rows) || item.rows.length === 0) {
      return Response.json(
        { error: `Collection "${item.collection}" has no rows` },
        { status: 400 }
      );
    }
  }

  try {
    await ensureChiefTables();

    const results: { collection: string; inserted: number; replaced: boolean }[] = [];

    for (const item of body.collections) {
      if (item.replace) {
        await clearChiefCollection(item.collection);
      }
      const inserted = await insertChiefRecords(item.collection, item.rows, userId ?? undefined);
      results.push({
        collection: item.collection,
        inserted,
        replaced: !!item.replace,
      });
    }

    const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);

    return Response.json({
      status: 'ok',
      totalInserted,
      collections: results,
    });
  } catch (err: unknown) {
    return Response.json({ error: `Save failed: ${String(err)}` }, { status: 500 });
  }
}
