import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'showing' | 'active' | 'under_contract' | 'closed' | 'lost';
type LeadType = 'buyer' | 'seller' | 'both' | 'investor' | 'renter';
type DealStage = 'prospect' | 'showing' | 'offer' | 'negotiation' | 'under_contract' | 'inspection' | 'appraisal' | 'closing' | 'closed' | 'fell_through';

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  leadType: LeadType;
  budgetMin?: number;
  budgetMax?: number;
  areasOfInterest?: string[];
  propertyType?: string;
  timeline?: string;
  notes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface Deal {
  id: string;
  leadId: string;
  propertyId: string;
  propertyAddress: string;
  clientName: string;
  dealType: 'buy' | 'sell' | 'dual';
  stage: DealStage;
  offerAmount?: number;
  acceptedAmount?: number;
  commissionPct?: number;
  commissionAmount?: number;
  estimatedClose?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// In-memory store (per PATH-2: "In-memory repository initially")
// ---------------------------------------------------------------------------

const orgDeals = new Map<string, Deal[]>();
const orgLeads = new Map<string, Lead[]>();

function getDeals(orgId: string): Deal[] {
  if (!orgDeals.has(orgId)) {
    orgDeals.set(orgId, seedDeals());
  }
  return orgDeals.get(orgId)!;
}

function getLeads(orgId: string): Lead[] {
  if (!orgLeads.has(orgId)) {
    orgLeads.set(orgId, seedLeads());
  }
  return orgLeads.get(orgId)!;
}

// ---------------------------------------------------------------------------
// Seed data -- gives the UI something to show immediately
// ---------------------------------------------------------------------------

function seedDeals(): Deal[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'deal-001',
      leadId: 'lead-001',
      propertyId: 'prop-001',
      propertyAddress: '1245 Cascade Ave, Colorado Springs, CO',
      clientName: 'Sarah Mitchell',
      dealType: 'buy',
      stage: 'showing',
      offerAmount: 425000,
      acceptedAmount: undefined,
      commissionPct: 3,
      estimatedClose: '2026-06-15',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'deal-002',
      leadId: 'lead-002',
      propertyId: 'prop-002',
      propertyAddress: '890 Mesa Rd, Manitou Springs, CO',
      clientName: 'James Ortiz',
      dealType: 'sell',
      stage: 'under_contract',
      offerAmount: 375000,
      acceptedAmount: 370000,
      commissionPct: 2.5,
      estimatedClose: '2026-05-01',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'deal-003',
      leadId: 'lead-003',
      propertyId: 'prop-003',
      propertyAddress: '2340 N Academy Blvd, Colorado Springs, CO',
      clientName: 'Linda Park',
      dealType: 'buy',
      stage: 'prospect',
      offerAmount: undefined,
      acceptedAmount: undefined,
      commissionPct: 3,
      estimatedClose: '2026-08-01',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'deal-004',
      leadId: 'lead-004',
      propertyId: 'prop-004',
      propertyAddress: '455 Garden of the Gods Rd, Colorado Springs, CO',
      clientName: 'Robert Chen',
      dealType: 'buy',
      stage: 'offer',
      offerAmount: 550000,
      acceptedAmount: undefined,
      commissionPct: 3,
      estimatedClose: '2026-07-15',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'deal-005',
      leadId: 'lead-005',
      propertyId: 'prop-005',
      propertyAddress: '780 Cheyenne Mountain Blvd, Colorado Springs, CO',
      clientName: 'Maria Gonzalez',
      dealType: 'sell',
      stage: 'closed',
      offerAmount: 290000,
      acceptedAmount: 285000,
      commissionPct: 2.5,
      estimatedClose: '2026-03-15',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedLeads(): Lead[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'lead-001',
      firstName: 'Sarah',
      lastName: 'Mitchell',
      email: 'sarah@example.com',
      phone: '719-555-0101',
      source: 'referral',
      status: 'showing',
      leadType: 'buyer',
      budgetMin: 400000,
      budgetMax: 450000,
      propertyType: 'single family',
      timeline: '3 months',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead-002',
      firstName: 'James',
      lastName: 'Ortiz',
      email: 'james@example.com',
      source: 'zillow',
      status: 'under_contract',
      leadType: 'seller',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead-003',
      firstName: 'Linda',
      lastName: 'Park',
      source: 'website',
      status: 'new',
      leadType: 'buyer',
      budgetMin: 200000,
      budgetMax: 300000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead-004',
      firstName: 'Robert',
      lastName: 'Chen',
      source: 'open house',
      status: 'qualified',
      leadType: 'buyer',
      budgetMin: 500000,
      budgetMax: 600000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'lead-005',
      firstName: 'Maria',
      lastName: 'Gonzalez',
      source: 'referral',
      status: 'closed',
      leadType: 'seller',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// ---------------------------------------------------------------------------
// Lead scoring (mirrors tooling/realty-command/src/services/lead-service.ts)
// ---------------------------------------------------------------------------

function calculateLeadScore(lead: Lead): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};

  const sourceWeight: Record<string, number> = {
    website: 20, zillow: 18, 'realtor.com': 18, referral: 30,
    'open house': 15, 'sign call': 10, 'social media': 8, other: 5,
  };
  const statusWeight: Record<string, number> = {
    new: 5, contacted: 15, qualified: 25, showing: 35, active: 45,
    under_contract: 60, closed: 80, lost: 0,
  };

  breakdown.status = statusWeight[lead.status] ?? 0;
  breakdown.source = sourceWeight[lead.source?.toLowerCase()] ?? 10;

  if (lead.budgetMin && lead.budgetMax) {
    const spread = lead.budgetMax - lead.budgetMin;
    breakdown.budget = spread <= 50000 ? 10 : spread <= 100000 ? 5 : 0;
  }

  const raw = Object.values(breakdown).reduce((s, v) => s + v, 0);
  return { score: Math.min(Math.round(raw), 100), breakdown };
}

// ---------------------------------------------------------------------------
// Commission calculator (mirrors tooling/realty-command/src/services/deal-service.ts)
// ---------------------------------------------------------------------------

function calculateCommission(
  salePrice: number,
  commissionPct: number,
  splitPct: number = 70,
): { total: number; agent: number; brokerage: number } {
  const total = Number((salePrice * (commissionPct / 100)).toFixed(2));
  const agent = Number((total * (splitPct / 100)).toFixed(2));
  const brokerage = Number((total - agent).toFixed(2));
  return { total, agent, brokerage };
}

// ---------------------------------------------------------------------------
// Pipeline summary
// ---------------------------------------------------------------------------

function buildPipelineSummary(deals: Deal[], leads: Lead[]) {
  const stageCounts: Record<string, number> = {};
  let totalValue = 0;
  let closedCount = 0;

  for (const deal of deals) {
    stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1;
    const value = deal.acceptedAmount ?? deal.offerAmount ?? 0;
    totalValue += value;
    if (deal.stage === 'closed') closedCount++;
  }

  const avgLeadScore = leads.length > 0
    ? Math.round(leads.reduce((s, l) => s + calculateLeadScore(l).score, 0) / leads.length)
    : 0;

  return {
    totalDeals: deals.length,
    totalLeads: leads.length,
    totalValue,
    closedCount,
    conversionRate: leads.length > 0 ? Math.round((closedCount / leads.length) * 100) : 0,
    avgLeadScore,
    stageCounts,
  };
}

// ---------------------------------------------------------------------------
// Stage advancement validation
// ---------------------------------------------------------------------------

const STAGE_ORDER: DealStage[] = [
  'prospect', 'showing', 'offer', 'negotiation', 'under_contract',
  'inspection', 'appraisal', 'closing', 'closed', 'fell_through',
];

function canAdvanceStage(current: DealStage, next: DealStage): boolean {
  const ci = STAGE_ORDER.indexOf(current);
  const ni = STAGE_ORDER.indexOf(next);
  if (ci === -1 || ni === -1) return false;
  if (next === 'fell_through') return true;
  return ni >= ci;
}

// ---------------------------------------------------------------------------
// GET /api/fleet-compliance/realty?action=...
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action') ?? 'pipeline';

  if (action === 'pipeline') {
    const deals = getDeals(orgId);
    const leads = getLeads(orgId);
    const summary = buildPipelineSummary(deals, leads);
    return Response.json({ ok: true, deals, leads, summary });
  }

  if (action === 'score-lead') {
    const leadId = url.searchParams.get('leadId');
    if (!leadId) {
      return Response.json({ ok: false, error: 'leadId is required' }, { status: 400 });
    }
    const leads = getLeads(orgId);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) {
      return Response.json({ ok: false, error: 'Lead not found' }, { status: 404 });
    }
    const result = calculateLeadScore(lead);
    return Response.json({ ok: true, leadId, ...result });
  }

  if (action === 'commission') {
    const salePrice = Number(url.searchParams.get('salePrice'));
    const commissionPct = Number(url.searchParams.get('commissionPct'));
    const splitPct = Number(url.searchParams.get('splitPct') ?? '70');
    if (!salePrice || !commissionPct) {
      return Response.json({ ok: false, error: 'salePrice and commissionPct are required' }, { status: 400 });
    }
    const result = calculateCommission(salePrice, commissionPct, splitPct);
    return Response.json({ ok: true, ...result });
  }

  return Response.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 });
}

