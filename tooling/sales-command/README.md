# Sales Command Module

TNDS standalone command module for sales analytics, CSV import, and revenue forecasting powered by Neon PostgreSQL.

## Overview

Sales Command is a full-stack Next.js 14 module designed to:

- Import and analyze sales data from CSV files
- Calculate KPIs: total revenue, average deal size, conversion rates, gross profit margins
- Generate trend analysis across daily, weekly, monthly, and quarterly periods
- Compare performance between time periods (YoY, MoM, WoW)
- Forecast revenue using moving average models
- Provide LLM-accessible tools for AI-powered sales analytics

## Architecture

### Data Layer (src/data/)
- **schema.sql**: PostgreSQL database schema with 6 core tables
- **db.ts**: Connection pooling and query interface for Neon PostgreSQL

### Logic Layer (src/services/)
- **analytics-engine.ts**: KPI calculations, trend aggregation, period comparison
- **csv-importer.ts**: CSV parsing, validation, batch inserts
- **sales-service.ts**: CRUD operations for products, customers, sales records
- **forecast-service.ts**: Moving average forecasting

### Automation Hooks (src/hooks/)
- **kpi-snapshot.ts**: Daily/weekly/monthly/quarterly KPI calculation and storage
- **lifetime-value-updater.ts**: Customer lifetime value recalculation

### Reporting (src/reporting/)
- **trend-data.ts**: Time series aggregation for charts
- **period-comparison.ts**: YoY, MoM comparison metrics
- **top-performers.ts**: Top products and channels by revenue

### LLM Tools (src/tools.ts)
Six tools accessible to Claude and other LLMs:
- `get_sales_trend`: Trend data with grouping (daily/weekly/monthly)
- `compare_periods`: Period-over-period comparison
- `forecast_revenue`: Moving average forecasts
- `import_csv`: Batch CSV import
- `get_top_products`: Top products by revenue
- `get_kpi_summary`: KPI dashboard data
- `get_channel_breakdown`: Sales by channel

## Database Schema

### Tables
- **products**: Catalog of products (name, SKU, cost, pricing)
- **customers**: Customer records (name, segment, lifetime_value)
- **sales_records**: Individual transactions with gross_profit calculated column
- **kpi_snapshots**: Historical KPI data for dashboarding
- **sales_forecasts**: Predicted revenue with confidence intervals

## Installation

### Prerequisites
- Node.js 18+
- Neon PostgreSQL account
- npm or yarn

### Setup

1. Clone and install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your Neon DATABASE_URL
```

3. Initialize database:
```bash
npm run db:migrate
```

4. (Optional) Seed sample data:
```bash
npm run db:seed
```

## API Routes

### Sales Data
- `GET/POST /api/sales` - List and create sales records
  - Query: `dateFrom`, `dateTo`, `channel`, `productId`
  - Body: `date`, `quantity`, `unitPrice`, `totalRevenue`, `costOfGoods`, `channel`, `region`

- `GET /api/sales/analytics` - KPI summary
  - Query: `period` (daily/weekly/monthly/quarterly), `date`

- `GET /api/sales/trends` - Time series data
  - Query: `dateFrom`, `dateTo`, `groupBy` (daily/weekly/monthly)

- `GET /api/sales/comparison` - Period comparison
  - Query: `p1Start`, `p1End`, `p2Start`, `p2End`

- `POST /api/sales/import` - CSV import
  - Body: `csvContent` (raw text), `hasHeader` (boolean)

### Products
- `GET/POST /api/products` - Product management

### Customers
- `GET/POST /api/customers` - Customer management

### Forecasting
- `GET /api/forecasts` - Revenue forecasts
  - Query: `monthsAhead`, `productId`

## CSV Import Format

Expected columns (case-insensitive):
```
Date,Product,Region,SalesRep,Channel,Revenue,UnitsSold,[COGS]
2023-01-01,Product A,North,John Smith,Direct,5000,50,[1500]
```

Supported columns:
- **Date** (required): YYYY-MM-DD format
- **Product** (required): Product name
- **Region** (required): Geographic region
- **SalesRep**: Sales representative name
- **Channel** (required): direct, online, partner, referral
- **Revenue** (required): Total revenue amount
- **UnitsSold** (required): Quantity sold
- **COGS** (optional): Cost of goods sold

## LLM Tool Usage

All tools accessible via src/tools.ts. Example:

```typescript
const trends = await tools[0].handler({
  date_from: '2023-01-01',
  date_to: '2023-12-31',
  group_by: 'monthly'
});
```

## Testing

Run test suite:
```bash
npm test
```

Tests included:
- Analytics engine KPI calculations and period aggregation
- CSV parsing and validation
- Edge cases (empty data, invalid formats, missing fields)

## Deployment

Deploy to Vercel:
```bash
vercel deploy
```

Environment variables on Vercel:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `APP_URL` - Production URL
- `TIMEZONE` - Server timezone (default: UTC)
- `CSV_MAX_ROWS` - Max CSV import size (default: 10000)

## Development

Start dev server:
```bash
npm run dev
```

Type checking:
```bash
npm run type-check
```

Build:
```bash
npm run build
npm start
```

## Key Metrics

The module calculates:

### Standard KPIs
- **Total Revenue**: Sum of all sales
- **Average Deal Size**: Mean transaction value
- **Units Sold**: Total units across period
- **Gross Profit**: Revenue minus COGS
- **Gross Margin %**: Gross profit / revenue
- **Conversion Rate**: Transactions / total activities

### Period Comparisons
- Period-over-period revenue change (%)
- Deal size trends
- Profit margin changes
- Absolute dollar changes

### Segmentation
- By product/SKU
- By sales channel (direct, online, partner, referral)
- By region
- By sales representative
- By customer segment

## Notes

- Gross profit is a generated column (calculated at insert time)
- Customer lifetime_value updates automatically after each sale
- All currency fields use NUMERIC(12,2) for precision
- Time periods: daily, weekly (Mon-Sun), monthly, quarterly
- Timezone handling via environment variable
- CSV import supports up to 10,000 rows per batch

## Support

For issues or questions, contact True North Data Strategies support.
