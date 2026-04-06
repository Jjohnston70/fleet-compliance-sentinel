# COMMANDS.md — Fleet-Compliance Sentinel

**Last Updated:** 2026-04-06
**Rule:** Run commands from the project root unless noted otherwise.

---

## Frontend

```bash
# Development server (hot reload)
npm run dev

# Production build (includes preflight checks, CFR index, demo index)
npm run build

# Lint (ESLint + Next.js rules)
npm run lint

# Deploy (auto on merge to main via Vercel)
# Manual preview: push to any branch, Vercel creates preview URL
git push origin feature/my-branch
```

---

## Backend

```bash
# Railway Penny backend (local dev)
cd railway-backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# Railway deploy (auto on push to Railway-connected branch)
# Check Railway dashboard for deploy status
```

---

## Database

```bash
# Initialize database (runs all migrations)
node scripts/init-db.mjs

# Check training schema status
npm run db:check-training-schema

# Connect to Neon directly (requires DATABASE_URL)
psql $DATABASE_URL
```

---

## Testing

```bash
# Onboarding phase 1 tests
npm run test:onboarding-phase1

# Onboarding contract drift tests
npm run test:onboarding-drift

# Onboarding alert binding tests
npm run test:onboarding-alerts

# Onboarding phase 6 release gate tests
npm run test:onboarding-phase6

# Command-center tests
npm --prefix tooling/command-center run test

# Command-center build verification
npm --prefix tooling/command-center run build

# TypeScript type check (no emit)
npx tsc --noEmit
```

---

## Deployment

```bash
# Production deploys automatically on merge to main via Vercel
# Check deployment status:
vercel ls

# View production logs:
vercel logs --follow

# Preview deploy (any branch push):
git push origin feature/my-branch
# Vercel auto-creates preview URL
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/description-of-work

# Commit format
git commit -m "feat: description"
git commit -m "fix: description"
git commit -m "chore: description"
git commit -m "training(phaseN): description"

# Push and open PR — do not merge without approval
git push origin feature/description-of-work

# NEVER do these
# git push --force origin main
# git push --force-with-lease origin main
# git rebase main (on shared branches)
# git reset --hard (without explicit approval)
```

---

## Compliance Evidence

```bash
# Run onboarding release verification (all test suites)
bash scripts/onboarding-release-verify.sh

# Check legal pages exist
npm run compliance:legal-check

# Run ops check
npm run compliance:ops-check

# Penny evaluation suite
npm run eval:penny
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
node -e "console.log(Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_') || k.startsWith('CLERK_') || k.startsWith('STRIPE_') || k.startsWith('DATABASE')).sort().join('\n'))"

# Build CFR index for Penny
npm run build:cfr-index

# Sync knowledge base
npm run sync:knowledge

# Download vendor docs
npm run docs:vendors

# Preflight skill packs
npm run preflight:skill-packs
```

---

## Module Gateway / Command Center

```bash
# Build command-center package
npm --prefix tooling/command-center run build

# Run command-center tests
npm --prefix tooling/command-center run test

# Check module gateway status (requires running server)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/modules/catalog

# Run a module action (admin only)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"moduleId":"command-center","actionId":"discover.tools","args":{}}' \
  http://localhost:3000/api/modules/run
```
