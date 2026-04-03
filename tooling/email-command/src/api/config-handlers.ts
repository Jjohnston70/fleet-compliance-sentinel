import { Repository } from '../data/repository.js';
import { DigestConfig, Recipient, ScheduleEntry } from '../data/schema.js';

export interface UpdateDigestConfigRequest {
  report_types_enabled?: ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'alert' | 'custom')[];
  schedule?: Record<string, ScheduleEntry>;
  recipients?: Recipient[];
  timezone?: string;
}

export class ConfigHandlers {
  constructor(private repository: Repository) {}

  async getDigestConfig(userEmail: string): Promise<DigestConfig | null> {
    return this.repository.getConfig(userEmail);
  }

  async updateDigestConfig(userEmail: string, req: UpdateDigestConfigRequest): Promise<DigestConfig> {
    return this.repository.updateConfig(userEmail, req);
  }

  async createDigestConfig(config: DigestConfig): Promise<DigestConfig> {
    return this.repository.createConfig(config);
  }
}
