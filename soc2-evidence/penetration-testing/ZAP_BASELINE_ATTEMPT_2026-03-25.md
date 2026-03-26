# OWASP ZAP Baseline Scan — Attempt Log

## SOC2 Control: Penetration Testing / Vulnerability Management — A1.1, A1.2

**Date:** 2026-03-25
**Operator:** Jacob Johnston (Jjohnston70)
**Target:** https://www.pipelinepunks.com
**Tool:** OWASP ZAP (ghcr.io/zaproxy/zaproxy:stable)
**Scan Type:** Baseline (passive scan, 5-minute spider)

---

## Scan Command

```powershell
docker run --rm `
  -v "${PWD}:/zap/wrk/:rw" `
  -t ghcr.io/zaproxy/zaproxy:stable `
  zap-baseline.py `
  -t https://www.pipelinepunks.com `
  -r zap-baseline-report.html `
  -J zap-baseline-report.json `
  -m 5
```

---

## Execution Status

**Status:** Documented — Pending local Docker execution
**Reason:** Browser-based automation environment does not have access to local Docker runtime. Scan must be executed from operator workstation.

**Operator Action Required:**
1. Open PowerShell on local workstation
2. Navigate to repo root: `cd <REPO_ROOT>\Desktop\website-pipeline-punks-pipelinex-v2`
3. Run the command above
4. Copy output files to `soc2-evidence/penetration-testing/`
5. Update this file with findings summary

---

## Expected Outputs

| File | Description |
|------|-------------|
| zap-baseline-report.html | Human-readable scan report |
| zap-baseline-report.json | Machine-readable findings (for CI integration) |

---

## Baseline Scan Scope

The ZAP baseline scan performs:
- Passive scanning only (no active attacks)
- Spider crawl of the target URL (5 minutes)
- Detection of common misconfigurations (missing headers, etc.)
- OWASP Top 10 passive checks

---

## Phase 8 Acceptance Criteria

This evidence file documents the scan configuration and intent. The scan must be run locally to produce actual findings. Upon execution, replace this file with actual findings summary including:
- Total alerts found (High / Medium / Low / Informational)
- Critical findings (if any)
- Remediation actions taken
- Re-scan confirmation

---

## Risk Acknowledgment

Until the actual Docker scan is executed and findings are reviewed, pipelinepunks.com is operating without a completed baseline vulnerability scan for this audit period. This is a low-residual-risk gap as the site is a Next.js static/SSR app with no admin panel exposed to the public internet.

**Operator signature:** Jjohnston70 — 2026-03-25
