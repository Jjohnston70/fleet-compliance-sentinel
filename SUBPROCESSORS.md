# Subprocessors

Last Reviewed: 2026-03-25
Review Frequency: Quarterly and after any new vendor onboarding.

| Service | Purpose | Data Touched | Their Security Cert | Link |
|---|---|---|---|---|
| Vercel | Hosting/CDN | Request/response | SOC 2 Type II | https://vercel.com/security/compliance |
| Neon | Database | All Fleet-Compliance records | SOC 2 Type II | https://neon.tech/security |
| Clerk | Auth | User/org identity | SOC 2 Type II | https://clerk.com/security |
| Railway | AI Backend | Query + org context | None listed | https://railway.com/legal/security |
| Anthropic | LLM | Query + org context | — | https://www.anthropic.com/security |
| Sentry | Error tracking | Errors (scrubbed) | SOC 2 Type II | https://sentry.io/security/ |

## Vendor Management Notes

- Penny requests are scoped by org context and policy controls before external processing.
- Error payloads sent to Sentry are scrubbed to avoid direct PII leakage.
- Security certifications and processor terms must be re-validated during annual risk review.
