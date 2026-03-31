import { ensureOrgScopingTables, getSQL } from '@/lib/fleet-compliance-db';

export type PlanTier = 'trial' | 'starter' | 'pro' | 'enterprise';

interface ModuleSeed {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  routePrefix: string;
  isCore: boolean;
  requiresPlan: PlanTier;
  metadata: Record<string, unknown>;
}

export interface ModuleCatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string | null;
  routePrefix: string;
  isCore: boolean;
  requiresPlan: PlanTier;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const MODULE_SEEDS: readonly ModuleSeed[] = [
  {
    id: 'fleet-compliance',
    name: 'Fleet Compliance',
    description: 'Fleet compliance operations and records.',
    category: 'fleet',
    icon: 'ShieldCheck',
    routePrefix: '/fleet-compliance',
    isCore: true,
    requiresPlan: 'trial',
    metadata: {},
  },
  {
    id: 'penny-ai',
    name: 'Pipeline Penny AI',
    description: 'AI assistant and tool orchestration.',
    category: 'core',
    icon: 'Bot',
    routePrefix: '/penny',
    isCore: true,
    requiresPlan: 'trial',
    metadata: {},
  },
  {
    id: 'telematics',
    name: 'Telematics',
    description: 'Vehicle and driver telematics visibility.',
    category: 'fleet',
    icon: 'MapPinned',
    routePrefix: '/fleet-compliance/telematics',
    isCore: false,
    requiresPlan: 'starter',
    metadata: {},
  },
  {
    id: 'petroleum-intel',
    name: 'Petroleum Intelligence',
    description: 'Forecasting, regime, and fuel strategy analytics.',
    category: 'petroleum',
    icon: 'Fuel',
    routePrefix: '/petroleum',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
  {
    id: 'dispatch',
    name: 'Dispatch Operations',
    description: 'Dispatching workflows and SLA operations.',
    category: 'fleet',
    icon: 'Truck',
    routePrefix: '/dispatch',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
  {
    id: 'financial',
    name: 'Financial Management',
    description: 'Transactions, budgets, and financial insights.',
    category: 'business',
    icon: 'Wallet',
    routePrefix: '/financial',
    isCore: false,
    requiresPlan: 'starter',
    metadata: {},
  },
  {
    id: 'sales',
    name: 'Sales Analytics',
    description: 'Sales KPIs, imports, and trend analysis.',
    category: 'business',
    icon: 'TrendingUp',
    routePrefix: '/sales',
    isCore: false,
    requiresPlan: 'starter',
    metadata: {},
  },
  {
    id: 'contracts',
    name: 'Contract Management',
    description: 'Contract lifecycle and renewal tracking.',
    category: 'contracts',
    icon: 'FileText',
    routePrefix: '/contracts',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
  {
    id: 'proposals',
    name: 'Proposal Generator',
    description: 'Proposal authoring and delivery workflows.',
    category: 'contracts',
    icon: 'FilePenLine',
    routePrefix: '/proposals',
    isCore: false,
    requiresPlan: 'starter',
    metadata: {},
  },
  {
    id: 'govcon',
    name: 'Government Contracting',
    description: 'Federal opportunity and bid management.',
    category: 'contracts',
    icon: 'Landmark',
    routePrefix: '/govcon',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
  {
    id: 'tasks',
    name: 'Task Management',
    description: 'Assignments, workload, and execution tracking.',
    category: 'business',
    icon: 'ListTodo',
    routePrefix: '/tasks',
    isCore: false,
    requiresPlan: 'starter',
    metadata: {},
  },
  {
    id: 'training',
    name: 'Training Platform',
    description: 'Training operations and enrollment tracking.',
    category: 'people',
    icon: 'GraduationCap',
    routePrefix: '/training',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
  {
    id: 'compliance-docs',
    name: 'Compliance Documents',
    description: 'Compliance package and artifact workflows.',
    category: 'compliance',
    icon: 'ClipboardCheck',
    routePrefix: '/compliance-docs',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
  {
    id: 'readiness',
    name: 'AI Readiness',
    description: 'Readiness assessments and recommendations.',
    category: 'compliance',
    icon: 'Gauge',
    routePrefix: '/readiness',
    isCore: false,
    requiresPlan: 'starter',
    metadata: {},
  },
  {
    id: 'invoices',
    name: 'Invoice Processing',
    description: 'Invoice parsing and extraction workflows.',
    category: 'business',
    icon: 'ReceiptText',
    routePrefix: '/invoices',
    isCore: false,
    requiresPlan: 'starter',
    metadata: {},
  },
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Onboarding workflows and account setup.',
    category: 'people',
    icon: 'UserPlus',
    routePrefix: '/onboarding',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
  {
    id: 'email-analytics',
    name: 'Email Analytics',
    description: 'Inbox analytics and digest generation.',
    category: 'people',
    icon: 'Mail',
    routePrefix: '/email-analytics',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
  {
    id: 'ml-signals',
    name: 'Business Forecasting',
    description: 'ML forecasting for business operations signals.',
    category: 'compliance',
    icon: 'LineChart',
    routePrefix: '/ml-signals',
    isCore: false,
    requiresPlan: 'pro',
    metadata: {},
  },
];

const PLAN_DEFAULTS: Readonly<Record<PlanTier, readonly string[]>> = {
  trial: ['fleet-compliance', 'penny-ai'],
  starter: [
    'fleet-compliance',
    'penny-ai',
    'telematics',
    'financial',
    'sales',
    'tasks',
    'proposals',
    'readiness',
    'invoices',
  ],
  pro: [
    'fleet-compliance',
    'penny-ai',
    'telematics',
    'financial',
    'sales',
    'tasks',
    'proposals',
    'readiness',
    'invoices',
    'petroleum-intel',
    'dispatch',
    'contracts',
    'govcon',
    'training',
    'compliance-docs',
    'onboarding',
    'email-analytics',
    'ml-signals',
  ],
  enterprise: MODULE_SEEDS.map((item) => item.id),
};

let ensuredModuleTables = false;

function parseBoolean(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

export function normalizePlanTier(plan: string | null | undefined): PlanTier {
  const raw = String(plan ?? '').trim().toLowerCase();
  if (!raw) return 'trial';

  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID?.trim().toLowerCase();
  if (starterPriceId && raw === starterPriceId) return 'starter';

  const proPriceId = process.env.STRIPE_PRO_PRICE_ID?.trim().toLowerCase();
  if (proPriceId && raw === proPriceId) return 'pro';

  if (raw.includes('enterprise')) return 'enterprise';
  if (raw.includes('professional') || /(^|[-_:\s])pro($|[-_:\s])/.test(raw)) return 'pro';
  if (raw.includes('starter') || /(^|[-_:\s])basic($|[-_:\s])/.test(raw)) return 'starter';
  if (raw.includes('trial')) return 'trial';
  if (['canceled', 'cancelled', 'unpaid', 'incomplete_expired', 'unknown'].includes(raw)) return 'trial';
  return 'trial';
}

async function ensureModuleSystemTables(): Promise<void> {
  if (ensuredModuleTables) return;
  await ensureOrgScopingTables();
  const sql = getSQL();

  await sql`
    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      icon TEXT,
      route_prefix TEXT NOT NULL,
      is_core BOOLEAN NOT NULL DEFAULT FALSE,
      requires_plan TEXT NOT NULL DEFAULT 'starter',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS org_modules (
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      enabled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      enabled_by TEXT,
      config JSONB NOT NULL DEFAULT '{}'::jsonb,
      PRIMARY KEY (org_id, module_id)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_org_modules_org_enabled
    ON org_modules (org_id, enabled)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_org_modules_module_enabled
    ON org_modules (module_id, enabled)
  `;

  for (const item of MODULE_SEEDS) {
    await sql`
      INSERT INTO modules (
        id,
        name,
        description,
        category,
        icon,
        route_prefix,
        is_core,
        requires_plan,
        metadata
      ) VALUES (
        ${item.id},
        ${item.name},
        ${item.description},
        ${item.category},
        ${item.icon},
        ${item.routePrefix},
        ${item.isCore},
        ${item.requiresPlan},
        ${JSON.stringify(item.metadata)}::jsonb
      )
      ON CONFLICT (id) DO UPDATE
      SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        icon = EXCLUDED.icon,
        route_prefix = EXCLUDED.route_prefix,
        is_core = EXCLUDED.is_core,
        requires_plan = EXCLUDED.requires_plan,
        metadata = EXCLUDED.metadata
    `;
  }

  ensuredModuleTables = true;
}

export async function getOrgModules(orgId: string): Promise<string[]> {
  await ensureModuleSystemTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT m.id
    FROM modules m
    LEFT JOIN org_modules om
      ON om.module_id = m.id
     AND om.org_id = ${orgId}
    WHERE m.is_core = TRUE
       OR COALESCE(om.enabled, FALSE) = TRUE
    ORDER BY m.id ASC
  `;
  return rows
    .map((row) => (typeof row.id === 'string' ? row.id : ''))
    .filter(Boolean);
}

export async function isModuleEnabled(orgId: string, moduleId: string): Promise<boolean> {
  await ensureModuleSystemTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT m.is_core, om.enabled
    FROM modules m
    LEFT JOIN org_modules om
      ON om.module_id = m.id
     AND om.org_id = ${orgId}
    WHERE m.id = ${moduleId}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return false;
  return parseBoolean(row.is_core) || parseBoolean(row.enabled);
}

export async function enableModule(orgId: string, moduleId: string, userId?: string | null): Promise<boolean> {
  await ensureModuleSystemTables();
  const sql = getSQL();
  const moduleRows = await sql`
    SELECT id
    FROM modules
    WHERE id = ${moduleId}
    LIMIT 1
  `;
  if (moduleRows.length === 0) return false;

  await sql`
    INSERT INTO org_modules (
      org_id,
      module_id,
      enabled,
      enabled_at,
      enabled_by,
      config
    ) VALUES (
      ${orgId},
      ${moduleId},
      TRUE,
      NOW(),
      ${userId ?? null},
      '{}'::jsonb
    )
    ON CONFLICT (org_id, module_id) DO UPDATE
      SET enabled = TRUE,
          enabled_at = NOW(),
          enabled_by = EXCLUDED.enabled_by
  `;
  return true;
}

export async function disableModule(orgId: string, moduleId: string): Promise<boolean> {
  await ensureModuleSystemTables();
  const sql = getSQL();
  const moduleRows = await sql`
    SELECT is_core
    FROM modules
    WHERE id = ${moduleId}
    LIMIT 1
  `;
  const row = moduleRows[0] as Record<string, unknown> | undefined;
  if (!row) return false;
  if (parseBoolean(row.is_core)) return false;

  await sql`
    INSERT INTO org_modules (
      org_id,
      module_id,
      enabled,
      enabled_at,
      enabled_by,
      config
    ) VALUES (
      ${orgId},
      ${moduleId},
      FALSE,
      NOW(),
      NULL,
      '{}'::jsonb
    )
    ON CONFLICT (org_id, module_id) DO UPDATE
      SET enabled = FALSE,
          enabled_at = NOW()
  `;
  return true;
}

export async function getModuleCatalog(): Promise<ModuleCatalogItem[]> {
  await ensureModuleSystemTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT
      id,
      name,
      description,
      category,
      icon,
      route_prefix,
      is_core,
      requires_plan,
      metadata,
      created_at
    FROM modules
    ORDER BY category ASC, name ASC
  `;
  return rows.map((row) => ({
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    description: String(row.description ?? ''),
    category: String(row.category ?? ''),
    icon: row.icon ? String(row.icon) : null,
    routePrefix: String(row.route_prefix ?? ''),
    isCore: parseBoolean(row.is_core),
    requiresPlan: normalizePlanTier(typeof row.requires_plan === 'string' ? row.requires_plan : 'trial'),
    metadata: parseJsonObject(row.metadata),
    createdAt: String(row.created_at ?? ''),
  }));
}

export function getModulesByPlan(plan: string): string[] {
  const tier = normalizePlanTier(plan);
  return [...PLAN_DEFAULTS[tier]];
}
