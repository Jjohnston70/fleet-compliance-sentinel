import { query } from '../data/db';
export async function updateAllCustomerLifetimeValues() {
    const result = await query(`UPDATE customers SET lifetime_value = (
      SELECT COALESCE(SUM(sr.total_revenue), 0)
      FROM sales_records sr
      WHERE sr.customer_id = customers.id
    )`);
    return result.rowCount || 0;
}
export async function updateCustomerLifetimeValue(customerId) {
    await query(`UPDATE customers SET lifetime_value = (
      SELECT COALESCE(SUM(sr.total_revenue), 0)
      FROM sales_records sr
      WHERE sr.customer_id = $1
    ) WHERE id = $1`, [customerId]);
}
