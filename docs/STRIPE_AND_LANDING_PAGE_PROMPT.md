# Claude Code Prompt: Stripe Checkout + Landing Page Update

Paste this entire block into a new Claude Code session at the repo root.

---

## PROMPT

I need to implement two things to start selling Fleet-Compliance Sentinel:

### TASK 1: Stripe Checkout Flow

The webhook handler already exists at `src/app/api/stripe/webhook/route.ts` and handles subscription lifecycle events. The `src/lib/plan-gate.ts` checks trial/subscription status. The `src/lib/org-provisioner.ts` creates orgs with 30-day trials. But there is NO checkout flow — customers cannot actually subscribe.

**Do the following:**

1. **Install Stripe SDK:**
   ```
   npm install stripe
   ```

2. **Create `src/lib/stripe.ts`** — Stripe client singleton:
   - Initialize with `STRIPE_SECRET_KEY` env var
   - Export the client for use in API routes

3. **Add env vars to `.env.example`:**
   - `STRIPE_SECRET_KEY` — Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
   - `STRIPE_STARTER_PRICE_ID` — Price ID for Starter plan ($149/mo)
   - `STRIPE_PRO_PRICE_ID` — Price ID for Professional plan ($299/mo)

4. **Create `src/app/api/stripe/checkout/route.ts`** — POST endpoint:
   - Requires Clerk auth (use same pattern as fleet-compliance routes)
   - Accepts `{ priceId: string }` in request body
   - Creates or retrieves Stripe customer (use org email from `organization_contacts` table, or Clerk user email)
   - Stores `stripe_customer_id` on the org's subscription record
   - Creates a Stripe Checkout Session in `subscription` mode with:
     - `success_url`: `{SITE_URL}/fleet-compliance?checkout=success`
     - `cancel_url`: `{SITE_URL}/fleet-compliance?checkout=canceled`
     - `metadata`: `{ org_id, user_id }` on both subscription and customer
     - `allow_promotion_codes: true`
   - Returns `{ url: session.url }` for client redirect

5. **Create `src/app/api/stripe/portal/route.ts`** — POST endpoint:
   - Requires Clerk auth
   - Looks up `stripe_customer_id` from subscriptions table
   - Creates a Stripe Billing Portal session
   - Returns `{ url: session.url }` for client redirect

6. **Update `src/components/fleet-compliance/FleetComplianceExpiredGate.tsx`:**
   - Replace the "Contact Sales" link with actual subscribe buttons
   - Show Starter ($149/mo) and Professional ($299/mo) options
   - On click, POST to `/api/stripe/checkout` with the appropriate `priceId`
   - Redirect to `session.url`

7. **Update `src/lib/org-provisioner.ts`:**
   - When creating a new org, also create a Stripe customer with org name and admin email
   - Store `stripe_customer_id` in the subscriptions table immediately (with `status: 'trialing'`)

8. **Add to `scripts/check-env.ts`:**
   - `STRIPE_SECRET_KEY` as REQUIRED
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` as REQUIRED
   - `STRIPE_STARTER_PRICE_ID` as REQUIRED
   - `STRIPE_PRO_PRICE_ID` as REQUIRED

**Important constraints:**
- Use the existing `getSQL()` from `src/lib/fleet-compliance-db.ts` for database queries
- Use the existing `requireFleetComplianceOrg()` pattern for auth
- Use the existing `recordOrgAuditEvent()` from `src/lib/org-audit.ts` to log checkout events
- The webhook handler at `src/app/api/stripe/webhook/route.ts` already handles subscription state changes — don't duplicate that logic
- Add `src/app/api/stripe/checkout/route.ts` and `src/app/api/stripe/portal/route.ts` to the Clerk middleware protected routes in `src/middleware.ts`

---

### TASK 2: Update Landing Page with Fleet-Compliance + Pricing

The current landing page (`src/app/page.tsx`) only talks about Pipeline Penny. It needs to be updated to market both products and show pricing.

**Update `src/app/page.tsx` with these sections (in order):**

1. **Hero** — Keep Pipeline Penny branding but reframe:
   - Headline: "Fleet Compliance, Simplified."
   - Subhead: "Track drivers, vehicles, permits, and DOT deadlines — with an AI compliance assistant that knows the regulations."
   - Keep the Penny logo
   - CTAs: "Start Free Trial" (→ /sign-up) and "Book a Demo" (→ truenorthstrategyops.com/contact)

2. **Fleet-Compliance Features** — New section with 6 feature cards:
   - Driver Compliance: CDL, medical cards, MVR, drug testing — all tracked with expiration alerts
   - Vehicle & Asset Tracking: Fleet inventory with VIN, inspection dates, maintenance schedules
   - Permit & License Management: DOT permits, state licenses, renewal tracking with automated reminders
   - FMCSA Safety Lookups: Live carrier safety data from the federal FMCSA database
   - Compliance Alerts: Daily automated email sweep for overdue and upcoming deadlines
   - Bulk Data Import: Upload your fleet data from Excel — 12 collection types with validation

3. **Pipeline Penny Section** — Keep existing but reframe as the AI module:
   - "Your AI Compliance Assistant"
   - Knows 13 CFR parts (Parts 040-397)
   - Answers questions grounded in your fleet data and federal regulations
   - Doesn't make things up — cites sources

4. **Pricing Section** — 3-tier pricing cards:
   ```
   STARTER — $149/mo
   - Up to 15 vehicles
   - Up to 10 drivers
   - Compliance alerts & reminders
   - Bulk Excel import
   - FMCSA carrier lookups
   - Email support
   CTA: "Start Free Trial"

   PROFESSIONAL — $299/mo (highlighted/recommended)
   - Up to 50 vehicles
   - Up to 25 drivers
   - Everything in Starter, plus:
   - Pipeline Penny AI assistant
   - Priority support
   - Custom alert configurations
   CTA: "Start Free Trial"

   ENTERPRISE — Custom
   - Unlimited vehicles & drivers
   - Everything in Professional, plus:
   - Dedicated onboarding
   - Custom integrations
   - SLA guarantee
   CTA: "Contact Us"
   ```
   - Add note: "All plans include a 30-day free trial. No credit card required."

5. **Trust/Compliance Section:**
   - "SOC 2 Type I Audit-Ready"
   - "Your data is encrypted, org-isolated, and never used to train AI models"
   - SBA-Certified VOSB/SDVOSB badges (already exist)
   - "Veteran-owned. Built in Colorado."

6. **CTA Section** — Keep existing but update copy:
   - "Ready to stop tracking compliance in spreadsheets?"
   - "Start your 30-day free trial" button → /sign-up
   - "Book a Demo" button → truenorthstrategyops.com/contact
   - Phone number link

7. **Footer** — Keep existing

**Style notes:**
- Use the existing CSS classes in `src/styles/globals.css` (hero, features, feature-grid, feature-card, etc.)
- Add new CSS for the pricing cards (`.pricing`, `.pricing-grid`, `.pricing-card`, `.pricing-card.featured`, `.pricing-price`, `.pricing-features`)
- Keep the dark theme and existing color palette
- Pricing cards should have a border highlight on the Professional tier

**Do NOT:**
- Change the privacy, terms, or accessibility pages
- Modify any API routes other than the Stripe ones
- Change the fleet-compliance dashboard or Penny chat pages
- Add any new npm dependencies beyond `stripe`

Commit when done with message: "Add Stripe checkout flow and update landing page with pricing"
