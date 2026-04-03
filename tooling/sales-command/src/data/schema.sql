-- Sales Command Module - PostgreSQL Schema
-- Designed for Neon PostgreSQL

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  category VARCHAR(100),
  unit_price NUMERIC(10,2),
  cost NUMERIC(10,2),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  segment VARCHAR(30),
  region VARCHAR(50),
  acquisition_date DATE,
  lifetime_value NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  product_id UUID REFERENCES products(id),
  customer_id UUID REFERENCES customers(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_revenue NUMERIC(12,2) NOT NULL,
  cost_of_goods NUMERIC(12,2),
  gross_profit NUMERIC(12,2) GENERATED ALWAYS AS (total_revenue - COALESCE(cost_of_goods, 0)) STORED,
  channel VARCHAR(30),
  sales_rep VARCHAR(255),
  region VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  period_type VARCHAR(10) NOT NULL,
  metric_name VARCHAR(50) NOT NULL,
  metric_value NUMERIC(14,2) NOT NULL,
  previous_value NUMERIC(14,2),
  change_pct NUMERIC(7,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, period_type, metric_name)
);

CREATE TABLE IF NOT EXISTS sales_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  predicted_revenue NUMERIC(12,2) NOT NULL,
  confidence_pct NUMERIC(5,2),
  model_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_records(date);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales_records(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_channel ON sales_records(channel);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_kpi_date_type ON kpi_snapshots(date, period_type);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
