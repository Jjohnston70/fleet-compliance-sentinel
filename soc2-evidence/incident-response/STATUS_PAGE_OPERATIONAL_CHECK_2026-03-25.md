# Status Page Operational Check

Date Opened: 2026-03-25  
Reviewer: Security and Operations Team

## Historical State (2026-03-25)

1. `https://status.pipelinepunks.com`
   - Result: DNS resolution failure (`No such host is known`)
   - Status: Not operational

2. `https://www.pipelinepunks.com/api/penny/health`
   - Result: HTTP 200
   - Status: Healthy

## Follow-up Completed (2026-03-27)

CNAME record added in Squarespace DNS:

- Host: `status`
- Type: CNAME
- Data: `stats.uptimerobot.com`
- TTL: 4 hours

## Verification Run (2026-03-28)

Verification Timestamp (UTC): **2026-03-28 00:34 UTC**

### DNS Check

Command:

```bash
nslookup status.pipelinepunks.com
```

Result:

- `status.pipelinepunks.com` resolves to alias `stats.uptimerobot.com`
- Returned address: `142.132.149.97`

Status: **DNS propagation successful**

### HTTPS Check

Command:

```bash
Invoke-WebRequest https://status.pipelinepunks.com
```

Result:

- SSL/TLS handshake failure from client (`The SSL connection could not be established` / Schannel error).

Status: **Domain resolves, HTTPS endpoint not yet operational**

## UptimeRobot Custom Domain Check

- Automated verification of UptimeRobot dashboard settings is not possible from this environment (interactive login required).
- Manual check still required in UptimeRobot:
  1. Status Pages > target status page > Settings > Custom Domain
  2. Confirm custom domain is exactly `status.pipelinepunks.com`
  3. Confirm SSL certificate provisioning for the custom domain completed

## Remediation / Next Action

1. Verify UptimeRobot custom domain binding is active for `status.pipelinepunks.com`.
2. Confirm certificate issuance completed and active.
3. Re-run HTTPS check until status page returns HTTP 200.

## Control Mapping

- **CC7.3 / A1.1:** DNS CNAME is in place and propagated; HTTPS availability is partially complete pending UptimeRobot custom-domain TLS completion.
