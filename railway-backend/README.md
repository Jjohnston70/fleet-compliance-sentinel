# Pipeline Penny Railway Backend

This is a standalone FastAPI service for Pipeline Penny.

## Endpoints

### Core (Pipeline Penny)

- `GET /health` - service health and config status
- `GET /status` - knowledge store stats (API key protected)
- `POST /ingest` - add docs to local JSON store (admin role + API key)
- `POST /query` - answer user questions from indexed docs (API key protected)

### Federal Intelligence (`/api/federal-intel`)

Live federal data search endpoints ported from APPSCRIPT GOV.txt. All POST requests accept JSON bodies.

| Endpoint | Source | Auth |
|----------|--------|------|
| `/api/federal-intel/sam/search` | SAM.gov Opportunities | SAM_API_KEY |
| `/api/federal-intel/usaspending/search` | USAspending Awards | None (public) |
| `/api/federal-intel/grants/search` | Grants.gov | None (public) |
| `/api/federal-intel/sbir/search` | SBIR.gov Awards | None (public) |
| `/api/federal-intel/labor-rates/search` | GSA CALC+ Rates | None (public) |
| `/api/federal-intel/psc/search` | PSC Codes | SAM_API_KEY |
| `/api/federal-intel/regulations/search` | Regulations.gov | REGULATIONS_API_KEY |
| `/api/federal-intel/subawards/contract/search` | Contract Subawards | SAM_API_KEY |
| `/api/federal-intel/subawards/assistance/search` | Assistance Subawards | SAM_API_KEY |
| `/api/federal-intel/run-all` | Orchestrated full ingest | SAM_API_KEY |

### Telematics

- Verizon Reveal integration routes (see `app/telematics_router.py`)

## Local run

```bash
cd railway-backend
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Railway deploy

1. Create a new Railway project from this repo.
2. Set Railway root directory to `railway-backend`.
3. Configure environment variables from `.env.example`.
   - `LLM_PROVIDER` supports `anthropic`, `openai`, `gemini`, `ollama`, and `none`.
   - Set the matching API key for the provider(s) you want enabled:
     - `ANTHROPIC_API_KEY`
     - `OPENAI_API_KEY`
     - `GEMINI_API_KEY`
     - `OLLAMA_BASE_URL` + `OLLAMA_MODEL` (for local Ollama/testing)
   - For Federal Intelligence endpoints:
     - `SAM_API_KEY` — SAM.gov API key (register at https://api.sam.gov)
     - `REGULATIONS_API_KEY` — Regulations.gov API key (register at https://api.regulations.gov)
   - For longer responses, raise `ANTHROPIC_MAX_TOKENS` (for model output) and `FALLBACK_MAX_CHARS` (non-LLM fallback output).
4. Deploy and copy service URL (example: `https://penny-api-production.up.railway.app`).

## Vercel wiring

In the Vercel project:

- `PENNY_API_URL` = your Railway service URL
- `PENNY_API_KEY` = same value as Railway `PENNY_API_KEY`

The Next.js API proxy routes (`/api/penny/health` and `/api/penny/query`) already forward this key.
