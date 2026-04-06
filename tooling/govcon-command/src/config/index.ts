/**
 * Central configuration for govcon-command
 * Brand colors, company info, and operational thresholds
 */

export const COMPANY_CONFIG = {
  name: "True North Data Strategies LLC",
  owner: "Jacob Johnston",
  address: "123 Example St, Anytown, CO 80000",
  phone: "555-555-5555",
  email: "jacob@truenorthstrategyops.com",
  uei: process.env.UEI || "pending",
  cageCode: process.env.CAGE_CODE || "pending",
  website: "https://truenorthstrategyops.com",
};

export const BRAND_COLORS = {
  primary: {
    name: "Navy",
    light: "#1a3a5c",
    dark: "#0a1a2d",
  },
  secondary: {
    name: "Teal",
    standard: "#3d8eb9",
    light: "#5ca8cc",
  },
  neutral: {
    lightGray: "#cccccc",
    darkGray: "#333333",
    white: "#ffffff",
  },
};

export const FONTS = {
  headers: "Montserrat",
  body: "Open Sans",
};

export const BID_DECISION_THRESHOLDS = {
  highRecommendation: 70,
  conditional: 40,
  noRecommendation: 0,
};

export const COMPLIANCE_REMINDER_DAYS = {
  warning90: 90,
  warning60: 60,
  warning30: 30,
  warning7: 7,
};

export const DEADLINE_ALERT_DAYS = {
  week: 7,
  threeDay: 3,
  oneDay: 1,
};

export const MICRO_PURCHASE_THRESHOLD = 10_000;
export const SMALL_BUSINESS_THRESHOLD = 250_000;
