# Compliance Government Module

A comprehensive federal compliance platform for small businesses and government contractors. Provides guided compliance workflows, AI-powered analysis, and real-time implementation tracking across 102+ regulatory frameworks.

Built by **True North Data Strategies**

## What This Does

Compliance management is broken. Small businesses spend weeks navigating overlapping federal requirements while regulatory changes slip past unnoticed. This platform aggregates federal compliance requirements into a single system, connects them to your specific business context, and tracks implementation progress in real time.

102 compliance templates. 10 skill domains. One place to manage it all.

## Platform Overview

**Architecture**: FastAPI backend + Next.js frontend + FAISS vector database + Claude AI

**Core Capabilities**:
- **Intake Wizard**: 15-minute contextual assessment of your compliance posture
- **RAG Query System**: AI-powered Q&A against 102+ federal templates and 10 skill domains
- **Implementation Tracker**: Real-time status tracking for each requirement
- **Maturity Scoring**: Automatic compliance scoring across NIST CSF and similar frameworks
- **Template Library**: Searchable access to all compliance documentation

**Coverage**: Government contracting, cloud security, data privacy, internal controls, audit, operations, and more.

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI or Anthropic API key
- 2GB RAM minimum

### Installation

```bash
make install
```

Installs Python and Node.js dependencies.

### Setup Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY` for LLM)
- `OPENAI_API_KEY` (for embeddings)

### Index Content

```bash
make index
```

Builds vector store from compliance content. One-time setup.

### Run Locally

```bash
make dev
```

