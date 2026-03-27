CREATE TABLE IF NOT EXISTS telematics_risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_label TEXT NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level TEXT NOT NULL,
    flags JSONB NOT NULL DEFAULT '[]',
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT risk_scores_entity_uq UNIQUE (org_id, provider, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_risk_scores_org_level
    ON telematics_risk_scores (org_id, risk_level);

CREATE INDEX IF NOT EXISTS idx_risk_scores_org_entity
    ON telematics_risk_scores (org_id, entity_type, calculated_at DESC);
