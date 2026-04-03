/**
 * In-Memory Repository for Testing
 * Simulates Firestore CRUD operations without external dependencies
 */

import {
  Proposal,
  Client,
  ProposalTemplate,
  LineItem,
  ProposalActivity,
} from './firestore-schema';

export class InMemoryRepository {
  private proposals = new Map<string, Proposal>();
  private clients = new Map<string, Client>();
  private templates = new Map<string, ProposalTemplate>();
  private lineItems = new Map<string, LineItem>();
  private activities = new Map<string, ProposalActivity>();

  // Proposals
  async saveProposal(proposal: Proposal): Promise<void> {
    this.proposals.set(proposal.id, proposal);
  }

  async getProposal(id: string): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }

  async listProposals(filter?: Partial<Proposal>): Promise<Proposal[]> {
    return Array.from(this.proposals.values()).filter(p => {
      if (!filter) return true;
      return Object.entries(filter).every(([key, value]) => p[key as keyof Proposal] === value);
    });
  }

  async deleteProposal(id: string): Promise<void> {
    this.proposals.delete(id);
  }

  // Clients
  async saveClient(client: Client): Promise<void> {
    this.clients.set(client.id, client);
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async findClientByEmail(email: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(c => c.email.toLowerCase() === email.toLowerCase());
  }

  async listClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async deleteClient(id: string): Promise<void> {
    this.clients.delete(id);
  }

  // Templates
  async saveTemplate(template: ProposalTemplate): Promise<void> {
    this.templates.set(template.id, template);
  }

  async getTemplate(id: string): Promise<ProposalTemplate | undefined> {
    return this.templates.get(id);
  }

  async listTemplates(serviceType?: string): Promise<ProposalTemplate[]> {
    return Array.from(this.templates.values()).filter(
      t => !serviceType || t.serviceType === serviceType
    );
  }

  // Line Items
  async saveLineItem(item: LineItem): Promise<void> {
    this.lineItems.set(item.id, item);
  }

  async getLineItem(id: string): Promise<LineItem | undefined> {
    return this.lineItems.get(id);
  }

  async listLineItems(proposalId: string): Promise<LineItem[]> {
    return Array.from(this.lineItems.values())
      .filter(item => item.proposalId === proposalId)
      .sort((a, b) => a.order - b.order);
  }

  async deleteLineItem(id: string): Promise<void> {
    this.lineItems.delete(id);
  }

  // Activities
  async saveActivity(activity: ProposalActivity): Promise<void> {
    this.activities.set(activity.id, activity);
  }

  async listActivities(proposalId: string): Promise<ProposalActivity[]> {
    return Array.from(this.activities.values())
      .filter(a => a.proposalId === proposalId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Utility: Clear all data
  async clear(): Promise<void> {
    this.proposals.clear();
    this.clients.clear();
    this.templates.clear();
    this.lineItems.clear();
    this.activities.clear();
  }
}
