export interface AppConfig {
  firebase: {
    projectId: string;
    apiKey: string;
  };
  branding: {
    primary: string; // Navy #1a3a5c
    secondary: string; // Teal #3d8eb9
  };
  taxYear: number;
  multiEntity: boolean;
}

export const defaultConfig: AppConfig = {
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'financial-command-dev',
    apiKey: process.env.FIREBASE_API_KEY || '',
  },
  branding: {
    primary: '#1a3a5c',
    secondary: '#3d8eb9',
  },
  taxYear: new Date().getFullYear(),
  multiEntity: true,
};

export const getConfig = (): AppConfig => ({
  ...defaultConfig,
  taxYear: parseInt(process.env.TAX_YEAR || String(new Date().getFullYear()), 10),
});
