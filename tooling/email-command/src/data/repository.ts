import {
  EmailDigest,
  DigestConfig,
  EmailMetrics,
  ActionItem,
  EmailDigestSchema,
  DigestConfigSchema,
  EmailMetricsSchema,
  ActionItemSchema,
} from './schema.js';

export interface Repository {
  // Email Digests
  createDigest(digest: Omit<EmailDigest, 'id'>): Promise<EmailDigest>;
  getDigest(id: string): Promise<EmailDigest | null>;
  listDigests(limit?: number): Promise<EmailDigest[]>;
  updateDigest(id: string, digest: Partial<EmailDigest>): Promise<EmailDigest>;

  // Digest Config
  getConfig(userEmail: string): Promise<DigestConfig | null>;
  updateConfig(userEmail: string, config: Partial<DigestConfig>): Promise<DigestConfig>;
  createConfig(config: DigestConfig): Promise<DigestConfig>;

  // Email Metrics
  createMetrics(metrics: Omit<EmailMetrics, 'id' | 'created_at'> & { created_at?: Date }): Promise<EmailMetrics>;
  getMetrics(id: string): Promise<EmailMetrics | null>;
  listMetricsByDate(startDate: Date, endDate: Date): Promise<EmailMetrics[]>;
  listMetricsByPeriod(periodType: 'daily' | 'weekly' | 'monthly', limit?: number): Promise<EmailMetrics[]>;

  // Action Items
  createActionItem(item: Omit<ActionItem, 'id' | 'created_at'> & { created_at?: Date }): Promise<ActionItem>;
  getActionItem(id: string): Promise<ActionItem | null>;
  listActionItems(status?: 'pending' | 'completed' | 'dismissed'): Promise<ActionItem[]>;
  updateActionItem(id: string, item: Partial<ActionItem>): Promise<ActionItem>;
}

export class InMemoryRepository implements Repository {
  private digests = new Map<string, EmailDigest>();
  private configs = new Map<string, DigestConfig>();
  private metrics = new Map<string, EmailMetrics>();
  private actionItems = new Map<string, ActionItem>();

  // Email Digests
  async createDigest(digest: Omit<EmailDigest, 'id'>): Promise<EmailDigest> {
    const parsed = EmailDigestSchema.parse({ ...digest, id: undefined });
    this.digests.set(parsed.id, parsed);
    return parsed;
  }

  async getDigest(id: string): Promise<EmailDigest | null> {
    return this.digests.get(id) ?? null;
  }

  async listDigests(limit = 50): Promise<EmailDigest[]> {
    const digests = Array.from(this.digests.values());
    return digests.sort((a, b) => b.generated_at.getTime() - a.generated_at.getTime()).slice(0, limit);
  }

  async updateDigest(id: string, digest: Partial<EmailDigest>): Promise<EmailDigest> {
    const existing = this.digests.get(id);
    if (!existing) throw new Error(`Digest ${id} not found`);
    const updated = EmailDigestSchema.parse({ ...existing, ...digest, id });
    this.digests.set(id, updated);
    return updated;
  }

  // Digest Config
  async getConfig(userEmail: string): Promise<DigestConfig | null> {
    return this.configs.get(userEmail) ?? null;
  }

  async updateConfig(userEmail: string, config: Partial<DigestConfig>): Promise<DigestConfig> {
    const existing = this.configs.get(userEmail);
    if (!existing) throw new Error(`Config for ${userEmail} not found`);
    const updated = DigestConfigSchema.parse({ ...existing, ...config, id: userEmail });
    this.configs.set(userEmail, updated);
    return updated;
  }

  async createConfig(config: DigestConfig): Promise<DigestConfig> {
    const parsed = DigestConfigSchema.parse(config);
    this.configs.set(parsed.id, parsed);
    return parsed;
  }

  // Email Metrics
  async createMetrics(metrics: Omit<EmailMetrics, 'id' | 'created_at'> & { created_at?: Date }): Promise<EmailMetrics> {
    const withDefaults = {
      ...metrics,
      created_at: metrics.created_at ?? new Date(),
      id: undefined,
    };
    const parsed = EmailMetricsSchema.parse(withDefaults);
    this.metrics.set(parsed.id, parsed);
    return parsed;
  }

  async getMetrics(id: string): Promise<EmailMetrics | null> {
    return this.metrics.get(id) ?? null;
  }

  async listMetricsByDate(startDate: Date, endDate: Date): Promise<EmailMetrics[]> {
    return Array.from(this.metrics.values())
      .filter((m) => m.created_at >= startDate && m.created_at <= endDate)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async listMetricsByPeriod(periodType: 'daily' | 'weekly' | 'monthly', limit = 50): Promise<EmailMetrics[]> {
    return Array.from(this.metrics.values())
      .filter((m) => m.period_type === periodType)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  // Action Items
  async createActionItem(item: Omit<ActionItem, 'id' | 'created_at'> & { created_at?: Date }): Promise<ActionItem> {
    const withDefaults = {
      ...item,
      created_at: item.created_at ?? new Date(),
      id: undefined,
    };
    const parsed = ActionItemSchema.parse(withDefaults);
    this.actionItems.set(parsed.id, parsed);
    return parsed;
  }

  async getActionItem(id: string): Promise<ActionItem | null> {
    return this.actionItems.get(id) ?? null;
  }

  async listActionItems(status?: 'pending' | 'completed' | 'dismissed'): Promise<ActionItem[]> {
    let items = Array.from(this.actionItems.values());
    if (status) items = items.filter((i) => i.status === status);
    return items.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  async updateActionItem(id: string, item: Partial<ActionItem>): Promise<ActionItem> {
    const existing = this.actionItems.get(id);
    if (!existing) throw new Error(`Action item ${id} not found`);
    const updated = ActionItemSchema.parse({ ...existing, ...item, id });
    this.actionItems.set(id, updated);
    return updated;
  }

  // Test helpers
  clear(): void {
    this.digests.clear();
    this.configs.clear();
    this.metrics.clear();
    this.actionItems.clear();
  }
}
