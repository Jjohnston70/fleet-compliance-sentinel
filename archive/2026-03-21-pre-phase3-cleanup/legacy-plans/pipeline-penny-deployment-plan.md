# Pipeline Penny Deployment Plan

## Current State

**pipelinepunks.com (pipeline-punks-v2)**
- Next.js on Vercel (Pro plan)
- Clerk auth (free tier) with role-based access (admin, member)
- Google Drive integration for resources/discussions/blog
- GitHub org: Pipeline-Punks/pipeline-punks-v2
- Pages: Home, Resources, Dropouts, Learning Modules, Community, Discussions, Blog, Sign In/Up
- Turbopack bundler, Node 24.x

**Pipeline Penny (local desktop)**
- Electron + React frontend
- Python FastAPI backend
- FAISS vector store (342 chunks from 6 TNDS docs + CSV)
- Claude API (primary inference) + Ollama llama3.1 (embeddings + offline fallback)
- Tabs: Command Post, Prompt Lab, Workflow Status

**Target: pipelinepunks.com becomes Pipeline Penny's home**

---

## Architecture Decision

```
pipelinepunks.com (Vercel - Next.js frontend)
├── / → New landing page (Pipeline Penny product focus)
├── /sign-in → Clerk auth (existing)
├── /sign-up → Clerk auth (existing)
├── /penny → Pipeline Penny chat UI (Clerk-protected)
│   ├── Role: "admin" → full access
│   ├── Role: "demo" → read-only / limited queries
│   └── Role: "client" → full access, scoped to their knowledge base
├── /resources → Keep (Clerk-protected Drive folders)
└── /privacy, /terms → Keep

REMOVED:
├── /dropouts → Remove (external learning site link)
├── /community → Remove
├── /discussions → Remove
├── Learning Modules links → Remove
├── Blog link → Remove (or redirect to truenorthstrategyops.com/blog later)

BACKEND (Railway - Python FastAPI):
├── penny-api.pipelinepunks.com OR api route on Railway
├── FastAPI server (persistent process)
├── FAISS vector store (loaded in memory)
├── Claude API for inference + embeddings (drop Ollama)
├── Endpoints:
│   ├── POST /query → Ask Pipeline Penny a question
│   ├── POST /ingest → Upload new knowledge docs
│   ├── GET /health → Health check
│   └── GET /status → Vector store stats
└── Auth: Verify Clerk JWT on every request
```

---

## Phase Breakdown

### Phase 1: Strip pipelinepunks.com (Do in Claude.ai now)
- Design new landing page focused on Pipeline Penny
- Remove learning content, dropouts, community, discussions, blog nav items
- Keep Clerk auth, resources, sign-in/up
- Add /penny route (placeholder) behind Clerk
- Add "demo" role to Clerk role system
- Output: Ready-to-push code changes for the Next.js repo

### Phase 2: Build Pipeline Penny Web UI (Next chat session)
- Build the /penny page with chat interface
- Tabs: Command Post (chat), Knowledge Base (doc list), Settings
- Connect to Railway backend via API
- Clerk JWT passed with every request
- Role-based features (admin sees everything, demo is limited)

### Phase 3: Deploy FastAPI Backend to Railway (Separate session)
- Strip Electron wrapper from Pipeline Penny
- Remove Ollama dependency, swap to Claude embeddings API
- Containerize FastAPI + FAISS
- Deploy to Railway
- Set up penny-api.pipelinepunks.com subdomain (CNAME to Railway)
- Add Clerk JWT verification middleware
- Environment variables: ANTHROPIC_API_KEY, CLERK_SECRET_KEY

### Phase 4: Knowledge Base Management (Separate session)
- Admin panel to upload/manage knowledge docs
- Ingest pipeline: upload → chunk → embed → FAISS index
- View indexed documents, re-index, delete
- CSV drop support (upload CSV, auto-vectorize)

### Phase 5: Polish & Demo Prep (Separate session)
- Demo mode for prospects (limited queries, watermark, "Want this for your business?" CTA)
- Mobile responsive
- Loading states, error handling
- Custom subdomain or path for white-label client instances (future)

---

## Cost Impact

| Item | Current | After |
|---|---|---|
| Vercel Pro | $25/mo (already paying) | $25/mo (no change) |
| Railway Hobby | $5/mo (already paying) | $5-10/mo (Pipeline Penny backend) |
| Claude API | $0 | ~$5-20/mo (embeddings + inference) |
| Supabase Pro | $25/mo | $0 (downgrade to free) |
| Fiverr | $15/mo | $0 (let expire 3/10) |
| ChatGPT Teams | $60/mo | $20/mo (1 Plus seat) |
| **Net change** | | **Save ~$45-60/mo** |

---

## Immediate Action Items (Today)

### In this chat:
1. ✅ Create this deployment plan
2. Build the new stripped-down landing page for pipelinepunks.com
3. Create the /penny route with Clerk protection
4. Add "demo" role support
5. Output all files ready to push to GitHub

### After this chat (Jacob does):
1. Push code changes to Pipeline-Punks/pipeline-punks-v2
2. Verify deploy on Vercel
3. Downgrade Supabase Pro → Free
4. Let Fiverr expire 3/10
5. Evaluate ChatGPT Teams → Plus downgrade

### Next chat session:
1. Build the actual Pipeline Penny chat UI for /penny
2. Set up Railway deployment for FastAPI backend
