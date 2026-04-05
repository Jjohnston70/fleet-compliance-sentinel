# Compliance Government Module - Quick Start Guide

Get the backend running in 5 minutes.

## Prerequisites

- Python 3.10+
- pip (Python package manager)
- Anthropic API key (get one at https://console.anthropic.com)
- OpenAI API key (get one at https://platform.openai.com/api-keys)

## 1. Install Dependencies

```bash
cd /path/to/compliance-gov-module
pip install -r requirements.txt
```

Expected time: 2-3 minutes

## 2. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
# LLM Provider (anthropic or openai)
COMPLIANCE_LLM_PROVIDER=anthropic

# Embedding Provider (only openai supported)
COMPLIANCE_EMBEDDING_PROVIDER=openai

# API Keys (required)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Logging (DEBUG, INFO, WARNING, ERROR, CRITICAL)
COMPLIANCE_LOG_LEVEL=INFO
EOF
```

**Don't have API keys?**
- Get Anthropic: https://console.anthropic.com/
- Get OpenAI: https://platform.openai.com/api-keys

## 3. Choose Your Interface

### Option A: REST API Server (Recommended for Integration)

```bash
python -m uvicorn agent.api:app --reload
```

- Server runs on: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

**Test with curl:**
```bash
# Query compliance
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is HIPAA?"}'

# Get categories
curl http://localhost:8000/api/categories

# Run intake wizard
curl -X POST http://localhost:8000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "business_size": "5-20",
    "handles_phi": true,
    "federal_contracts": true,
    "frameworks_asked": ["hipaa", "nist"]
  }'
```

### Option B: Interactive CLI (Best for Exploration)

```bash
python -m agent.cli
```

- Type compliance questions
- View source citations
- Multi-turn conversations
- Type `help` for commands

**Example Session:**
```
You: What is NIST CSF?
Processing query...

ANSWER:
NIST CSF (Cybersecurity Framework) consists of five core functions...

SOURCES (3 references):
[1] data/original_content/government-contracting/templates/nist-csf.md
    Preview: The NIST Cybersecurity Framework...

Context: Used 5 document chunks
Conversation: Turn 1
```

## 4. Verify Everything Works

Run the integration test suite:

```bash
python test_backend.py
```

Expected output:
```
COMPLIANCE GOVERNMENT MODULE - Backend Integration Tests
================================================================================

Testing configuration...
✓ Configuration loaded successfully

Testing providers...
✓ LLM provider initialized: anthropic
✓ Embedding provider initialized: openai

Testing content loading...
✓ Found 127 markdown files

Testing agent initialization...
  Initializing ComplianceRAGAgent...
  Loading documents...
✓ Agent initialized successfully

Testing FastAPI application...
✓ Root endpoint working
✓ Health endpoint working
✓ Categories endpoint working (10 categories)

...

Results: 7/7 tests passed
✓ All backend tests passed! Backend is ready for use.
```

## 5. Common Use Cases

### Query a Compliance Question

**Via API:**
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What controls does NIST 800-171 require?"
  }'
```

**Via Code:**
```python
from agent.agent import get_agent

agent = get_agent()
result = agent.query("What is FedRAMP?")
print(result["answer"])
print(f"Sources: {len(result['sources'])}")
```

### Multi-Turn Conversation

**Via API:**
```bash
# Turn 1
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is HIPAA?", "use_history": true}'

# Turn 2
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "How does this apply to my cloud app?", "use_history": true}'
```

**Via Code:**
```python
agent = get_agent()
r1 = agent.chat("What frameworks do I need?", use_history=True)
r2 = agent.chat("Which is most critical?", use_history=True)
r3 = agent.chat("Show me an implementation plan", use_history=True)
```

### Scope Business Compliance Needs

```bash
curl -X POST http://localhost:8000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "business_size": "5-20",
    "handles_phi": true,
    "handles_pci": false,
    "federal_contracts": true,
    "cloud_platform": "google",
    "existing_docs": false,
    "frameworks_asked": ["nist", "hipaa", "fedramp"]
  }'
```

Returns: Recommended compliance skills with templates and priorities

### Track Implementation Progress

```bash
# Create tracker for a client
curl -X POST http://localhost:8000/api/tracker/acme-corp \
  -H "Content-Type: application/json" \
  -d @recommendations.json

# Update template status
curl -X PUT http://localhost:8000/api/tracker/acme-corp/template/01-security-policy \
  -H "Content-Type: application/json" \
  -d '{
    "status": "implemented",
    "evidence_link": "https://internal.example.com/policy",
    "notes": "Policy approved and deployed"
  }'

# Get compliance maturity score
curl http://localhost:8000/api/tracker/acme-corp/score
```

## 6. View API Documentation

Open your browser to: http://localhost:8000/docs

This shows all endpoints with:
- Request/response models
- Example payloads
- Try-it-out functionality
- Parameter descriptions

## 7. Project Structure

```
compliance-gov-module/
├── agent/                          # Backend (NEW)
│   ├── agent.py                    # RAG engine
│   ├── api.py                      # REST API (20+ endpoints)
│   └── cli.py                      # CLI interface
├── data/
│   ├── original_content/           # Compliance templates
│   └── tracker/                    # Client tracking (auto-created)
├── providers/                      # LLM providers
├── config.py                       # Configuration
├── requirements.txt                # Dependencies
├── BACKEND.md                      # Full documentation
├── IMPLEMENTATION_SUMMARY.md       # Implementation details
├── QUICKSTART.md                   # This file
└── test_backend.py                 # Integration tests
```

## 8. Configuration Reference

**Environment Variables:**

| Variable | Default | Required | Notes |
|----------|---------|----------|-------|
| COMPLIANCE_LLM_PROVIDER | anthropic | - | 'anthropic' or 'openai' |
| COMPLIANCE_EMBEDDING_PROVIDER | openai | - | Only 'openai' supported |
| ANTHROPIC_API_KEY | - | Yes* | *if using anthropic LLM |
| OPENAI_API_KEY | - | Yes | For embeddings |
| COMPLIANCE_LOG_LEVEL | INFO | - | DEBUG, INFO, WARNING, ERROR |
| COMPLIANCE_DATA_DIR | ./data | - | Base data directory |

## 9. Troubleshooting

### "ANTHROPIC_API_KEY environment variable is required"
```bash
# Set in .env or shell
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### "No markdown documents found"
- Check: `data/original_content/` exists
- Check: Files have `.md` extension
- Check: Directory structure is correct

### Agent takes long time to initialize
- First run creates FAISS vector store (~30-60 sec)
- Subsequent runs use cached store (~2-3 sec)
- This is normal behavior

### Port 8000 already in use
```bash
# Use different port
python -m uvicorn agent.api:app --port 8001
```

### ModuleNotFoundError or ImportError
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

## 10. Next Steps

- **Read Full Documentation:** See BACKEND.md
- **Check Implementation Details:** See IMPLEMENTATION_SUMMARY.md
- **Explore API Endpoints:** Visit http://localhost:8000/docs
- **Integrate with Frontend:** Connect to /api/* endpoints
- **Deploy to Production:** See deployment section in BACKEND.md

## 11. Example Scenarios

### Scenario 1: Small Tech Startup (5 people)

```bash
# Get recommendations
curl -X POST http://localhost:8000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "business_size": "5-20",
    "handles_phi": false,
    "handles_pci": false,
    "federal_contracts": false,
    "cloud_platform": "aws",
    "existing_docs": false,
    "frameworks_asked": ["iso27001"]
  }'

# Result: Focus on security-governance, internal-compliance, cloud-platform-security
```

### Scenario 2: Healthcare Startup (20 people, pursuing federal contracts)

```bash
curl -X POST http://localhost:8000/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "business_size": "5-20",
    "handles_phi": true,
    "handles_pci": false,
    "federal_contracts": true,
    "cloud_platform": "google",
    "existing_docs": true,
    "frameworks_asked": ["hipaa", "nist", "fedramp"]
  }'

# Result: CRITICAL priorities for government-contracting, data-handling-privacy
```

### Scenario 3: Query About Specific Framework

```bash
# Via CLI
You: What is the difference between NIST 800-53 and NIST 800-171?

# Via API
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the difference between NIST 800-53 and NIST 800-171?"}'
```

## Support

- **Documentation:** See BACKEND.md and IMPLEMENTATION_SUMMARY.md
- **Code:** See agent/*.py files (well-documented)
- **Tests:** Run `python test_backend.py` to verify setup
- **Issues:** Check Troubleshooting section above

---

**Ready to start?** Pick Option A (API) or Option B (CLI) and get going!
