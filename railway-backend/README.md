# Pipeline Penny Railway Backend

This is a standalone FastAPI service for Pipeline Penny.

## Endpoints

- `GET /health` - service health and config status
- `GET /status` - knowledge store stats (API key protected)
- `POST /ingest` - add docs to local JSON store (admin role + API key)
- `POST /query` - answer user questions from indexed docs (API key protected)

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
   - For longer responses, raise `ANTHROPIC_MAX_TOKENS` (for model output) and `FALLBACK_MAX_CHARS` (non-LLM fallback output).
4. Deploy and copy service URL (example: `https://penny-api-production.up.railway.app`).

## Vercel wiring

In the Vercel project:

- `PENNY_API_URL` = your Railway service URL
- `PENNY_API_KEY` = same value as Railway `PENNY_API_KEY`

The Next.js API proxy routes (`/api/penny/health` and `/api/penny/query`) already forward this key.
