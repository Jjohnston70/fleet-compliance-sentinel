import { parse } from 'csv-parse/sync';
import { query } from '../data/db';
export async function parseCSV(content, hasHeader = true) {
    const records = parse(content, {
        columns: hasHeader,
        skip_empty_lines: true,
        trim: true,
        cast: false
    });
    return records;
}
export function validateSalesRecord(record, index) {
    const errors = [];
    if (!record.Date && !record.date) {
        errors.push(`Row ${index + 1}: Missing date field`);
    }
    if (!record.Product && !record.product) {
        errors.push(`Row ${index + 1}: Missing product field`);
    }
    if (!record.Revenue && record.revenue === undefined) {
        errors.push(`Row ${index + 1}: Missing revenue field`);
    }
    else if (isNaN(parseFloat(String(record.Revenue || record.revenue || 0)))) {
        errors.push(`Row ${index + 1}: Revenue must be a number`);
    }
    if (!record.Region && !record.region) {
        errors.push(`Row ${index + 1}: Missing region field`);
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
export async function importSalesData(csvContent) {
    const errors = [];
    let rowsInserted = 0;
    try {
        const records = await parseCSV(csvContent, true);
        if (records.length === 0) {
            return { success: false, rowsProcessed: 0, rowsInserted: 0, errors: ['CSV file is empty'] };
        }
        // Process in batches
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            for (const [index, record] of batch.entries()) {
                const validation = validateSalesRecord(record, i + index);
                if (!validation.valid) {
                    errors.push(...validation.errors);
                    continue;
                }
                try {
                    const dateStr = String(record.Date || record.date || '').trim();
                    const productName = String(record.Product || record.product || '').trim();
                    const revenue = parseFloat(String(record.Revenue || record.revenue || 0));
                    const region = String(record.Region || record.region || '').trim();
                    const channel = String(record.Channel || record.channel || '').trim();
                    const salesRep = String(record.SalesRep || record.salesRep || record['Sales Rep'] || '').trim();
                    const unitsSold = parseInt(String(record.UnitsSold || record.unitsSold || record['Units Sold'] || 0), 10);
                    const cogs = record.COGS || record.cogs ? parseFloat(String(record.COGS || record.cogs)) : null;
                    // Try to get or create product
                    let productId = null;
                    const productResult = await query('SELECT id FROM products WHERE name = $1', [productName]);
                    if (productResult.rows.length > 0) {
                        productId = productResult.rows[0].id;
                    }
                    else {
                        const insertResult = await query('INSERT INTO products (name, category) VALUES ($1, $2) RETURNING id', [productName, 'Imported']);
                        productId = insertResult.rows[0].id;
                    }
                    // Insert sales record
                    await query(`INSERT INTO sales_records 
            (date, product_id, quantity, unit_price, total_revenue, cost_of_goods, channel, sales_rep, region)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [dateStr, productId, unitsSold, revenue / unitsSold, revenue, cogs, channel, salesRep, region]);
                    rowsInserted++;
                }
                catch (err) {
                    errors.push(`Row ${i + index + 1}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        }
        return {
            success: errors.length === 0,
            rowsProcessed: records.length,
            rowsInserted,
            errors
        };
    }
    catch (err) {
        return {
            success: false,
            rowsProcessed: 0,
            rowsInserted: 0,
            errors: [err instanceof Error ? err.message : String(err)]
        };
    }
}