// ---------------------------------------------------------------------------
// POST /api/fleet-compliance/realty
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const action = typeof body.action === 'string' ? body.action : '';

  if (action === 'update-stage') {
    const dealId = typeof body.dealId === 'string' ? body.dealId : '';
    const newStage = body.stage as DealStage;
    if (!dealId || !newStage) {
      return Response.json({ ok: false, error: 'dealId and stage are required' }, { status: 400 });
    }

    const deals = getDeals(orgId);
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) {
      return Response.json({ ok: false, error: 'Deal not found' }, { status: 404 });
    }

    if (!canAdvanceStage(deal.stage, newStage)) {
      return Response.json(
        { ok: false, error: `Cannot move from ${deal.stage} to ${newStage}` },
        { status: 400 },
      );
    }

    deal.stage = newStage;
    deal.updatedAt = new Date().toISOString();
    return Response.json({ ok: true, deal });
  }

  if (action === 'add-deal') {
    const deals = getDeals(orgId);
    const newDeal: Deal = {
      id: `deal-${String(deals.length + 1).padStart(3, '0')}`,
      leadId: body.leadId ?? '',
      propertyId: body.propertyId ?? '',
      propertyAddress: body.propertyAddress ?? '',
      clientName: body.clientName ?? '',
      dealType: body.dealType ?? 'buy',
      stage: 'prospect',
      offerAmount: body.offerAmount ? Number(body.offerAmount) : undefined,
      commissionPct: body.commissionPct ? Number(body.commissionPct) : 3,
      estimatedClose: body.estimatedClose ?? undefined,
      notes: body.notes ?? undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deals.push(newDeal);
    return Response.json({ ok: true, deal: newDeal });
  }

  if (action === 'add-lead') {
    const leads = getLeads(orgId);
    const newLead: Lead = {
      id: `lead-${String(leads.length + 1).padStart(3, '0')}`,
      firstName: body.firstName ?? '',
      lastName: body.lastName ?? '',
      email: body.email,
      phone: body.phone,
      source: body.source ?? 'website',
      status: 'new',
      leadType: body.leadType ?? 'buyer',
      budgetMin: body.budgetMin ? Number(body.budgetMin) : undefined,
      budgetMax: body.budgetMax ? Number(body.budgetMax) : undefined,
      propertyType: body.propertyType,
      timeline: body.timeline,
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.push(newLead);
    return Response.json({ ok: true, lead: newLead });
  }

  return Response.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 });
}
