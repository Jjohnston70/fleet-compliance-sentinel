# Pipeline Penny Deploy Checklist (Vercel + Railway)

## 1) Railway Backend

1. Create Railway project using this repo with root directory `railway-backend`.
2. Add Railway env vars:
   - `PENNY_API_KEY` (required)
   - `ANTHROPIC_API_KEY` (optional now, required for Claude answers)
   - `CORS_ORIGINS=https://pipelinepunks.com,https://www.pipelinepunks.com`
3. Deploy and verify:
   - `GET /health` returns `status: ok`

## 2) Vercel Frontend

1. In Vercel project env vars, set:
   - `PENNY_API_URL=<railway service url>`
   - `PENNY_API_KEY=<same value as Railway>`
2. Redeploy.

## 3) Smoke Test

1. Open `/penny` as signed-in admin/demo/client.
2. Confirm status changes to `Connected`.
3. Ask a question and confirm response returns.
4. Open `/privacy`, `/terms`, `/accessibility` and confirm footer links load.
5. Confirm consent banner appears for new browser session and saves choice.
