# OWASP ZAP Baseline Scan Evidence

Date Opened: 2026-03-25  
Target: https://www.pipelinepunks.com

## 1) Initial Attempt (2026-03-25)

The initial run failed before scan start because Docker daemon was unavailable.

Error recorded:
`docker: error during connect ... //./pipe/dockerDesktopLinuxEngine ... The system cannot find the file specified.`

## 2) Completed Scan (2026-03-28)

Completion Timestamp (UTC): **2026-03-28 00:34:28 UTC**

Command used:

```bash
docker pull ghcr.io/zaproxy/zaproxy:stable

docker run --rm -v "${PWD}:/zap/wrk" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://www.pipelinepunks.com \
  -J soc2-evidence/penetration-testing/zap-baseline-2026-03-29.json \
  -r soc2-evidence/penetration-testing/zap-baseline-2026-03-29.html \
  -w soc2-evidence/penetration-testing/zap-baseline-2026-03-29.md \
  -m 3
```

Note: `zap-baseline.py` exits non-zero when warnings are present. The scan itself completed and reports were generated.

## 3) Generated Report Artifacts

- `soc2-evidence/penetration-testing/zap-baseline-2026-03-29.json`
- `soc2-evidence/penetration-testing/zap-baseline-2026-03-29.html`
- `soc2-evidence/penetration-testing/zap-baseline-2026-03-29.md`

## 4) Findings Summary

Automation summary (terminal output):

- **PASS:** 59
- **WARN-NEW:** 8
- **FAIL-NEW:** 0

Risk-level summary from markdown report:

- **High:** 0
- **Medium:** 5
- **Low:** 5
- **Informational:** 4

Key warning families observed:

1. CSP policy quality issues (`CSP: Wildcard Directive`, `script-src unsafe-inline`, `style-src unsafe-inline`)
2. Cross-domain policy findings (`Cross-Domain Misconfiguration`, `Cross-Domain JavaScript Source File Inclusion`)
3. Browser isolation headers (`Cross-Origin-Embedder-Policy Header Missing or Invalid`)
4. Frontend integrity/caching findings (`Sub Resource Integrity Attribute Missing`, cache-control/cacheability warnings)

## 5) Remediation Plan (CC7.1)

1. **CSP hardening (High priority)**
   - Remove wildcard sources where possible.
   - Eliminate `'unsafe-inline'` for script/style by moving inline code/styles to nonce or hashed policies.
   - Owner: Engineering
   - Target: 2026-04-05

2. **Cross-origin policy hardening (Medium priority)**
   - Add `Cross-Origin-Embedder-Policy`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` where compatible.
   - Validate impact on Clerk and third-party embeds before production rollout.
   - Owner: Engineering
   - Target: 2026-04-05

3. **Subresource Integrity rollout (Medium priority)**
   - Add SRI for externally hosted static JS where feasible.
   - If assets are self-hosted through Next.js build pipeline, document compensating control in architecture evidence.
   - Owner: Engineering
   - Target: 2026-04-12

4. **Cache policy review (Low priority)**
   - Tune cache-control directives for static and image endpoints.
   - Confirm no sensitive responses are cacheable.
   - Owner: Engineering
   - Target: 2026-04-12

## 6) SOC 2 Control Mapping

- **CC7.1 (Vulnerability Detection):** Baseline DAST scan completed and evidence captured.
- Follow-up remediation is tracked with owners and target dates above.
