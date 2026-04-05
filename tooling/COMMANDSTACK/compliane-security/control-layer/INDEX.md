# Control Layer Documentation

**Complete reference for the TNDS control layer - immutable command authority loaded at startup.**

---

## Quick Links

| Document | Purpose | Audience |
|----------|---------|----------|
| **[README.md](README.md)** | Complete usage guide (start here) | Everyone |
| **[quickstart.md](quickstart.md)** | Admin quick start (5-10 min) | Admins |
| **[integration.md](integration.md)** | Technical integration guide | Developers |
| **[hardening.md](hardening.md)** | Security hardening procedures | Admins |
| **[architecture.md](architecture.md)** | Architecture diagrams & data flow | Architects |
| **[enforcement-simple.md](enforcement-simple.md)** | Simplified diagram | Executives |
| **[acceptance-checklist.md](acceptance-checklist.md)** | Acceptance criteria | QA |
| **[manual-steps.md](manual-steps.md)** | Manual setup steps | Admins |

---

## What is the Control Layer?

The control layer is **immutable command authority** that defines how the platform operates:

- **Loaded at startup** before any execution
- **Frozen in memory** with Object.freeze()
- **Version-pinned** to prevent drift
- **Hash-verified** for integrity
- **Not searchable** by agents
- **Selected by authority**, not discovered

---

## Getting Started

### For New Users
1. Read [README.md](README.md) - Complete usage guide
2. Run through [quickstart.md](quickstart.md) - 5-10 minute setup

### For Developers
1. Read [integration.md](integration.md) - How to integrate
2. Review [architecture.md](architecture.md) - System design
3. Check [acceptance-checklist.md](acceptance-checklist.md) - Requirements

### For Admins
1. Complete [manual-steps.md](manual-steps.md) - Initial setup
2. Follow [hardening.md](hardening.md) - Security hardening
3. Use [quickstart.md](quickstart.md) - Day-to-day operations

### For Executives
1. View [enforcement-simple.md](enforcement-simple.md) - High-level diagram
2. Review [acceptance-checklist.md](acceptance-checklist.md) - What's implemented

---

## Key Features

### 1. Immutability
- All artifacts frozen with `Object.freeze()`
- Freeze assertion verifies immutability
- Version pin prevents accidental changes
- No runtime modification possible

### 2. Fail-Closed
- Missing files → throws error
- Invalid data → throws error
- Version mismatch → throws error
- Freeze failure → throws error
- No fallbacks, no defaults

### 3. Isolation
- Not exposed to vector search
- Not exposed to embeddings
- Not discoverable by agents
- Selected by authority only

### 4. Integrity
- SHA-256 hash computed at load
- Hash logged for audit trail
- Cryptographic verification
- Tamper detection

---

## Documentation Structure

```
docs/control-layer/
├── INDEX.md (this file)          # Navigation hub
├── README.md                     # Complete usage guide
├── quickstart.md                 # Quick start (admins)
├── integration.md                # Integration guide (developers)
├── hardening.md                  # Hardening procedures (admins)
├── architecture.md               # Architecture diagrams
├── enforcement-simple.md         # Simplified diagram (executives)
├── acceptance-checklist.md       # Acceptance criteria (QA)
└── manual-steps.md               # Manual setup steps (admins)
```

---

## Related Documentation

- **Main README**: [../../README.md](../../README.md)
- **Architecture**: [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
- **Final Summary**: [../../FINAL_PROJECT_SUMMARY.md](../../FINAL_PROJECT_SUMMARY.md)
- **Compliance**: [../compliance/](../compliance/)

---

**Last Updated:** 2026-02-07
**Status:** Production-ready, battle-hardened
