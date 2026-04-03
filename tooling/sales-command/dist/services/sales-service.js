import { query } from '../data/db';
export async function createProduct(name, sku, category, unitPrice, cost) {
    const result = await query('INSERT INTO products (name, sku, category, unit_price, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, sku || null, category || null, unitPrice || null, cost || null]);
    return mapProductRow(result.rows[0]);
}
export async function getProducts(active) {
    let sql = 'SELECT * FROM products';
    const params = [];
    if (active !== undefined) {
        sql += ' WHERE active = $1';
        params.push(active);
    }
    sql += ' ORDER BY name';
    const result = await query(sql, params);
    return result.rows.map(mapProductRow);
}
export async function getProductById(id) {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows.length > 0 ? mapProductRow(result.rows[0]) : null;
}
export async function createCustomer(name, company, email, segment, region) {
    const result = await query('INSERT INTO customers (name, company, email, segment, region, acquisition_date) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING *', [name, company || null, email || null, segment || null, region || null]);
    return mapCustomerRow(result.rows[0]);
}
export async function getCustomers() {
    const result = await query('SELECT * FROM customers ORDER BY name');
    return result.rows.map(mapCustomerRow);
}
export async function getCustomerById(id) {
    const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows.length > 0 ? mapCustomerRow(result.rows[0]) : null;
}
export async function createSalesRecord(date, quantity, unitPrice, totalRevenue, productId, customerId, costOfGoods, channel, salesRep, region, notes) {
    const result = await query(`INSERT INTO sales_records 
    (date, product_id, customer_id, quantity, unit_price, total_revenue, cost_of_goods, channel, sales_rep, region, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`, [date, productId || null, customerId || null, quantity, unitPrice, totalRevenue, costOfGoods || null, channel || null, salesRep || null, region || null, notes || null]);
    const salesRecord = mapSalesRow(result.rows[0]);
    // Update customer lifetime value
    if (customerId) {
        await updateCustomerLifetimeValue(customerId);
    }
    return salesRecord;
}
export async function getSalesRecords(dateFrom, dateTo, productId, channel, region) {
    let sql = 'SELECT * FROM sales_records WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    if (dateFrom) {
        sql += ` AND date >= $${paramIndex++}`;
        params.push(dateFrom);
    }
    if (dateTo) {
        sql += ` AND date <= $${paramIndex++}`;
        params.push(dateTo);
    }
    if (productId) {
        sql += ` AND product_id = $${paramIndex++}`;
        params.push(productId);
    }
    if (channel) {
        sql += ` AND channel = $${paramIndex++}`;
        params.push(channel);
    }
    if (region) {
        sql += ` AND region = $${paramIndex++}`;
        params.push(region);
    }
    sql += ' ORDER BY date DESC';
    const result = await query(sql, params);
    return result.rows.map(mapSalesRow);
}
export async function getSalesRecordById(id) {
    const result = await query('SELECT * FROM sales_records WHERE id = $1', [id]);
    return result.rows.length > 0 ? mapSalesRow(result.rows[0]) : null;
}
export async function updateCustomerLifetimeValue(customerId) {
    await query(`UPDATE customers SET lifetime_value = (
      SELECT COALESCE(SUM(total_revenue), 0) FROM sales_records WHERE customer_id = $1
    ) WHERE id = $1`, [customerId]);
}
function mapProductRow(row) {
    return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        category: row.category,
        unitPrice: row.unit_price ? parseFloat(row.unit_price) : undefined,
        cost: row.cost ? parseFloat(row.cost) : undefined,
        active: row.active
    };
}
function mapCustomerRow(row) {
    return {
        id: row.id,
        name: row.name,
        company: row.company,
        email: row.email,
        segment: row.segment,
        region: row.region,
        lifetimeValue: row.lifetime_value ? parseFloat(row.lifetime_value) : 0
    };
}
function mapSalesRow(row) {
    return {
        id: row.id,
        date: row.date,
        productId: row.product_id,
        customerId: row.customer_id,
        quantity: row.quantity,
        unitPrice: parseFloat(row.unit_price),
        totalRevenue: parseFloat(row.total_revenue),
        costOfGoods: row.cost_of_goods ? parseFloat(row.cost_of_goods) : undefined,
        grossProfit: row.gross_profit ? parseFloat(row.gross_profit) : undefined,
        channel: row.channel,
        salesRep: row.sales_rep,
        region: row.region,
        notes: row.notes
    };
}
