# Secret Rotation Execution Log

Date Opened: 2026-03-25
Owner: Jacob Johnston

| Secret | Service | Rotated At | Rotated By | Verification | Evidence Link |
|---|---|---|---|---|---|
| CLERK_SECRET_KEY | Clerk | Pending | Pending | Pending | Pending |
| DATABASE_URL | Neon | Pending | Pending | Pending | Pending |
| PENNY_API_KEY | Vercel/Railway | Pending | Pending | Pending | Pending |
| FLEET_COMPLIANCE_CRON_SECRET | Vercel | Pending | Pending | Pending | Pending |
| REVEAL_USERNAME | Railway | 2026-03-27 | Jacob Johnston | Set in Railway dashboard | telematics-credential-security.md |
| REVEAL_PASSWORD | Railway | 2026-03-27 | Jacob Johnston | Set in Railway dashboard | telematics-credential-security.md |
| REVEAL_APP_ID | Railway | 2026-03-27 | Jacob Johnston | Set in Railway dashboard | telematics-credential-security.md |
| APP_ENCRYPTION_KEY | Railway + Neon | 2026-03-27 | Jacob Johnston | pgcrypto key set in Railway + Neon ALTER DATABASE | telematics-credential-security.md |
| TELEMATICS_CRON_SECRET | Vercel | 2026-03-27 | Jacob Johnston | Generated via crypto.randomBytes(32) — set in Vercel dashboard (Production environment only) | telematics-credential-security.md |
