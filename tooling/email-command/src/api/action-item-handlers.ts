import { Repository } from '../data/repository.js';
import { ActionItem } from '../data/schema.js';

export interface UpdateActionItemRequest {
  status?: 'pending' | 'completed' | 'dismissed';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  due_date?: Date;
}

export class ActionItemHandlers {
  constructor(private repository: Repository) {}

  async listActionItems(status?: 'pending' | 'completed' | 'dismissed'): Promise<ActionItem[]> {
    return this.repository.listActionItems(status);
  }

  async getActionItem(id: string): Promise<ActionItem | null> {
    return this.repository.getActionItem(id);
  }

  async updateActionItem(id: string, req: UpdateActionItemRequest): Promise<ActionItem> {
    return this.repository.updateActionItem(id, req);
  }
}
