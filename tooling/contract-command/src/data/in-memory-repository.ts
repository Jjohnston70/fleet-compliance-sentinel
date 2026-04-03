/**
 * In-memory repository for testing
 * Implements same interface as database repositories
 */

import { Party, Contract, ContractMilestone, ContractAmendment, ContractNotification, Alert } from './types.js';
import { v4 as uuidv4 } from 'uuid';

class InMemoryRepository {
  private parties: Map<string, Party> = new Map();
  private contracts: Map<string, Contract> = new Map();
  private milestones: Map<string, ContractMilestone> = new Map();
  private amendments: Map<string, ContractAmendment> = new Map();
  private notifications: Map<string, ContractNotification> = new Map();
  private alerts: Map<string, Alert> = new Map();

  // ========== PARTIES ==========
  async createParty(party: Omit<Party, 'id' | 'created_at' | 'updated_at'>): Promise<Party> {
    const now = new Date();
    const newParty: Party = {
      ...party,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    this.parties.set(newParty.id, newParty);
    return newParty;
  }

  async getParty(id: string): Promise<Party | null> {
    return this.parties.get(id) || null;
  }

  async getParties(): Promise<Party[]> {
    return Array.from(this.parties.values());
  }

  async updateParty(id: string, updates: Partial<Party>): Promise<Party> {
    const party = this.parties.get(id);
    if (!party) throw new Error('Party not found');
    const updated = { ...party, ...updates, updated_at: new Date() };
    this.parties.set(id, updated);
    return updated;
  }

  // ========== CONTRACTS ==========
  async createContract(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<Contract> {
    const now = new Date();
    const newContract: Contract = {
      ...contract,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    this.contracts.set(newContract.id, newContract);
    return newContract;
  }

  async getContract(id: string): Promise<Contract | null> {
    return this.contracts.get(id) || null;
  }

  async getContracts(filters?: { status?: string; party_id?: string }): Promise<Contract[]> {
    let results = Array.from(this.contracts.values());
    if (filters?.status) {
      results = results.filter(c => c.status === filters.status);
    }
    if (filters?.party_id) {
      results = results.filter(c => c.party_id === filters.party_id);
    }
    return results;
  }

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    const contract = this.contracts.get(id);
    if (!contract) throw new Error('Contract not found');
    const updated = { ...contract, ...updates, updated_at: new Date() };
    this.contracts.set(id, updated);
    return updated;
  }

  async deleteContract(id: string): Promise<void> {
    this.contracts.delete(id);
    // Cascade delete
    Array.from(this.milestones.values())
      .filter(m => m.contract_id === id)
      .forEach(m => this.milestones.delete(m.id));
  }

  // ========== MILESTONES ==========
  async createMilestone(milestone: Omit<ContractMilestone, 'id' | 'created_at' | 'updated_at'>): Promise<ContractMilestone> {
    const now = new Date();
    const newMilestone: ContractMilestone = {
      ...milestone,
      id: uuidv4(),
      created_at: now,
      updated_at: now
    };
    this.milestones.set(newMilestone.id, newMilestone);
    return newMilestone;
  }

  async getMilestonesByContract(contractId: string): Promise<ContractMilestone[]> {
    return Array.from(this.milestones.values()).filter(m => m.contract_id === contractId);
  }

  async updateMilestone(id: string, updates: Partial<ContractMilestone>): Promise<ContractMilestone> {
    const milestone = this.milestones.get(id);
    if (!milestone) throw new Error('Milestone not found');
    const updated = { ...milestone, ...updates, updated_at: new Date() };
    this.milestones.set(id, updated);
    return updated;
  }

  // ========== AMENDMENTS ==========
  async createAmendment(amendment: Omit<ContractAmendment, 'id' | 'created_at'>): Promise<ContractAmendment> {
    const newAmendment: ContractAmendment = {
      ...amendment,
      id: uuidv4(),
      created_at: new Date()
    };
    this.amendments.set(newAmendment.id, newAmendment);
    return newAmendment;
  }

  async getAmendmentsByContract(contractId: string): Promise<ContractAmendment[]> {
    return Array.from(this.amendments.values()).filter(a => a.contract_id === contractId);
  }

  // ========== NOTIFICATIONS ==========
  async createNotification(notification: Omit<ContractNotification, 'id' | 'created_at'>): Promise<ContractNotification> {
    const newNotification: ContractNotification = {
      ...notification,
      id: uuidv4(),
      created_at: new Date()
    };
    this.notifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  async getPendingNotifications(): Promise<ContractNotification[]> {
    return Array.from(this.notifications.values()).filter(n => !n.sent);
  }

  async updateNotification(id: string, updates: Partial<ContractNotification>): Promise<ContractNotification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error('Notification not found');
    const updated = { ...notification, ...updates };
    this.notifications.set(id, updated);
    return updated;
  }

  // ========== ALERTS ==========
  async createAlert(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: uuidv4(),
      created_at: new Date()
    };
    this.alerts.set(newAlert.id, newAlert);
    return newAlert;
  }

  async getAlerts(filters?: { contract_id?: string }): Promise<Alert[]> {
    let results = Array.from(this.alerts.values());
    if (filters?.contract_id) {
      results = results.filter(a => a.contract_id === filters.contract_id);
    }
    return results;
  }

  // ========== UTILITY ==========
  clear(): void {
    this.parties.clear();
    this.contracts.clear();
    this.milestones.clear();
    this.amendments.clear();
    this.notifications.clear();
    this.alerts.clear();
  }
}

export const inMemoryRepository = new InMemoryRepository();
