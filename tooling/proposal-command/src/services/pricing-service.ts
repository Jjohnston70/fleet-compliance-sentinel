/**
 * Pricing Service - Line Item & Calculation Management
 */

import { LineItem, PricingSummary } from '../data/firestore-schema';
import { PricingCategory } from '../config';
import { InMemoryRepository } from '../data/in-memory-repository';

export class PricingService {
  constructor(private repository: InMemoryRepository) {}

  /**
   * Add line item to proposal
   */
  async addLineItem(
    proposalId: string,
    description: string,
    quantity: number,
    unitPrice: number,
    category: PricingCategory,
    order?: number
  ): Promise<LineItem> {
    const existingItems = await this.repository.listLineItems(proposalId);
    const nextOrder = order ?? existingItems.length + 1;

    const item: LineItem = {
      id: this.generateId(),
      proposalId,
      description,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      category,
      order: nextOrder,
      createdAt: new Date(),
    };

    await this.repository.saveLineItem(item);
    return item;
  }

  /**
   * Get line item by ID
   */
  async getLineItem(id: string): Promise<LineItem | undefined> {
    return this.repository.getLineItem(id);
  }

  /**
   * Get all line items for a proposal
   */
  async getLineItems(proposalId: string): Promise<LineItem[]> {
    return this.repository.listLineItems(proposalId);
  }

  /**
   * Update line item
   */
  async updateLineItem(
    id: string,
    updates: Partial<Omit<LineItem, 'id' | 'proposalId' | 'createdAt'>>
  ): Promise<LineItem> {
    const item = await this.getLineItem(id);
    if (!item) throw new Error(`Line item not found: ${id}`);

    const updated: LineItem = {
      ...item,
      ...updates,
      total: (updates.quantity ?? item.quantity) * (updates.unitPrice ?? item.unitPrice),
    };

    await this.repository.saveLineItem(updated);
    return updated;
  }

  /**
   * Delete line item
   */
  async deleteLineItem(id: string): Promise<void> {
    await this.repository.deleteLineItem(id);
  }

  /**
   * Calculate pricing summary for a proposal
   */
  async calculatePricingSummary(
    proposalId: string,
    taxRate: number = 0,
    discountPercent: number = 0
  ): Promise<PricingSummary> {
    const lineItems = await this.getLineItems(proposalId);

    // Calculate subtotal
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate tax
    const taxAmount = (subtotal * taxRate) / 100;

    // Calculate discount
    const discountAmount = (subtotal * discountPercent) / 100;

    // Calculate total
    const total = subtotal + taxAmount - discountAmount;

    return {
      subtotal,
      taxRate,
      taxAmount,
      discountPercent,
      discountAmount,
      total,
    };
  }

  /**
   * Add multiple line items (bulk)
   */
  async addLineItems(
    proposalId: string,
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      category: PricingCategory;
    }>
  ): Promise<LineItem[]> {
    const results: LineItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const lineItem = await this.addLineItem(
        proposalId,
        item.description,
        item.quantity,
        item.unitPrice,
        item.category,
        i + 1
      );
      results.push(lineItem);
    }

    return results;
  }

  /**
   * Get line items grouped by category
   */
  async getLineItemsByCategory(proposalId: string): Promise<Map<PricingCategory, LineItem[]>> {
    const items = await this.getLineItems(proposalId);
    const grouped = new Map<PricingCategory, LineItem[]>();

    items.forEach(item => {
      if (!grouped.has(item.category)) {
        grouped.set(item.category, []);
      }
      grouped.get(item.category)!.push(item);
    });

    return grouped;
  }

  /**
   * Get subtotal by category
   */
  async getSubtotalByCategory(proposalId: string): Promise<Map<PricingCategory, number>> {
    const grouped = await this.getLineItemsByCategory(proposalId);
    const subtotals = new Map<PricingCategory, number>();

    grouped.forEach((items, category) => {
      const total = items.reduce((sum, item) => sum + item.total, 0);
      subtotals.set(category, total);
    });

    return subtotals;
  }

  /**
   * Apply discount to proposal
   */
  async applyDiscount(
    proposalId: string,
    discountPercent: number
  ): Promise<PricingSummary> {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new Error('Discount percent must be between 0 and 100');
    }

    return this.calculatePricingSummary(proposalId, 0, discountPercent);
  }

  /**
   * Apply tax to proposal
   */
  async applyTax(proposalId: string, taxRate: number): Promise<PricingSummary> {
    if (taxRate < 0 || taxRate > 100) {
      throw new Error('Tax rate must be between 0 and 100');
    }

    return this.calculatePricingSummary(proposalId, taxRate, 0);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
