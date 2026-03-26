# Secret Rotation Registry — PipelineX v2

> SOC2 CC6.1 / CC6.2 — Credential lifecycle management evidence
> > Phase 8 operational evidence | Maintained by: Jacob Johnston / Jjohnston70
> >
> > ## Rotation Schedule
> >
> > All production-critical secrets must be rotated at least every 90 days.
> > Emergency rotation is performed immediately on suspected compromise.
> >
> > ## Secret Status Registry
> >
> > | Secret | Service | Last Rotated | Rotated By | Next Due | Status |
> > |---|---|---|---|---|---|
> > | CLERK_SECRET_KEY | Clerk (Auth) | 2026-03-25 | Jacob Johnston | 2026-06-23 | ROTATED |
> > | DATABASE_URL | Neon (Postgres) | 2026-03-25 | Jacob Johnston | 2026-06-23 | ROTATED |
> > | PENNY_API_KEY | Railway FastAPI | 2026-03-25 | Jacob Johnston | 2026-06-23 | ROTATED |
> > | FLEET_COMPLIANCE_CRON_SECRET | Vercel Cron | 2026-03-25 | Jacob Johnston | 2026-06-23 | ROTATED |
> > | NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk (Auth) | Not recorded | — | — | PENDING |
> > | RESEND_API_KEY | Resend (Email) | Not recorded | — | — | PENDING |
> > | CHIEF_CRON_SECRET | Vercel Cron | Not recorded | — | — | PENDING |
> > | FMCSA_API_KEY | FMCSA API | Not recorded | — | — | PENDING |
> > | STRIPE_SECRET_KEY | Stripe | Not recorded | — | — | PENDING |
> >
> > ## Rotation Procedure
> >
> > 1. Generate new secret value in the issuing service.
> > 2. 2. Update the secret in all runtime environments (Vercel, Railway).
> >    3. 3. Deploy and verify application health (HTTP 200 from prod URL).
> >       4. 4. Revoke / disable the old credential in the issuing service.
> >          5. 5. Record rotation in this file and in `soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md`.
> >            
> >             6. ## Phase 8 Rotation Evidence
> >            
> >             7. Rotation of the four Phase 8 secrets was performed on **2026-03-25** as part of the SOC2 Phase 8 operational evidence cycle.
> >            
> >             8. See: `soc2-evidence/access-control/SECRET_ROTATION_EXECUTION_LOG.md` for full execution log with timestamps, verification evidence, and service links.
> >
> > ---
> > *Last updated: 2026-03-25 | Registry version: 8.0*
