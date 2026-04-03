# Automation Hooks

Scheduled tasks for readiness-command module.

## Hooks

### expiration-checker.ts

- **Schedule**: Daily (e.g., 02:00 UTC)
- **Function**: Expire assessments where `expiresAt < now AND status = 'in_progress'`
- **Action**: Set status to 'expired'

Example:

```typescript
export async function checkExpiredAssessments() {
  const expiredIds = assessmentService.expireOldAssessments();
  if (expiredIds.length > 0) {
    console.log(`Expired ${expiredIds.length} assessments`);
  }
}
```

### reminder-sender.ts

- **Schedule**: Daily (e.g., 09:00 UTC)
- **Function**: Find assessments in_progress for > 7 days
- **Action**: Send email reminder to assessor
- **Data**: Assessment ID, client info, next steps

Example:

```typescript
export async function sendReminderEmails() {
  const inProgressAssessments = repository
    .getAllAssessments()
    .filter(a => {
      const days = (Date.now() - a.startedAt.getTime()) / (1000 * 60 * 60 * 24);
      return a.status === 'in_progress' && days > 7;
    });

  for (const assessment of inProgressAssessments) {
    await sendEmail({
      to: assessment.assessorEmail,
      subject: `Assessment ${assessment.id} requires attention`,
      body: `This assessment has been in progress for ${days} days...`
    });
  }
}
```

## Implementation

Use Cloud Functions or serverless functions (AWS Lambda, Google Cloud Functions):

1. Create trigger/schedule
2. Authenticate to Firestore
3. Execute service method
4. Log results

Deploy as:
- Vercel Cron Functions
- Google Cloud Scheduler + Functions
- AWS EventBridge + Lambda
