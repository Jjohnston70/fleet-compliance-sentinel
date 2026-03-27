# Subprocessors

Last Reviewed: 2026-03-27
Review Frequency: Quarterly and on any vendor change.

| Service | Purpose | Data Touched | Their Security Cert | Link |
|---|---|---|---|---|
| Vercel | Hosting/CDN for Next.js app and APIs | Request metadata, API payload transit | SOC 2 Type II | https://vercel.com/security/compliance |
| Neon | Primary Postgres database | Fleet-Compliance records, org lifecycle data | SOC 2 Type II | https://neon.tech/security |
| Clerk | Authentication and organizations | User identity, org membership metadata | SOC 2 Type II | https://clerk.com/security |
| Railway | Penny backend runtime | Query text and org context payload | None listed | https://railway.com/legal/security |
| Anthropic | LLM inference provider | Query text and org context payload | None listed | https://www.anthropic.com/security |
| OpenAI | Optional LLM inference provider | Query text and org context payload | SOC 2 Type II | https://openai.com/security-and-privacy |
| Google AI (Gemini) | Optional LLM inference provider | Query text and org context payload | Not verified in this registry | https://ai.google.dev/gemini-api/docs/privacy-and-security |
| Sentry | Error monitoring | Scrubbed errors and stack traces | SOC 2 Type II | https://sentry.io/security/ |
| Resend | Compliance reminder email delivery | Recipient email and message body | SOC 2 Type II | https://resend.com/security |
| Stripe | Billing and subscription events | Billing identifiers and event metadata | SOC 2 Type I/II | https://stripe.com/docs/security |
| Upstash | Distributed rate limiting backend | Rate-limit keys and counters | SOC 2 Type II | https://upstash.com/security |
| Datadog | Log management and monitoring | Structured audit logs and operational metrics | SOC 2 Type II | https://www.datadoghq.com/security/ |
| UptimeRobot | Public status page and uptime checks | Endpoint status and monitor metadata | None listed | https://uptimerobot.com/privacy |
| Verizon Connect (Fleetmatics) | Telematics data provider — vehicle GPS, driver roster, HOS/ELD status | Vehicle and driver operational data from client fleet accounts | No SOC 2 found — see compensating controls | https://www.verizonconnect.com/company/privacy/ |

## Compensating Controls for Non-SOC2 Vendors

Applies to Railway, Anthropic, and any provider without verified SOC 2 evidence.

1. Data minimization: only query text and org context IDs are sent.
2. Transport security: all traffic is HTTPS/TLS.
3. Secret controls: provider keys are rotated on a fixed schedule.
4. Endpoint controls: Railway CORS allowlist and signed backend API key.
5. Prompt controls: prompt injection filtering and fallback refusal policy.
6. Logging controls: request flow is audit-logged and monitored in Datadog/Sentry.

### Verizon Connect (Fleetmatics)

Verizon Connect provides telematics data (vehicle GPS, driver roster, HOS/ELD status, alerts, DVIR records) via their Reveal Integration Services REST API. No SOC 2 Type I or Type II report has been located for Verizon Connect. The following compensating controls mitigate this gap:

1. **Data direction**: Data flows FROM Verizon TO Fleet-Compliance Sentinel only. No customer PII is transmitted to Verizon. The only outbound data is authentication credentials issued by Verizon themselves (HTTP Basic Auth).
2. **Client consent**: Each client explicitly authorizes data access via Verizon Reveal Marketplace → API Integrations. The consent date is recorded in `telematics_credentials.consent_recorded_at` for audit trail.
3. **Credential isolation**: Per-org credentials stored encrypted via pgcrypto AES-256 (`pgp_sym_encrypt`). Credentials are never shared across tenants. Unique constraint `(org_id, provider)` enforced at database level.
4. **Credential revocation**: Clients can revoke integration access from their Reveal Marketplace dashboard at any time, immediately invalidating credentials. Fleet-Compliance Sentinel deactivates (does not delete) credential records on offboarding to preserve audit trail.
5. **Least privilege**: Integration credentials are read-only. No write operations are performed against the client's Verizon account. The integration can only read vehicle/driver/GPS/HOS data.
6. **Transport security**: All API calls to `fim.api.us.fleetmatics.com` use HTTPS/TLS. No plaintext HTTP communication.
7. **Token expiry**: Verizon bearer tokens expire after approximately 20 minutes. Tokens are refreshed per sync cycle and are not persisted.

## Vendor Management Procedure

1. Confirm security documentation before onboarding a new vendor.
2. Record cert status and data categories in this registry.
3. Document compensating controls for any vendor without SOC 2 evidence.
4. Re-verify links and certifications each quarter.