Starts backend (http://localhost:8000) and frontend (http://localhost:3000) in parallel.

API documentation available at http://localhost:8000/docs

## Project Structure

```
compliance-gov-module/
├── agent/                      # FastAPI backend
│   ├── api.py                 # REST API endpoints
│   ├── agent.py               # RAG & compliance logic
│   └── cli.py                 # CLI interface
│
├── providers/                  # LLM provider abstractions
│   ├── base.py                # Provider interface
│   ├── anthropic_provider.py  # Claude integration
│   ├── openai_provider.py     # GPT integration
│   └── factory.py             # Provider factory
│
├── tools/                      # Utility scripts
│   ├── index_content.py       # Vector store builder
│   ├── generate_metadata.py   # Metadata generator
│   └── data_processor.py      # Data processing
│
├── frontend/                   # Next.js application
│   ├── pages/                 # Route pages
│   ├── components/            # React components
│   └── public/                # Static assets
│
├── data/
│   ├── original_content/      # Raw compliance content
│   ├── vector_store/          # FAISS index
│   └── tracker/               # Implementation tracking
│
├── deploy/                     # Deployment scripts
│   ├── cloud-run-deploy.sh   # GCP Cloud Run deployment
│   └── vercel-deploy.md      # Vercel frontend deployment
│
├── tests/                      # Test suite
├── Dockerfile                  # API container
├── Dockerfile.frontend         # Frontend container
├── docker-compose.yml          # Multi-container orchestration
├── Makefile                    # Developer commands
├── config.py                   # Configuration management
└── requirements.txt            # Python dependencies
```

## Features

### 1. Compliance Templates (102+)

Pre-built templates for:
- NIST Cybersecurity Framework (CSF)
- NIST Risk Management Framework (RMF)
- FedRAMP requirements
- DFARS cybersecurity requirements
- HIPAA compliance
- PCI DSS requirements
- SOC 2 controls
- ISO 27001 alignment
- Government contracting rules (FAR, DFARS)
- And 20+ more frameworks

### 2. 10 Compliance Domains

- **Security Governance**: Board oversight, risk management
- **Internal Compliance**: Policies, procedures, controls
- **Data Handling & Privacy**: Data classification, access controls
- **Cloud Platform Security**: AWS/Azure/GCP-specific requirements
- **Business Operations**: Financial controls, vendor management
- **Government Contracting**: SBIR, 8(a), women-owned, HUBZone
- **Contracts & Risk**: Insurance, indemnification, liability
- **Compliance Audit**: Internal audit, external audit prep
- **Compliance Research**: Requirements analysis, impact assessment
- **Usage Guides**: Training materials and implementation guides

### 3. AI-Powered Analysis

RAG system answers compliance questions using the full template library.

Example:
```
"What are the specific encryption requirements for data in transit?"
"How do we implement role-based access controls for the CTO?"
"What evidence do we need for SOC 2 Type II audit?"
```

### 4. Implementation Tracker

Track progress on each requirement:
- Evidence collection status
- Responsible person
- Target completion date
- Implementation notes
- Audit-ready documentation

### 5. Maturity Scoring

Automatic scoring across frameworks:
- NIST CSF maturity levels (1-5)
- FedRAMP risk levels
- SOC 2 control satisfaction
- Internal compliance percentage

## Development

### Local Development

```bash
make dev
```

Backend runs with hot-reload. Modify code and save.

### Run Tests

```bash
make test
```

### Docker

```bash
make docker-up
```

Runs full stack (API + frontend + optional Ollama) in containers.

### Code Quality

```bash
make lint
```

## Deployment

### API: Google Cloud Run

```bash
bash deploy/cloud-run-deploy.sh [PROJECT_ID] [REGION]
```

Builds, pushes to GCR, and deploys to Cloud Run. Scales to 0 when not in use.

### Frontend: Vercel

```bash
make deploy-vercel
```

Or see `deploy/vercel-deploy.md` for manual deployment.

## Configuration

### Environment Variables

```
COMPLIANCE_LLM_PROVIDER=anthropic          # or openai
COMPLIANCE_LLM_MODEL=claude-sonnet-4-20250514
COMPLIANCE_EMBEDDING_PROVIDER=openai
COMPLIANCE_EMBEDDING_MODEL=text-embedding-3-small
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
COMPLIANCE_ENV=development                 # or production
COMPLIANCE_LOG_LEVEL=INFO
NEXT_PUBLIC_API_URL=http://localhost:8000
```

See `.env.example` for full configuration.

### Supported LLM Providers

**Anthropic Claude** (recommended):
- claude-sonnet-4-20250514 (best balance)
- claude-opus-4-1-20250805 (most capable)
- claude-haiku-4-5-20251001 (fastest)

**OpenAI GPT**:
- gpt-4-turbo (best quality)
- gpt-4 (standard)
- gpt-3.5-turbo (budget)

### Embedding Models

**OpenAI** (primary):
- text-embedding-3-large (most accurate)
- text-embedding-3-small (balanced, recommended)
- text-embedding-ada-002 (legacy)

## Make Commands

| Command | Purpose |
|---------|---------|
| `make install` | Install all dependencies |
| `make index` | Build vector store from compliance content |
| `make dev-api` | Start FastAPI backend (port 8000) |
| `make dev-frontend` | Start Next.js frontend (port 3000) |
| `make dev` | Start both backend and frontend |
| `make test` | Run test suite |
| `make docker-up` | Start full stack in Docker |
| `make docker-down` | Stop Docker containers |
| `make clean` | Remove generated files and caches |
| `make lint` | Run code quality checks |
| `make deploy-gcp` | Deploy API to Cloud Run |
| `make deploy-vercel` | Deploy frontend to Vercel |

## API Endpoints

### Health & Info

```
GET /health              # Service health
GET /info                # API information
```

### Compliance Queries

```
POST /query              # Query compliance templates
POST /query-batch        # Batch query
```

### Implementation Tracking

```
GET /tracker/:id         # Get tracking status
POST /tracker            # Create new tracking
PUT /tracker/:id         # Update tracking
```

### Templates

```
GET /templates           # List all templates
GET /templates/:id       # Get template details
POST /templates/search   # Search templates
```

Full API documentation: http://localhost:8000/docs

## Technology Stack

**Backend**:
- FastAPI 0.100+
- LangChain 0.2+
- FAISS vector database
- Pydantic validation

**Frontend**:
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS

**LLM & Embeddings**:
- Anthropic Claude API
- OpenAI GPT & embeddings
- Optional: Ollama for local models

**Infrastructure**:
- Docker & Docker Compose
- Google Cloud Run
- Vercel

## Troubleshooting

### Vector Store Not Building

Ensure all markdown files are in `data/original_content/`:

```bash
ls -la data/original_content/
```

### API Won't Start

Check environment variables:

```bash
python config.py
```

Missing API keys will be reported.

### Frontend Can't Connect to Backend

Verify `NEXT_PUBLIC_API_URL` in `.env`:

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Docker Build Fails

Ensure Docker daemon is running and you have 3GB+ free space.

```bash
docker system prune
make docker-build
```

## Contact & Support

**Product Owner**: Jacob Johnston
**Phone**: 555-555-5555
**Email**: jacob@truenorthstrategyops.com
**Company**: True North Data Strategies

## License

Proprietary. All rights reserved.

---

**Last Updated**: March 2026
**Platform Version**: 1.0.0
**Status**: Production Ready
