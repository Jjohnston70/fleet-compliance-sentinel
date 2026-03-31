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
);

CREATE TABLE IF NOT EXISTS org_modules (
    org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    enabled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    enabled_by TEXT,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    PRIMARY KEY (org_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_org_modules_org_enabled
    ON org_modules (org_id, enabled);

CREATE INDEX IF NOT EXISTS idx_org_modules_module_enabled
    ON org_modules (module_id, enabled);

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
) VALUES
    ('fleet-compliance', 'Fleet Compliance', 'Fleet compliance operations and records.', 'fleet', 'ShieldCheck', '/fleet-compliance', TRUE, 'trial', '{}'::jsonb),
    ('penny-ai', 'Pipeline Penny AI', 'AI assistant and tool orchestration.', 'core', 'Bot', '/penny', TRUE, 'trial', '{}'::jsonb),
    ('telematics', 'Telematics', 'Vehicle and driver telematics visibility.', 'fleet', 'MapPinned', '/fleet-compliance/telematics', FALSE, 'starter', '{}'::jsonb),
    ('petroleum-intel', 'Petroleum Intelligence', 'Forecasting, regime, and fuel strategy analytics.', 'petroleum', 'Fuel', '/petroleum', FALSE, 'pro', '{}'::jsonb),
    ('dispatch', 'Dispatch Operations', 'Dispatching workflows and SLA operations.', 'fleet', 'Truck', '/dispatch', FALSE, 'pro', '{}'::jsonb),
    ('financial', 'Financial Management', 'Transactions, budgets, and financial insights.', 'business', 'Wallet', '/financial', FALSE, 'starter', '{}'::jsonb),
    ('sales', 'Sales Analytics', 'Sales KPIs, imports, and trend analysis.', 'business', 'TrendingUp', '/sales', FALSE, 'starter', '{}'::jsonb),
    ('contracts', 'Contract Management', 'Contract lifecycle and renewal tracking.', 'contracts', 'FileText', '/contracts', FALSE, 'pro', '{}'::jsonb),
    ('proposals', 'Proposal Generator', 'Proposal authoring and delivery workflows.', 'contracts', 'FilePenLine', '/proposals', FALSE, 'starter', '{}'::jsonb),
    ('govcon', 'Government Contracting', 'Federal opportunity and bid management.', 'contracts', 'Landmark', '/govcon', FALSE, 'pro', '{}'::jsonb),
    ('tasks', 'Task Management', 'Assignments, workload, and execution tracking.', 'business', 'ListTodo', '/tasks', FALSE, 'starter', '{}'::jsonb),
    ('training', 'Training Platform', 'Training operations and enrollment tracking.', 'people', 'GraduationCap', '/training', FALSE, 'pro', '{}'::jsonb),
    ('compliance-docs', 'Compliance Documents', 'Compliance package and artifact workflows.', 'compliance', 'ClipboardCheck', '/compliance-docs', FALSE, 'pro', '{}'::jsonb),
    ('readiness', 'AI Readiness', 'Readiness assessments and recommendations.', 'compliance', 'Gauge', '/readiness', FALSE, 'starter', '{}'::jsonb),
    ('invoices', 'Invoice Processing', 'Invoice parsing and extraction workflows.', 'business', 'ReceiptText', '/invoices', FALSE, 'starter', '{}'::jsonb),
    ('onboarding', 'Employee Onboarding', 'Onboarding workflows and account setup.', 'people', 'UserPlus', '/onboarding', FALSE, 'pro', '{}'::jsonb),
    ('email-analytics', 'Email Analytics', 'Inbox analytics and digest generation.', 'people', 'Mail', '/email-analytics', FALSE, 'pro', '{}'::jsonb),
    ('ml-signals', 'Business Forecasting', 'ML forecasting for business operations signals.', 'compliance', 'LineChart', '/ml-signals', FALSE, 'pro', '{}'::jsonb)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    route_prefix = EXCLUDED.route_prefix,
    is_core = EXCLUDED.is_core,
    requires_plan = EXCLUDED.requires_plan,
    metadata = EXCLUDED.metadata;

-- Backward compatibility: preserve existing org experience by enabling all
-- modules for orgs that pre-date module gating.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'organizations'
    ) THEN
        INSERT INTO org_modules (org_id, module_id, enabled, enabled_at, enabled_by, config)
        SELECT
            o.id,
            m.id,
            TRUE,
            NOW(),
            'migration_011',
            '{}'::jsonb
        FROM organizations o
        CROSS JOIN modules m
        LEFT JOIN org_modules om
            ON om.org_id = o.id
           AND om.module_id = m.id
        WHERE om.org_id IS NULL;
    END IF;
END $$;
