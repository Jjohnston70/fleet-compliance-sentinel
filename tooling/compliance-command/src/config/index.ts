import { DEFAULT_TIMEZONE } from "./module-config.js";

export type ComplianceConfig = {
  nodeEnv: string;
  timezone: string;
  apiKey: string | null;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ComplianceConfig {
  return {
    nodeEnv: env.NODE_ENV ?? "development",
    timezone: env.TZ ?? DEFAULT_TIMEZONE,
    apiKey: env.COMPLIANCE_API_KEY ?? null,
  };
}
