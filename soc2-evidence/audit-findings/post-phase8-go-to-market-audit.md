# Post-Phase 8 Go-to-Market Audit Findings

**Audit Date**: 2026-03-26
**Auditor**: Claude Opus 4.6 (automated code review)
**Scope**: All commits from go-to-market sprint — Stripe integration, landing page, PDF upload, spend dashboard, sidebar navigation, Penny no-org hardening
**Commits Reviewed**: `bac1ee7`, `440b104`, `62fe345`, `1bf5474`, `ce5f42d`, `8efc7f4`, `bc71a67`, `194885b`, `a0667ce`

---

**Overall Score**: 9/10
**Pass/Conditional Pass/Fail**: Pass
**Blocker Count**: 0

---

## Feature Audit Summary

### 1. Stripe Checkout Flow (`bac1ee7`)

| Control | Status | Evidence |
|---------|--------|----------|
| Clerk auth on checkout | PASS | `requireFleetComplianceOrg` with `allowCanceled: true` |
| Stripe customer creation | PASS | Creates via `stripe.customers.create` with org metadata |
| Price ID validation | PASS | Allowlist of `STRIPE_STARTER_PRICE_ID` and `STRIPE_PRO_PRICE_ID` only |
| Billing portal auth | PASS | `requireFleetComplianceOrg` + lookup `stripe_customer_id` from DB |
| Webhook signature verification | PASS | Existing HMAC-SHA256 handler unchanged |
| Audit logging | PASS | `org.subscription.checkout_started` and `org.subscription.portal_session_created` events |
| SQL injection | PASS | Parameterized queries via `getSQL()` |
| Secret management | PASS | `STRIPE_SECRET_KEY` in env vars, not in code |

### 2. Landing Page Update (`bac1ee7`)

| Control | Status | Evidence |
|---------|--------|----------|
| No auth bypass | PASS | Public page, no protected data rendered |
| Pricing accuracy | PASS | Matches Stripe products ($149/$299) |
| No PII exposure | PASS | Static marketing content only |

### 3. CSP Worker-src Fix (`62fe345`)

| Control | Status | Evidence |
|---------|--------|----------|
| CSP compliance | PASS | Added `worker-src 'self' blob:` — minimal scope for Clerk workers |
| No CSP weakening | PASS | `script-src` unchanged, `worker-src` is a narrower directive |

### 4. Import Validator Relaxation (`1bf5474`)

| Control | Status | Evidence |
|---------|--------|----------|
| Medical Card Expiry | PASS | Removed past-date rejection — historical imports need expired dates for tracking |
| Permit Type | PASS | Accept any value — fleet operators have jurisdiction-specific types |
| CDL Class normalization | PASS | Already handled "Class A" → "A", just trimmed whitespace |
| Data integrity | PASS | Required fields, date format, email format validation still enforced |

### 5. PDF Invoice Upload (`8efc7f4`, `ce5f42d`)

| Control | Status | Evidence |
|---------|--------|----------|
| Auth | PASS | `requireFleetComplianceOrg` before file processing |
| File size limit | PASS | 10 MB max enforced (`ce5f42d`) |
| File type validation | PASS | MIME type + extension check |
| Data handling | PASS | Raw PDF text not stored in DB, only extracted fields |
| Audit logging | PASS | `invoice.pdf_parsed` event with metadata (no file content) |
| Error handling | PASS | Generic error message, no internal details leaked |

### 6. Spend Dashboard (`8efc7f4`, `bc71a67`)

| Control | Status | Evidence |
|---------|--------|----------|
| Auth | PASS | `requireFleetComplianceOrg` on API route |
| Org isolation | PASS | All queries `WHERE org_id = ${orgId}` parameterized |
| Soft-delete exclusion | PASS | `AND deleted_at IS NULL` on all queries |
| PII | PASS | Response contains only aggregated amounts, asset IDs, vendor names |
| Asset detail page | PASS | Auth via `auth()`, org-scoped queries, error boundary |

### 7. Penny Context Extension (`8efc7f4`)

