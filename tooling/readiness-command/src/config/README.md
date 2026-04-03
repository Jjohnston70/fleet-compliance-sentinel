# Configuration

Configuration management for readiness-command module.

## Files

### firebase-config.ts

Firebase/Firestore connection and scoring weights.

```typescript
export const firebaseConfig = {
  projectId: 'singular-silo-463000-j6',
  // ... other Firebase config
};

export const scoringWeights = {
  process_maturity: 1,
  data_readiness: 1,
  tech_infrastructure: 1,
  team_capability: 1,
  budget_alignment: 1,
};

export const assessmentConfig = {
  expirationDays: 30,
  appUrl: 'http://localhost:3000',
  timezone: 'America/Denver',
};
```

## Environment Variables

Set in `.env` or environment:

```env
# Firebase
FIREBASE_PROJECT_ID=singular-silo-463000-j6
FIREBASE_SERVICE_ACCOUNT_KEY=./config/firebase-service-account.json

# App
APP_URL=http://localhost:3000
TIMEZONE=America/Denver

# Scoring
SCORE_WEIGHT_PROCESS_MATURITY=1
SCORE_WEIGHT_DATA_READINESS=1
SCORE_WEIGHT_TECH_INFRASTRUCTURE=1
SCORE_WEIGHT_TEAM_CAPABILITY=1
SCORE_WEIGHT_BUDGET_ALIGNMENT=1

# Assessment
ASSESSMENT_EXPIRATION_DAYS=30
```

## Firebase Project

**GCP Project**: singular-silo-463000-j6

This is the active Firebase project for the readiness-command module.

### Collections

- **assessments**
- **clients**
- **questions**
- **responses**
- **recommendations**
- **templates**

## Customization

To customize scoring:

1. Update environment variables
2. Or modify `scoringWeights` object in firebase-config.ts
3. Weights are applied in `ScoringEngine.calculateAssessmentScore()`

To extend configuration:

1. Add new properties to config objects
2. Export from firebase-config.ts
3. Import and use in services
