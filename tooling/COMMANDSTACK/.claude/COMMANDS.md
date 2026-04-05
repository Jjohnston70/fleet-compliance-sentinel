# COMMANDS.md — Fleet Compliance Sentinel

**Last Updated:** 2026-04-04
**Rule:** Run commands from the project root unless noted otherwise.

---

## Frontend (Next.js)

```bash
# Start local dev server
npm run dev

# Production build (test before deploying)
npm run build

# Type check only
npm run type-check

# Lint
npm run lint

# Start local Vercel environment (with edge functions)
vercel dev
```

---

## Backend (FastAPI / Railway)

```bash
# Start FastAPI locally
cd api/
uvicorn main:app --reload --port 8000

# Run with environment variables
source .env && uvicorn main:app --reload --port 8000

# Install Python dependencies
pip install -r requirements.txt
```

---

## Database (Neon / Drizzle)

```bash
# Generate migration from schema changes
npm run db:generate

# Push migration to database
npm run db:push

# Run migrations in sequence
npm run db:migrate

# Open Drizzle Studio (local DB explorer)
npm run db:studio

# Connect directly to Neon (read-only inspection)
psql $DATABASE_URL
```

---

## Deployment

```bash
# Deploy frontend to Vercel (production)
vercel --prod

# Deploy preview branch
vercel

# Deploy Railway backend
railway up

# Check Railway logs
railway logs

# Check Railway status
railway status
```

---

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- path/to/test.ts

# Python tests (from api/ directory)
cd api/
pytest tests/

# Run specific Python test
pytest tests/test_penny.py -v
```

---

## Vector Store / Penny

```bash
# Re-index CFR chunks (from api/ directory)
cd api/
python scripts/rebuild_index.py

# Run citation validation test
python scripts/validate_citations.py --sample 50

# Check knowledge freshness
python scripts/check_freshness.py

# Query Penny locally
curl -X POST http://localhost:8000/api/penny/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the random drug testing rate?", "org_id": "test-org"}'
```

---

## Compliance Evidence

```bash
# Capture Datadog audit log export (run weekly)
# Log in to Datadog → Logs → Export → Save to /compliance/weekly/YYYY-WXX/

# Check Sentry for PII leaks (run weekly)
# Sentry → Issues → Filter last 7 days → Manually review stack traces

# Clerk user audit (run weekly)
# Clerk dashboard → Users → Export CSV → Save to /compliance/weekly/YYYY-WXX/
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/description-of-work

# Commit (conventional format)
git commit -m "feat: add citation validation to penny pipeline"
git commit -m "fix: enforce org_id on asset query"
git commit -m "chore: update drizzle schema for outcome tracking"

# Push and open PR
git push origin feature/description-of-work
# Open PR in GitHub → assign reviewer → do not merge without approval

# Do NOT do this
git push --force origin main  # forbidden
git push origin main          # forbidden — always PR
```

---

## Neo4j (Month 1 — Graph RAG)

```bash
# Start Neo4j locally (Docker)
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest

# Open Neo4j Browser
open http://localhost:7474

# Run extraction script
cd api/
python scripts/extract_relationships.py --cfr-part 382

# Validate relationship sample
python scripts/validate_relationships.py --sample 100
```

---

## Useful Shortcuts

```bash
# Check what's running on a port
lsof -i :3000
lsof -i :8000

# Kill a port
kill -9 $(lsof -t -i:3000)

# Check environment variables are loaded
env | grep CLERK
env | grep DATABASE

# Tail Vercel logs (requires vercel CLI login)
vercel logs --follow
```
