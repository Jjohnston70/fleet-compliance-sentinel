export interface AppConfig {
  databaseUrl: string;
  appUrl: string;
  timezone: string;
  csvMaxRows: number;
}

export function loadConfig(): AppConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return {
    databaseUrl,
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    timezone: process.env.TIMEZONE || 'UTC',
    csvMaxRows: parseInt(process.env.CSV_MAX_ROWS || '10000', 10)
  };
}

export const config = loadConfig();
