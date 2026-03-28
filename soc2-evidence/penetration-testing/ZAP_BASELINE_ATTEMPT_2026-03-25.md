# OWASP ZAP Baseline Attempt

Date: 2026-03-25
Target: https://www.pipelinepunks.com
Command:
`docker run --rm -v "${PWD}:/zap/wrk" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://www.pipelinepunks.com -J /zap/wrk/soc2-evidence/penetration-testing/zap-baseline-2026-03-25.json -r /zap/wrk/soc2-evidence/penetration-testing/zap-baseline-2026-03-25.html -w /zap/wrk/soc2-evidence/penetration-testing/zap-baseline-2026-03-25.md -m 3`

Result: Failed before scan start.

Error:
`docker: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.`

Interpretation:
- Docker CLI is installed, but Docker daemon is not running in this environment.
- ZAP baseline scan must be re-run in an environment with active Docker engine.

Next Action Owner: Jacob Johnston
Target Completion: 2026-03-29

## Update 2026-03-27 (Coworker)

Task remains outstanding. Requires Docker Desktop running locally.

Steps for Jacob:
```
docker pull ghcr.io/zaproxy/zaproxy:stable
docker run --rm ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://www.pipelinepunks.com \
  -r zap-report.html
```
Save report to: `soc2-evidence/penetration-testing/zap-report-2026-03-29.html`
