// Central configuration for dispatch-command service

export const APP_CONFIG = {
  name: 'dispatch-command',
  version: '1.0.0',
  branding: {
    primary: '#1a3a5c', // Navy
    secondary: '#3d8eb9', // Teal
  },
};

export const DISPATCH_CONFIG = {
  maxJobsPerDriver: parseInt(process.env.MAX_JOBS_PER_DRIVER || '8'),
  defaultTravelSpeedMph: parseInt(process.env.DEFAULT_TRAVEL_SPEED_MPH || '30'),
};

export const FIREBASE_CONFIG = {
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.FIREBASE_DATABASE_URL || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
};
