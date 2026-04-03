import { query } from '../data/db';

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  unitPrice?: number;
  cost?: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  segment?: string;
  region?: string;
  lifetimeValue: number;
}

export interface SalesRecord {
  id: string;
  date: string;
  productId?: string;
  customerId?: string;
  quantity: number;
  unitPrice: number;
  totalRevenue: number;
  costOfGoods?: number;
  grossProfit?: number;
  channel?: string;
  salesRep?: string;
  region?: string;
  notes?: string;
}

export async function createProduct(name: string, sku?: string, category?: string, unitPrice?: number, cost?: number): Promise<Product> {
  const result = await query(
    'INSERT INTO products (name, sku, category, unit_price, cost) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, sku || null, category || null, unitPrice || null, cost || null]
  );
  
  return mapProductRow(result.rows[0]);
}

export async function getProducts(active?: boolean): Promise<Product[]> {
  let sql = 'SELECT * FROM products';
  const params: any[] = [];
  
  if (active !== undefined) {
    sql += ' WHERE active = $1';
    params.push(active);
  }
  
  sql += ' ORDER BY name';
  
  const result = await query(sql, params);
  return result.rows.map(mapProductRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows.length > 0 ? mapProductRow(result.rows[0]) : null;
}

export async function createCustomer(name: string, company?: string, email?: string, segment?: string, region?: string): Promise<Customer> {
  const result = await query(
    'INSERT INTO customers (name, company, email, segment, region, acquisition_date) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING *',
    [name, company || null, email || null, segment || null, region || null]
  );
  
  return mapCustomerRow(result.rows[0]);
}

export async function getCustomers(): Promise<Customer[]> {
  const result = await query('SELECT * FROM customers ORDER BY name');
  return result.rows.map(mapCustomerRow);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const result = await query('SELECT * FROM customers WHERE id = $1', [id]);
  return result.rows.length > 0 ? mapCustomerRow(result.rows[0]) : null;
}

export async function createSalesRecord(
  date: string,
  quantity: number,
  unitPrice: number,
  totalRevenue: number,
  productId?: string,
  customerId?: string,
  costOfGoods?: number,
  channel?: string,
  salesRep?: string,
  region?: string,
  notes?: string
): Promise<SalesRecord> {
  const result = await query(
    `INSERT INTO sales_records 
    (date, product_id, customer_id, quantity, unit_price, total_revenue, cost_of_goods, channel, sales_rep, region, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [date, productId || null, customerId || null, quantity, unitPrice, totalRevenue, costOfGoods || null, channel || null, salesRep || null, region || null, notes || null]
  );
  
  const salesRecord = mapSalesRow(result.rows[0]);
  
  // Update customer lifetime value
  if (customerId) {
    await updateCustomerLifetimeValue(customerId);
  }
  
  return salesRecord;
}

export async function getSalesRecords(
  dateFrom?: string,
  dateTo?: string,
  productId?: string,
  channel?: string,
  region?: string
): Promise<SalesRecord[]> {
  let sql = 'SELECT * FROM sales_records WHERE 1=1';
  const params: any[] = [];
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

export async function getSalesRecordById(id: string): Promise<SalesRecord | null> {
  const result = await query('SELECT * FROM sales_records WHERE id = $1', [id]);
  return result.rows.length > 0 ? mapSalesRow(result.rows[0]) : null;
}

export async function updateCustomerLifetimeValue(customerId: string): Promise<void> {
  await query(
    `UPDATE customers SET lifetime_value = (
      SELECT COALESCE(SUM(total_revenue), 0) FROM sales_records WHERE customer_id = $1
    ) WHERE id = $1`,
    [customerId]
  );
}

function mapProductRow(row: any): Product {
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

function mapCustomerRow(row: any): Customer {
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

function mapSalesRow(row: any): SalesRecord {
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
