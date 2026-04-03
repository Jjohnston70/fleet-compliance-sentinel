import { describe, it, expect } from 'vitest';
import { parseCSV, validateSalesRecord } from '../src/services/csv-importer';
describe('CSV Importer', () => {
    describe('parseCSV', () => {
        it('should parse CSV content with header', async () => {
            const csv = `Date,Product,Region,Channel,Revenue
2023-01-01,Product A,North,Direct,5000
2023-01-02,Product B,South,Online,3000`;
            const records = await parseCSV(csv, true);
            expect(records.length).toBe(2);
            expect(records[0].Date).toBe('2023-01-01');
            expect(records[0].Product).toBe('Product A');
        });
        it('should handle CSV with empty lines', async () => {
            const csv = `Date,Product,Revenue
2023-01-01,Product A,5000

2023-01-02,Product B,3000`;
            const records = await parseCSV(csv, true);
            expect(records.length).toBe(2);
        });
        it('should trim whitespace from values', async () => {
            const csv = `Date,Product
2023-01-01, Product A 
2023-01-02, Product B `;
            const records = await parseCSV(csv, true);
            expect(records[0].Product).toBe('Product A');
            expect(records[1].Product).toBe('Product B');
        });
    });
    describe('validateSalesRecord', () => {
        it('should validate a complete record', () => {
            const record = {
                date: '2023-01-01',
                product: 'Product A',
                region: 'North',
                revenue: '5000',
                channel: 'Direct'
            };
            const validation = validateSalesRecord(record, 0);
            expect(validation.valid).toBe(true);
            expect(validation.errors.length).toBe(0);
        });
        it('should detect missing required fields', () => {
            const record = {
                product: 'Product A',
                region: 'North'
            };
            const validation = validateSalesRecord(record, 0);
            expect(validation.valid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });
        it('should detect invalid revenue format', () => {
            const record = {
                date: '2023-01-01',
                product: 'Product A',
                region: 'North',
                revenue: 'not-a-number',
                channel: 'Direct'
            };
            const validation = validateSalesRecord(record, 0);
            expect(validation.valid).toBe(false);
            expect(validation.errors.some(e => e.includes('Revenue'))).toBe(true);
        });
        it('should accept case-insensitive field names', () => {
            const record = {
                Date: '2023-01-01',
                Product: 'Product A',
                Region: 'North',
                Revenue: '5000'
            };
            const validation = validateSalesRecord(record, 0);
            expect(validation.valid).toBe(true);
        });
    });
});
