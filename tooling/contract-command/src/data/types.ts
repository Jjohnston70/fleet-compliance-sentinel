/**
 * Type definitions for contract-command module
 */

export type PartyType = 'client' | 'vendor' | 'partner' | 'subcontractor';
export type ContractType = 'client_service' | 'vendor' | 'nda' | 'lease' | 'employment' | 'subcontractor' | 'saas';
export type ContractStatus = 'draft' | 'pending_review' | 'active' | 'expiring' | 'expired' | 'terminated' | 'renewed';
export type PaymentTerms = 'net_15' | 'net_30' | 'net_60' | 'monthly' | 'quarterly' | 'annual';
export type MilestoneStatus = 'pending' | 'completed' | 'overdue' | 'waived';
export type NotificationType = 'renewal_reminder' | 'expiration_warning' | 'milestone_due' | 'payment_due';

export interface Party {
  id: string;
  name: string;
  party_type: PartyType;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Contract {
  id: string;
  title: string;
  contract_number?: string;
  party_id: string;
  contract_type: ContractType;
  status: ContractStatus;
  start_date: Date;
  end_date: Date;
  value?: number;
  currency: string;
  payment_terms?: PaymentTerms;
  auto_renew: boolean;
  renewal_notice_days: number;
  document_url?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ContractMilestone {
  id: string;
  contract_id: string;
  title: string;
  description?: string;
  due_date: Date;
  amount?: number;
  status: MilestoneStatus;
  completed_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ContractAmendment {
  id: string;
  contract_id: string;
  amendment_number: number;
  date: Date;
  description: string;
  value_change?: number;
  new_end_date?: Date;
  document_url?: string;
  created_at: Date;
}

export interface ContractNotification {
  id: string;
  contract_id: string;
  notification_type: NotificationType;
  trigger_date: Date;
  sent: boolean;
  sent_at?: Date;
  recipient_email?: string;
  message?: string;
  created_at: Date;
}

export interface Alert {
  id: string;
  contract_id?: string;
  alert_type: string;
  message: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: Date;
  created_at: Date;
}

export interface ContractSummary {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
  pending: number;
  total_value: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
}

export interface VendorAnalysis {
  party_id: string;
  party_name: string;
  contract_count: number;
  total_spend: number;
  avg_contract_value: number;
  avg_duration_days: number;
  renewal_rate: number;
  active_contracts: number;
  expiring_contracts: number;
}
