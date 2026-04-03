/**
 * Pricing Service - Line Item & Calculation Management
 */
export class PricingService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Add line item to proposal
     */
    async addLineItem(proposalId, description, quantity, unitPrice, category, order) {
        const existingItems = await this.repository.listLineItems(proposalId);
        const nextOrder = order ?? existingItems.length + 1;
        const item = {
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
    async getLineItem(id) {
        return this.repository.getLineItem(id);
    }
    /**
     * Get all line items for a proposal
     */
    async getLineItems(proposalId) {
        return this.repository.listLineItems(proposalId);
    }
    /**
     * Update line item
     */
    async updateLineItem(id, updates) {
        const item = await this.getLineItem(id);
        if (!item)
            throw new Error(`Line item not found: ${id}`);
        const updated = {
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
    async deleteLineItem(id) {
        await this.repository.deleteLineItem(id);
    }
    /**
     * Calculate pricing summary for a proposal
     */
    async calculatePricingSummary(proposalId, taxRate = 0, discountPercent = 0) {
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
    async addLineItems(proposalId, items) {
        const results = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const lineItem = await this.addLineItem(proposalId, item.description, item.quantity, item.unitPrice, item.category, i + 1);
            results.push(lineItem);
        }
        return results;
    }
    /**
     * Get line items grouped by category
     */
    async getLineItemsByCategory(proposalId) {
        const items = await this.getLineItems(proposalId);
        const grouped = new Map();
        items.forEach(item => {
            if (!grouped.has(item.category)) {
                grouped.set(item.category, []);
            }
            grouped.get(item.category).push(item);
        });
        return grouped;
    }
    /**
     * Get subtotal by category
     */
    async getSubtotalByCategory(proposalId) {
        const grouped = await this.getLineItemsByCategory(proposalId);
        const subtotals = new Map();
        grouped.forEach((items, category) => {
            const total = items.reduce((sum, item) => sum + item.total, 0);
            subtotals.set(category, total);
        });
        return subtotals;
    }
    /**
     * Apply discount to proposal
     */
    async applyDiscount(proposalId, discountPercent) {
        if (discountPercent < 0 || discountPercent > 100) {
            throw new Error('Discount percent must be between 0 and 100');
        }
        return this.calculatePricingSummary(proposalId, 0, discountPercent);
    }
    /**
     * Apply tax to proposal
     */
    async applyTax(proposalId, taxRate) {
        if (taxRate < 0 || taxRate > 100) {
            throw new Error('Tax rate must be between 0 and 100');
        }
        return this.calculatePricingSummary(proposalId, taxRate, 0);
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
