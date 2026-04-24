// Firebase Configuration for readiness-command
// GCP Project: singular-silo-463000-j6

export const firebaseConfig = {
  projectId: 'singular-silo-463000-j6',
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: 'singular-silo-463000-j6.firebaseapp.com',
  storageBucket: 'singular-silo-463000-j6.appspot.com',
  messagingSenderId: '116121097012087457497',
  appId: '1:116121097012087457497:web:dummyappid',
  measurementId: 'G-DUMMYMEASUREID',
};

export const scoringWeights = {
  process_maturity: parseInt(process.env.SCORE_WEIGHT_PROCESS_MATURITY || '1'),
  data_readiness: parseInt(process.env.SCORE_WEIGHT_DATA_READINESS || '1'),
  tech_infrastructure: parseInt(process.env.SCORE_WEIGHT_TECH_INFRASTRUCTURE || '1'),
  team_capability: parseInt(process.env.SCORE_WEIGHT_TEAM_CAPABILITY || '1'),
  budget_alignment: parseInt(process.env.SCORE_WEIGHT_BUDGET_ALIGNMENT || '1'),
};

export const assessmentConfig = {
  expirationDays: parseInt(process.env.ASSESSMENT_EXPIRATION_DAYS || '30'),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  timezone: process.env.TIMEZONE || 'America/Denver',
};

