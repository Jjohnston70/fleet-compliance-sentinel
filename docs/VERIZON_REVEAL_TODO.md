# Verizon Reveal Integration TODO

Last Updated: 2026-03-28  
Owner: Jacob Johnston (TNDS)  
System: Fleet-Compliance Sentinel / Pipeline Penny

## 1) Objective

Use Verizon Connect Reveal data to move Fleet-Compliance Sentinel from:
- descriptive compliance reporting
to:
- predictive risk scoring
- cognitive action recommendations

This document is the execution baseline for Reveal scope.

## 2) Current Production State (What Is Live)

Status: `LIVE` and validated end-to-end.

Pipeline:
`Vercel cron -> /api/fleet-compliance/telematics-sync -> Railway /telematics/sync -> Neon -> /api/fleet-compliance/telematics-risk -> /fleet-compliance/telematics`

Current dashboard outputs (verified):
- Total vehicles: 30
- Total drivers: 24
- High risk: non-zero
- Vehicle and driver risk tables populated

## 3) Access Matrix (What We Have vs What We Use)

| Data Domain | Reveal Access | Endpoint / Mechanism | Ingestion Status | Persistence Status | UI/Scoring Status |
|---|---|---|---|---|---|
| Vehicle roster | Yes | `GET /cmd/v1/vehicles` | Live | `telematics_vehicles` | Live |
| Driver roster | Yes | `GET /cmd/v1/drivers` | Live | `telematics_drivers` | Live |
| ELD/logbook status (subset) | Yes | `GET /cmd/v1/driversettings/logbooksettings/{driver}` | Live (hardcoded driver list) | `telematics_drivers.current_hos_status` | Live (basic) |
| GPS segment history | Yes | `GET /rad/v1/vehicles/{vehicle}/segments` | Live | `telematics_gps_events` | Live |
| Current vehicle location | Yes | `GET /rad/v1/vehicles/{vehicle}/location` | Live | `telematics_vehicles.last_seen_at/lat/lon` | Live |
| HOS logs (full) | Yes | Adapter method `get_hos_logs()` | Not wired to sync job | Table exists (`telematics_hos_logs`) | Not surfaced |
| Alerts/exceptions (full) | Yes | Adapter method `get_alerts()` | Not wired to sync job | Table exists (`telematics_alerts`) | Not surfaced |
| DVIR records | Yes | Adapter method `get_dvir_records()` | Not wired to sync job | Table exists (`telematics_dvir_records`) | Not surfaced |
| GPS webhook push | Yes (with Reveal setup) | `/api/telematics/reveal/gps` | Endpoint implemented, disabled by env in prod | TODO in receiver write path | Not surfaced |
| Alert webhook push | Yes (requires Verizon support activation) | `/api/telematics/reveal/alerts` | Endpoint implemented, disabled by env in prod | TODO in receiver write path | Not surfaced |

## 4) Confirmed Gaps

1. Reveal ingestion is currently partial (vehicles/drivers/segments/location + limited ELD settings only).
2. Full HOS/alerts/DVIR ingestion exists in adapter code but is not connected to scheduled sync.
3. Webhook receiver exists but background persistence is still TODO.
4. Current risk model is rule-based; it is not a forecasting model.
5. Penny does not yet generate proactive daily cognitive briefings.

## 5) Execution Plan

## Phase A — Complete Reveal Data Ingestion

Priority: `P0`

- [ ] Replace hardcoded ELD driver list with dynamic driver-based pull.
- [ ] Wire adapter polling methods into sync pipeline:
  - [ ] HOS logs (`get_hos_logs`)
  - [ ] Alerts (`get_alerts`)
  - [ ] DVIR (`get_dvir_records`)
- [ ] Persist these data streams to existing telematics tables.
- [ ] Add idempotency and backfill guards for all new streams.
- [ ] Add operational health counters by stream (vehicles/drivers/gps/hos/alerts/dvir).
- [ ] Expand `/telematics/health` response to include new stream counts.

Definition of done:
- Daily sync writes non-zero records for at least one of HOS/alerts/DVIR in production.
- Data appears in Neon with org scoping and no duplicate explosion.

## Phase B — Productionize Webhooks (Real-Time Feed)

Priority: `P1`

- [ ] Enable `REVEAL_WEBHOOKS_ENABLED=true` in Railway after hardening checks.
- [ ] Set and validate `REVEAL_WEBHOOK_SECRET`.
- [ ] Configure and validate `REVEAL_WEBHOOK_ALLOWED_IPS`.
- [ ] Implement DB writes in webhook background handlers (`_process_gps_event`, `_process_alert_event`).
- [ ] Implement subscription confirmation path validation in production logs.
- [ ] Create runbook for Verizon webhook activation steps:
  - [ ] GPS webhook via Reveal UI
  - [ ] Alert webhook via Verizon support call

Definition of done:
- Incoming webhook events write to Neon and appear in risk calculations within one sync cycle.

## Phase C — Predictive Risk Engine v2

Priority: `P1`

- [ ] Add feature set for predictive scoring:
  - [ ] HOS violation cadence
  - [ ] Alert severity/time-frequency weighting
  - [ ] DVIR unresolved defect exposure
  - [ ] Recency decay and trend slope
  - [ ] Vehicle fault/idle/usage-based priors (where available)
- [ ] Version scores (`risk_model_version`) for auditability.
- [ ] Persist daily risk snapshots for trend charts.
- [ ] Add model explainability fields per score (top contributing factors).

Definition of done:
- Score changes can be explained per entity.
- Trend chart available with at least 14 days of snapshots.

## Phase D — Cognitive Layer (Penny Proactive Briefing)

Priority: `P1`

- [ ] Add daily org briefing job (e.g., 06:00 local/org timezone).
- [ ] Generate top 3 risks + recommended actions + due-by date.
- [ ] Surface briefing in Fleet-Compliance dashboard home.
- [ ] Add acknowledgment workflow (`accepted`, `delegated`, `dismissed`).
- [ ] Log briefing generation and user actions for audit trail.

Definition of done:
- Penny posts a daily actionable brief without user prompt.

## Phase E — Revenue Features

Priority: `P2`

- [ ] Insurance readiness export (PDF): risk posture + controls + remediation history.
- [ ] Predictive maintenance starter model (mileage/event-driven failure risk).
- [ ] Client-facing report pack for underwriting and procurement responses.

## 6) Security and Compliance Guardrails

- No secrets in code; all Reveal credentials remain env/DB encrypted.
- Maintain org isolation for every query and write.
- No raw PII in logs.
- Preserve retention controls:
  - GPS events: 90-day purge
  - Sync logs: 365-day purge
- Keep cron/system routes self-authenticated and excluded from Clerk session gating.

## 7) Dependencies for Next Provider (Geotab)

This Reveal plan is the template for Geotab.

- [ ] Keep provider-agnostic normalized schema as source of truth.
- [ ] Ensure risk engine consumes normalized data, not provider-native payloads.
- [ ] Keep adapter parity checklist (vehicles/drivers/hos/alerts/dvir/location).

## 8) Immediate Next 5 Tasks

1. Wire `get_hos_logs()` into sync and persist to `telematics_hos_logs`.
2. Wire `get_alerts()` into sync and persist to `telematics_alerts`.
3. Wire `get_dvir_records()` into sync and persist to `telematics_dvir_records`.
4. Remove hardcoded ELD list and derive from active driver roster.
5. Add risk explanation fields to `/api/fleet-compliance/telematics-risk` output.
