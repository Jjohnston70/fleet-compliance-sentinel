import { getSQL } from './chief-db';

/**
 * Ensures the invoice tables exist.
 * Three tables: invoices, invoice_line_items, invoice_work_descriptions
 */
export async function ensureInvoiceTables() {
  const sql = getSQL();

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id              SERIAL PRIMARY KEY,
      vendor          TEXT NOT NULL,
      invoice_date    DATE,
      po_number       TEXT,
      terms           TEXT,
      written_by      TEXT,
      customer_name   TEXT,
      customer_address TEXT,
      unit_number     TEXT,
      plate_number    TEXT,
      year            TEXT,
      make            TEXT,
      model           TEXT,
      mileage_hours   TEXT,
      vin             TEXT,
      engine          TEXT,
      parts_total     NUMERIC(10,2),
      labor_total     NUMERIC(10,2),
      shop_supplies   NUMERIC(10,2),
      subtotal        NUMERIC(10,2),
      sales_tax       NUMERIC(10,2),
      grand_total     NUMERIC(10,2),
      source_file     TEXT,
      imported_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invoice_line_items (
      id          SERIAL PRIMARY KEY,
      invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      page        INTEGER,
      qty         NUMERIC(10,4),
      description TEXT NOT NULL,
      unit_price  NUMERIC(10,2),
      amount      NUMERIC(10,2)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invoice_work_descriptions (
      id          SERIAL PRIMARY KEY,
      invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      page        INTEGER,
      work_text   TEXT NOT NULL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_vendor ON invoices (vendor)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_unit ON invoices (unit_number)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices (invoice_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON invoice_line_items (invoice_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_work_desc_invoice ON invoice_work_descriptions (invoice_id)`;
}

/**
 * Import a full invoice (header + line items + work descriptions).
 * Returns the new invoice ID.
 */
export async function importInvoice(data: {
  vendor: string;
  invoice_date: string | null;
  po_number: string;
  terms: string;
  written_by: string;
  customer_name: string;
  customer_address: string;
  unit_number: string;
  plate_number: string;
  year: string;
  make: string;
  model: string;
  mileage_hours: string;
  vin: string;
  engine: string;
  parts_total: number | null;
  labor_total: number | null;
  shop_supplies: number | null;
  subtotal: number | null;
  sales_tax: number | null;
  grand_total: number | null;
  source_file: string;
  line_items: Array<{
    page: number;
    qty: number;
    description: string;
    unit_price: number;
    amount: number;
  }>;
  work_descriptions: Array<{
    page: number;
    work_text: string;
  }>;
}): Promise<number> {
  const sql = getSQL();

  // Insert invoice header
  const result = await sql`
    INSERT INTO invoices (
      vendor, invoice_date, po_number, terms, written_by,
      customer_name, customer_address,
      unit_number, plate_number, year, make, model, mileage_hours, vin, engine,
      parts_total, labor_total, shop_supplies, subtotal, sales_tax, grand_total,
      source_file
    ) VALUES (
      ${data.vendor}, ${data.invoice_date}, ${data.po_number}, ${data.terms}, ${data.written_by},
      ${data.customer_name}, ${data.customer_address},
      ${data.unit_number}, ${data.plate_number}, ${data.year}, ${data.make}, ${data.model},
      ${data.mileage_hours}, ${data.vin}, ${data.engine},
      ${data.parts_total}, ${data.labor_total}, ${data.shop_supplies},
      ${data.subtotal}, ${data.sales_tax}, ${data.grand_total},
      ${data.source_file}
    )
    RETURNING id
  `;

  const invoiceId = result[0].id as number;

  // Insert line items
  for (const item of data.line_items) {
    await sql`
      INSERT INTO invoice_line_items (invoice_id, page, qty, description, unit_price, amount)
      VALUES (${invoiceId}, ${item.page}, ${item.qty}, ${item.description}, ${item.unit_price}, ${item.amount})
    `;
  }

  // Insert work descriptions
  for (const work of data.work_descriptions) {
    await sql`
      INSERT INTO invoice_work_descriptions (invoice_id, page, work_text)
      VALUES (${invoiceId}, ${work.page}, ${work.work_text})
    `;
  }

  return invoiceId;
}

/**
 * List all invoices (summary view).
 */
export async function listInvoices() {
  const sql = getSQL();
  return await sql`
    SELECT i.*,
      (SELECT COUNT(*)::int FROM invoice_line_items WHERE invoice_id = i.id) as line_item_count,
      (SELECT COUNT(*)::int FROM invoice_work_descriptions WHERE invoice_id = i.id) as work_desc_count
    FROM invoices i
    ORDER BY i.invoice_date DESC, i.imported_at DESC
  `;
}

/**
 * Get a full invoice with line items and work descriptions.
 */
export async function getInvoice(id: number) {
  const sql = getSQL();
  const invoices = await sql`SELECT * FROM invoices WHERE id = ${id}`;
  if (invoices.length === 0) return null;

  const lineItems = await sql`
    SELECT * FROM invoice_line_items WHERE invoice_id = ${id} ORDER BY page, id
  `;
  const workDescs = await sql`
    SELECT * FROM invoice_work_descriptions WHERE invoice_id = ${id} ORDER BY page, id
  `;

  return {
    ...invoices[0],
    line_items: lineItems,
    work_descriptions: workDescs,
  };
}

/**
 * Delete an invoice and all related records.
 */
export async function deleteInvoice(id: number) {
  const sql = getSQL();
  await sql`DELETE FROM invoices WHERE id = ${id}`;
}
