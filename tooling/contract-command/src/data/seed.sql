-- ============================================================================
-- Sample Data for contract-command module
-- Demonstrates schema with realistic contracts and parties
-- ============================================================================

-- Insert sample parties
INSERT INTO parties (id, name, party_type, contact_name, contact_email, contact_phone, address, notes)
VALUES
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Acme Corporation',
    'vendor',
    'John Smith',
    'john@acme.com',
    '303-555-0101',
    '100 Business Ave, Denver, CO 80202',
    'Primary software vendor'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Global Tech Services',
    'vendor',
    'Sarah Johnson',
    'sarah@globaltech.com',
    '303-555-0102',
    '200 Tech Drive, Boulder, CO 80301',
    'IT support and consulting'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'CloudNet Inc',
    'vendor',
    'Mike Chen',
    'mike@cloudnet.io',
    '303-555-0103',
    '300 Cloud Lane, Fort Collins, CO 80521',
    'Cloud infrastructure provider'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'Creative Agency LLC',
    'partner',
    'Jessica Davis',
    'jessica@creativeagency.com',
    '303-555-0104',
    '400 Design Way, Denver, CO 80202',
    'Marketing and design partner'
  ),
  (
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'SecureVault Solutions',
    'vendor',
    'Robert Wilson',
    'robert@securevault.com',
    '303-555-0105',
    '500 Security Blvd, Denver, CO 80202',
    'Data security and compliance'
  );

-- Insert sample contracts
INSERT INTO contracts (
  id, title, contract_number, party_id, contract_type, status,
  start_date, end_date, value, currency, payment_terms,
  auto_renew, renewal_notice_days, document_url, notes, created_at
)
VALUES
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Acme Software License - Annual',
    'ACM-2024-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'saas',
    'active',
    '2024-01-01',
    '2025-01-01',
    25000.00,
    'USD',
    'annual',
    true,
    30,
    'https://drive.google.com/file/d/acme-license',
    'Critical software system',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Global Tech Support Contract',
    'GLOB-2024-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'vendor',
    'active',
    '2024-03-01',
    '2025-03-01',
    15000.00,
    'USD',
    'quarterly',
    true,
    60,
    'https://drive.google.com/file/d/globaltech-support',
    '24/7 support included',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d481',
    'CloudNet Infrastructure',
    'CLOUD-2024-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'vendor',
    'active',
    '2024-02-15',
    '2026-02-15',
    45000.00,
    'USD',
    'monthly',
    false,
    90,
    'https://drive.google.com/file/d/cloudnet-infra',
    '2-year multi-cloud hosting',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d482',
    'Brand Refresh Campaign',
    'CREA-2024-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'client_service',
    'active',
    '2024-04-01',
    '2024-10-31',
    18500.00,
    'USD',
    'net_30',
    false,
    null,
    'https://drive.google.com/file/d/brand-refresh',
    'Marketing and design deliverables',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d483',
    'Data Security Audit - Recurring',
    'SECURE-2024-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'vendor',
    'active',
    '2024-01-15',
    '2025-01-15',
    12000.00,
    'USD',
    'semi-annual',
    true,
    45,
    'https://drive.google.com/file/d/security-audit',
    'Quarterly compliance reviews',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d484',
    'NDA with New Partner',
    'NDA-2024-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'nda',
    'draft',
    '2024-06-01',
    '2026-06-01',
    null,
    'USD',
    null,
    false,
    null,
    null,
    'Pending signature',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d485',
    'Office Lease - Downtown Denver',
    'LEASE-2023-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'lease',
    'active',
    '2023-06-01',
    '2026-05-31',
    120000.00,
    'USD',
    'monthly',
    false,
    180,
    'https://drive.google.com/file/d/office-lease',
    '3-year office space lease',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d486',
    'Development Subcontractor',
    'SUB-2024-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'subcontractor',
    'pending_review',
    '2024-05-01',
    '2024-12-31',
    35000.00,
    'USD',
    'monthly',
    false,
    null,
    'https://drive.google.com/file/d/dev-subcontract',
    'Software development project',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d487',
    'Expired Vendor Contract',
    'EXPIRED-2023-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'vendor',
    'expired',
    '2023-01-01',
    '2024-01-01',
    8000.00,
    'USD',
    'annual',
    false,
    null,
    null,
    'Expired - not renewed',
    NOW()
  ),
  (
    'c47ac10b-58cc-4372-a567-0e02b2c3d488',
    'Short-term Consulting',
    'CONS-2024-001',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'client_service',
    'active',
    '2024-05-15',
    '2024-08-15',
    22000.00,
    'USD',
    'net_15',
    false,
    null,
    'https://drive.google.com/file/d/consulting-scope',
    '3-month engagement',
    NOW()
  );

-- Insert sample milestones
INSERT INTO contract_milestones (
  id, contract_id, title, description, due_date, amount, status, completed_date, created_at
)
VALUES
  (
    'm47ac10b-58cc-4372-a567-0e02b2c3d479',
    'c47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Phase 1 Deployment',
    'Initial infrastructure setup',
    '2024-04-15',
    5000.00,
    'completed',
    '2024-04-14',
    NOW()
  ),
  (
    'm47ac10b-58cc-4372-a567-0e02b2c3d480',
    'c47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Phase 2 Integration',
    'System integration and testing',
    '2024-05-15',
    5000.00,
    'pending',
    null,
    NOW()
  ),
  (
    'm47ac10b-58cc-4372-a567-0e02b2c3d481',
    'c47ac10b-58cc-4372-a567-0e02b2c3d482',
    'Brand Assets Delivery',
    'Logo, color palette, brand guidelines',
    '2024-06-15',
    8000.00,
    'completed',
    '2024-06-10',
    NOW()
  ),
  (
    'm47ac10b-58cc-4372-a567-0e02b2c3d482',
    'c47ac10b-58cc-4372-a567-0e02b2c3d482',
    'Campaign Launch',
    'Marketing campaign go-live',
    '2024-08-01',
    10000.00,
    'pending',
    null,
    NOW()
  );
