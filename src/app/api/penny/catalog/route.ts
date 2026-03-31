import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';
import { canAccessPenny, canBypassPennyRoleByEmail, resolvePennyRole } from '@/lib/penny-access';

const PENNY_API_URL = process.env.PENNY_API_URL || 'http://localhost:8000';
const PENNY_API_KEY = process.env.PENNY_API_KEY || '';

// All CFR parts available in the local knowledge base at /knowledge/cfr-docs/.
// This serves as a fallback catalog when the Railway backend knowledge store is empty.
const LOCAL_CFR_KNOWLEDGE = [
  { title: 'Part 40 - Drug and Alcohol Testing', source: 'cfr/Part-040-Drug-Alcohol-Testing', category: 'CFR Parts' },
  { title: 'Part 360 - Fees for Motor Carrier Registration', source: 'cfr/Part-360-Fees-Registration', category: 'CFR Parts' },
  { title: 'Part 365 - Rules Governing Applications', source: 'cfr/Part-365-Applications', category: 'CFR Parts' },
  { title: 'Part 380 - Special Training Requirements', source: 'cfr/Part-380-Training-Requirements', category: 'CFR Parts' },
  { title: 'Part 382 - Controlled Substance and Alcohol Testing', source: 'cfr/Part-382-Controlled-Substance-Testing', category: 'CFR Parts' },
  { title: 'Part 383 - Commercial Driver License Standards', source: 'cfr/Part-383-CDL-Standards', category: 'CFR Parts' },
  { title: 'Part 384 - State Compliance with CDL Program', source: 'cfr/Part-384-State-CDL-Compliance', category: 'CFR Parts' },
  { title: 'Part 385 - Safety Fitness Procedures', source: 'cfr/Part-385-Safety-Fitness', category: 'CFR Parts' },
  { title: 'Part 386 - Rules of Practice for FMCSA Proceedings', source: 'cfr/Part-386-FMCSA-Proceedings', category: 'CFR Parts' },
  { title: 'Part 390 - Federal Motor Carrier Safety Regulations (General)', source: 'cfr/Part-390-General-Regulations', category: 'CFR Parts' },
  { title: 'Part 391 - Qualifications of Drivers', source: 'cfr/Part-391-Driver-Qualifications', category: 'CFR Parts' },
  { title: 'Part 395 - Hours of Service of Drivers', source: 'cfr/Part-395-Hours-Of-Service', category: 'CFR Parts' },
  { title: 'Part 396 - Inspection, Repair, and Maintenance', source: 'cfr/Part-396-Inspection-Maintenance', category: 'CFR Parts' },
  { title: 'Part 397 - Transportation of Hazardous Materials', source: 'cfr/Part-397-Hazmat-Transportation', category: 'CFR Parts' },
];

function buildLocalCatalogResponse() {
  const categories = [{ name: 'CFR Parts', count: LOCAL_CFR_KNOWLEDGE.length }];
  return {
    documents: LOCAL_CFR_KNOWLEDGE,
    categories,
    knowledge_docs: LOCAL_CFR_KNOWLEDGE.length,
    source: 'local-cfr-index',
  };
}

export async function GET(request: NextRequest) {
  const hasClerk = isClerkEnabled();
  if (!hasClerk) {
    return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
  }

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  const role = resolvePennyRole(sessionClaims, user);
  const hasEmailBypass = canBypassPennyRoleByEmail(user);
  if (!canAccessPenny(role) && !hasEmailBypass) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = Number(searchParams.get('limit') || '120');
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 300)) : 120;

  try {
    const res = await fetch(`${PENNY_API_URL}/catalog?limit=${limit}`, {
      headers: PENNY_API_KEY ? { 'X-Penny-Api-Key': PENNY_API_KEY } : {},
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Penny catalog backend error: ${res.status} - ${body}`);
      // Fall back to local CFR index when backend is unavailable
      return NextResponse.json(buildLocalCatalogResponse());
    }

    const data = await res.json();

    // If backend returned an empty catalog, merge in local CFR knowledge
    const backendDocs = Array.isArray(data?.documents) ? data.documents : [];
    if (backendDocs.length === 0) {
      return NextResponse.json(buildLocalCatalogResponse());
    }

    // Merge local CFR docs that aren't already in the backend catalog
    const existingTitles = new Set(backendDocs.map((d: { title: string }) => d.title));
    const missingLocalDocs = LOCAL_CFR_KNOWLEDGE.filter((d) => !existingTitles.has(d.title));
    if (missingLocalDocs.length > 0) {
      const mergedDocs = [...backendDocs, ...missingLocalDocs];
      // Rebuild categories from merged docs
      const catCounts = new Map<string, number>();
      for (const doc of mergedDocs) {
        const cat = doc.category || 'General';
        catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
      }
      const mergedCategories = Array.from(catCounts.entries()).map(([name, count]) => ({ name, count }));
      return NextResponse.json({
        documents: mergedDocs,
        categories: mergedCategories,
        knowledge_docs: mergedDocs.length,
        source: 'merged',
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Penny catalog proxy error:', error);
    // Fall back to local CFR index when backend is unreachable
    return NextResponse.json(buildLocalCatalogResponse());
  }
}

