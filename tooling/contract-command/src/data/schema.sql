-- ============================================================================
-- Contract Management Database Schema
-- Neon PostgreSQL - contract-command TNDS module
-- ============================================================================

-- Parties: Vendors, clients, partners, subcontractors
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  party_type VARCHAR(20) NOT NULL CHECK (party_type IN ('client', 'vendor', 'partner', 'subcontractor')),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts: Main contract records
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  contract_number VARCHAR(50),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE RESTRICT,
  contract_type VARCHAR(30) NOT NULL CHECK (contract_type IN ('client_service', 'vendor', 'nda', 'lease', 'employment', 'subcontractor', 'saas')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'expiring', 'expired', 'terminated', 'renewed')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value NUMERIC(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  payment_terms VARCHAR(50) CHECK (payment_terms IN ('net_15', 'net_30', 'net_60', 'monthly', 'quarterly', 'annual')),
  auto_renew BOOLEAN DEFAULT FALSE,
  renewal_notice_days INTEGER DEFAULT 30,
  document_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract Milestones: Key dates and deliverables
CREATE TABLE contract_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  amount NUMERIC(12,2),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'waived')),
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract Amendments: Modifications to contracts
CREATE TABLE contract_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  amendment_number INTEGER NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  value_change NUMERIC(12,2) DEFAULT 0,
  new_end_date DATE,
  document_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract Notifications: Alert scheduling
CREATE TABLE contract_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN ('renewal_reminder', 'expiration_warning', 'milestone_due', 'payment_due')),
  trigger_date DATE NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  recipient_email VARCHAR(255),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts Log: Historical record of all alerts/notifications
CREATE TABLE alerts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by VARCHAR(255),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);
CREATE INDEX idx_contracts_party ON contracts(party_id);
CREATE INDEX idx_contracts_auto_renew ON contracts(auto_renew) WHERE auto_renew = TRUE;
CREATE INDEX idx_milestones_contract ON contract_milestones(contract_id);
CREATE INDEX idx_milestones_due ON contract_milestones(due_date);
CREATE INDEX idx_milestones_status ON contract_milestones(status);
CREATE INDEX idx_amendments_contract ON contract_amendments(contract_id);
CREATE INDEX idx_notifications_contract ON contract_notifications(contract_id);
CREATE INDEX idx_notifications_trigger ON contract_notifications(trigger_date);
CREATE INDEX idx_notifications_sent ON contract_notifications(sent);
CREATE INDEX idx_alerts_contract ON alerts_log(contract_id);
CREATE INDEX idx_alerts_type ON alerts_log(alert_type);
