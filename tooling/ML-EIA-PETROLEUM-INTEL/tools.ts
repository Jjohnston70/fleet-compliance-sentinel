export type ToolDef = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
};

export const petroleumTools: ToolDef[] = [
  {
    name: "get_price_forecast",
    description: "Return 30/60/90-day forecast with confidence intervals for a product.",
    input_schema: {
      type: "object",
      properties: {
        product: { type: "string", description: "heating_oil | crude | diesel | gasoline" },
        horizon: { type: "integer", enum: [30, 60, 90] },
      },
      required: ["product"],
    },
    output_schema: {
      type: "object",
      properties: {
        product: { type: "string" },
        generated_at: { type: "string" },
        horizon_days: {},
        forecast: { type: "array" },
        metrics: { type: "object" },
      },
    },
  },
  {
    name: "get_current_prices",
    description: "Return latest spot and retail prices.",
    input_schema: { type: "object", properties: {} },
    output_schema: { type: "object", properties: { prices: { type: "object" } } },
  },
  {
    name: "get_market_regime",
    description: "Return current market regime, volatility, momentum, and transition probability.",
    input_schema: { type: "object", properties: {} },
    output_schema: { type: "object", properties: { regime: { type: "object" } } },
  },
  {
    name: "get_spread_analysis",
    description: "Return OPIS vs cost basis spread analysis and strategy recommendation.",
    input_schema: { type: "object", properties: {} },
    output_schema: { type: "object", properties: { products: { type: "object" }, overall_recommendation: { type: "string" } } },
  },
  {
    name: "get_seasonal_outlook",
    description: "Return heating season profile, YoY comparison, and peak demand week.",
    input_schema: { type: "object", properties: {} },
    output_schema: { type: "object", properties: { seasonal: { type: "object" } } },
  },
  {
    name: "get_supplier_comparison",
    description: "Return supplier comparison summary when supplier dataset is available.",
    input_schema: { type: "object", properties: { product: { type: "string" } } },
    output_schema: { type: "object", properties: { suppliers: { type: "array" } } },
  },
  {
    name: "get_weather_impact",
    description: "Return weather-price correlation and cold snap impact estimate.",
    input_schema: { type: "object", properties: {} },
    output_schema: { type: "object", properties: { weather_correlation: { type: "object" } } },
  },
  {
    name: "get_colorado_retail",
    description: "Return latest Colorado retail gasoline and diesel series values.",
    input_schema: { type: "object", properties: {} },
    output_schema: { type: "object", properties: { colorado_retail: { type: "array" } } },
  },
  {
    name: "get_price_alerts",
    description: "Return active weekly-move, spread-deviation, and regime-transition alerts.",
    input_schema: { type: "object", properties: {} },
    output_schema: { type: "object", properties: { alert_count: { type: "integer" }, alerts: { type: "array" } } },
  },
  {
    name: "get_executive_summary",
    description: "Return a concise executive summary context block for Penny.",
    input_schema: { type: "object", properties: { max_chars: { type: "integer" } } },
    output_schema: { type: "object", properties: { summary: { type: "string" } } },
  },
];

