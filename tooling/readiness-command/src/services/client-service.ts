import { AssessmentClient } from '../data/firestore-schema.js';
import { InMemoryRepository } from '../data/in-memory-repository.js';

export class ClientService {
  constructor(private repository: InMemoryRepository) {}

  createClient(
    companyName: string,
    contactName: string,
    contactEmail: string,
    industry: string,
    employeeCount: number,
    currentTechStack: string[]
  ): AssessmentClient {
    const id = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const client: AssessmentClient = {
      id,
      companyName,
      contactName,
      contactEmail,
      industry,
      employeeCount,
      currentTechStack,
      createdAt: new Date(),
    };

    this.repository.createClient(client);
    return client;
  }

  getClient(id: string): AssessmentClient | undefined {
    return this.repository.getClient(id);
  }

  updateClient(id: string, updates: Partial<AssessmentClient>): AssessmentClient {
    const client = this.repository.getClient(id);
    if (!client) {
      throw new Error(`Client ${id} not found`);
    }

    const updated = { ...client, ...updates, id, createdAt: client.createdAt };
    this.repository.updateClient(updated);
    return updated;
  }

  getAllClients(): AssessmentClient[] {
    return this.repository.getAllClients();
  }

  getClientsByIndustry(industry: string): AssessmentClient[] {
    return this.repository
      .getAllClients()
      .filter((c) => c.industry.toLowerCase() === industry.toLowerCase());
  }

  getClientsBySize(minEmployees: number, maxEmployees: number): AssessmentClient[] {
    return this.repository
      .getAllClients()
      .filter((c) => c.employeeCount >= minEmployees && c.employeeCount <= maxEmployees);
  }
}
