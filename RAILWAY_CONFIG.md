# RAILWAY_CONFIG.md

## Phase 1 Manual Railway Configuration

Set the Penny backend CORS allowlist in Railway for the production service.

### Environment Variable

```env
CORS_ORIGINS=https://www.pipelinepunks.com,https://pipelinepunks.com
```

### Where to Set It

1. Open Railway dashboard.
2. Project: `pipeline-punks-v2`.
3. Service: `pipeline-punks-v2`.
4. Environment: `production`.
5. Variables tab: set/update `CORS_ORIGINS` with the exact value above.
6. Redeploy service after saving variables.

### Verification

- `GET https://pipeline-punks-v2-production.up.railway.app/health` returns `200`.
- Browser requests from `https://www.pipelinepunks.com` and `https://pipelinepunks.com` succeed.
- Requests from unlisted origins are blocked by CORS policy.
