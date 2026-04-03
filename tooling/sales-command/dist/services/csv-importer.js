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
function readField(record, candidates) {
    for (const candidate of candidates) {
        const value = record[candidate];
        if (value === undefined || value === null)
            continue;
        const normalized = String(value).trim();
        if (normalized.length > 0)
            return normalized;
    }
    return '';
}
function parseNumberField(value) {
    if (!value)
        return null;
    const parsed = Number.parseFloat(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
}
function parseIntegerField(value) {
    if (!value)
        return null;
    const parsed = Number.parseInt(value.replace(/,/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : null;
}
function isValidDateValue(value) {
    if (!value)
        return false;
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
}
export function validateSalesRecord(record, index) {
    const errors = [];
    const dateStr = readField(record, ['Date', 'date']);
    const productName = readField(record, ['Product', 'product', 'Product Name', 'product_name']);
    const revenueStr = readField(record, ['Revenue', 'revenue', 'Total Revenue', 'total_revenue', 'Sales', 'Amount', 'Total Sales']);
    const unitPriceStr = readField(record, ['Sales Price', 'sales_price', 'Unit Price', 'unit_price', 'Rate', 'rate']);
    const unitsSoldStr = readField(record, ['UnitsSold', 'unitsSold', 'Units Sold', 'units_sold', 'Qty', 'Quantity']);
    if (!dateStr) {
        errors.push(`Row ${index + 1}: Missing date field`);
    }
    else if (!isValidDateValue(dateStr)) {
        errors.push(`Row ${index + 1}: Invalid date "${dateStr}"`);
    }
    if (!productName) {
        errors.push(`Row ${index + 1}: Missing product field`);
    }
    const revenue = parseNumberField(revenueStr);
    const unitPrice = parseNumberField(unitPriceStr);
    const unitsSold = parseIntegerField(unitsSoldStr);
    if (revenue === null && unitPrice === null) {
        errors.push(`Row ${index + 1}: Missing revenue/price fields`);
    }
    else if (revenueStr && revenue === null) {
        errors.push(`Row ${index + 1}: Revenue must be a number`);
    }
    if (unitPriceStr && unitPrice === null) {
        errors.push(`Row ${index + 1}: Unit price must be a number`);
    }
    if (unitsSoldStr && (unitsSold === null || unitsSold <= 0)) {
        errors.push(`Row ${index + 1}: Units sold must be a positive integer`);
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
                    const dateStr = readField(record, ['Date', 'date']);
                    const productName = readField(record, ['Product', 'product', 'Product Name', 'product_name']);
                    const region = readField(record, ['Region', 'region']) || 'Unknown';
                    const channel = readField(record, ['Channel', 'channel']) || 'direct';
                    const salesRep = readField(record, ['SalesRep', 'salesRep', 'Sales Rep', 'sales_rep']);
                    const unitsSoldRaw = parseIntegerField(readField(record, ['UnitsSold', 'unitsSold', 'Units Sold', 'units_sold', 'Qty', 'Quantity']));
                    const revenueRaw = parseNumberField(readField(record, ['Revenue', 'revenue', 'Total Revenue', 'total_revenue', 'Sales', 'Amount', 'Total Sales']));
                    const unitPriceRaw = parseNumberField(readField(record, ['Sales Price', 'sales_price', 'Unit Price', 'unit_price', 'Rate', 'rate']));
                    const cogs = parseNumberField(readField(record, ['COGS', 'cogs', 'Cost Of Goods', 'cost_of_goods']));
                    const unitsSold = unitsSoldRaw && unitsSoldRaw > 0 ? unitsSoldRaw : 1;
                    const revenue = revenueRaw !== null && revenueRaw !== void 0 ? revenueRaw : (unitPriceRaw !== null ? unitPriceRaw * unitsSold : 0);
                    const unitPrice = unitPriceRaw !== null && unitPriceRaw !== void 0 ? unitPriceRaw : (unitsSold > 0 ? revenue / unitsSold : revenue);
                    if (!Number.isFinite(revenue) || revenue < 0) {
                        errors.push(`Row ${i + index + 1}: Revenue must be a non-negative number`);
                        continue;
                    }
                    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
                        errors.push(`Row ${i + index + 1}: Unit price must be a non-negative number`);
                        continue;
                    }
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [dateStr, productId, unitsSold, unitPrice, revenue, cogs, channel, salesRep, region]);
                    rowsInserted++;
                }
                catch (err) {
                    errors.push(`Row ${i + index + 1}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        }
        return {
            success: errors.length === 0 || rowsInserted > 0,
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