| Control | Status | Evidence |
|---------|--------|----------|
| PII exclusion | PASS | Asset IDs, vendor names, amounts, dates only — no employee names/emails |
| Context cap | PASS | 12,000 chars with oldest-entry trimming |
| Org scoping | PASS | `loadFleetComplianceData(orgId)` and `loadFleetComplianceInvoices(orgId)` |
| Section limits | PASS | 20-item cap on maintenance and invoices |

### 8. Sidebar Navigation (`bc71a67`)

| Control | Status | Evidence |
|---------|--------|----------|
| Auth enforcement | PASS | Layout.tsx: `auth()` → redirect if no userId/orgId |
| Plan gating | PASS | `getOrgPlan()` blocks expired/canceled before rendering |
| Onboarding gate | PASS | `FleetComplianceOnboardingRedirect` wraps shell |
| XSS | PASS | Static navigation links, no user input rendered |
| Accessibility | PASS | `aria-label`, `aria-expanded`, semantic `<nav>`, `<aside>` |
| Mobile responsive | PASS | Hamburger toggle, backdrop overlay, auto-close on navigation |

### 9. Penny No-Org Hardening (`194885b`, `a0667ce`)

| Control | Status | Evidence |
|---------|--------|----------|
| Env gate default | PASS | `PENNY_ALLOW_NO_ORG=false` in production (line 17-24) |
| Admin-only restriction | PASS | Non-admin users get 403 in no-org mode (line 173) |
| Tenant isolation | PASS | `buildOrgContext()` only called with valid orgId; empty when no org |
| CFR-only retrieval | PASS | No org data in no-org mode retrieval results |
| Audit traceability | PASS | `contextMode: 'org' | 'no-org'` in all audit events |
| Rate limiting | PASS | Still enforced per-user regardless of org mode |
| Documentation | PASS | `.env.example` documents `PENNY_ALLOW_NO_ORG=false` |

---

## Invoice Import Schema (`bc71a67`)

| Control | Status | Evidence |
|---------|--------|----------|
| Schema validation | PASS | Required fields, date validation, category/status enums |
| Import pipeline | PASS | Uses existing validated pipeline — same auth, batch tracking, rollback |
| Template inclusion | PASS | Invoices sheet auto-included in bulk template download |

---

## New Environment Variables Added

| Variable | Where Set | Sensitivity | Rotation |
|----------|-----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Vercel | High | 90-day cycle |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Vercel | Low (public) | With secret key |
| `STRIPE_WEBHOOK_SECRET` | Vercel | High | On endpoint recreation |
| `STRIPE_STARTER_PRICE_ID` | Vercel | Low (identifier) | On product change |
| `STRIPE_PRO_PRICE_ID` | Vercel | Low (identifier) | On product change |
| `PENNY_ALLOW_NO_ORG` | Vercel | Low (feature flag) | N/A |
| `PENNY_API_URL` | Vercel | Low (URL) | On Railway domain change |
| `SITE_URL` | Vercel | Low (URL) | On domain change |

---

## Control Exceptions Documented

### Exception 1: Penny No-Org Mode

**Control**: CC6.1 (Logical Access Controls)
**Exception**: Authenticated admin users can query Penny without an active Clerk organization when `PENNY_ALLOW_NO_ORG=true`.
**Compensating controls**:
- Default is `false` in production
- Restricted to admin role only
- No org-specific data returned (CFR/general knowledge only)
- All queries logged with `contextMode: 'no-org'`
- Rate limiting still enforced

**Risk**: Low. Admin-only access to general compliance knowledge without org context does not expose tenant data.

---

## Recommendations (Non-Blocking)

1. **Add `STRIPE_SECRET_KEY` to secret rotation schedule** — update `soc2-evidence/access-control/SECURITY_ROTATION.md` with 90-day rotation cycle
2. **Stripe test mode on production** — Currently using `sk_test_` keys. Switch to `sk_live_` keys before accepting real payments
3. **Asset detail spend page** uses `auth()` directly instead of `requireFleetComplianceOrg()` — functionally equivalent but slightly inconsistent. Non-blocking.

---

## Verdict

**All 9 commits pass SOC 2 review.** No blockers. One hardening fix was applied during review (10 MB PDF size limit). The Penny no-org mode is properly documented as a controlled exception with defense-in-depth guardrails.
