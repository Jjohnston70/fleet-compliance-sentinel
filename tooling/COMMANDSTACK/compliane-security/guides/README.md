# Operational Guides

This directory contains practical guides for working with the TNDS Platform.

---

## Available Guides

### [developer-onboarding.md](developer-onboarding.md)
**Audience:** New developers
**Time:** 30-60 minutes
**Purpose:** Get from zero to productive

**Contents:**
- System overview
- Prerequisites and setup
- Project structure walkthrough
- First hands-on tasks
- Key concepts explained
- Development workflow
- Common tasks
- Getting help resources

**Start here if you're new to TNDS!**

---

### [test-execution.md](test-execution.md)
**Audience:** Developers, QA engineers, CI/CD maintainers
**Time:** Reference guide
**Purpose:** Run, interpret, and debug tests

**Contents:**
- Quick start commands
- Test organization (conformance, implementation, integration)
- Test suite breakdown
- Interpreting test results
- Known test failures explained
- Debugging common issues
- CI/CD integration examples
- Test development guidelines

**Use this when running or writing tests.**

---

## Quick Start

### For New Developers
1. Read [developer-onboarding.md](developer-onboarding.md)
2. Complete the "First Tasks" section
3. Refer to [test-execution.md](test-execution.md) for testing

### For Experienced Contributors
1. Use [test-execution.md](test-execution.md) for test commands
2. Refer to [developer-onboarding.md](developer-onboarding.md#common-tasks) for specific tasks

---

## Guide Conventions

### Command Examples
All command examples use bash syntax:
```bash
# Comments explain what command does
npm test -- tests/templates/
```

### File Paths
File paths are relative to project root:
```
src/templates/loader.ts
docs/guides/README.md
```

### Status Indicators
- ✅ — Completed, working, production-ready
- ⚠️ — Partial, known issues, needs attention
- ❌ — Failed, blocked, not ready

---

## Related Documentation

### For Architecture Understanding
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — System design and invariants
- [docs/CONSTITUTION.md](../CONSTITUTION.md) — 148 validation rules
- [docs/control-layer/](../control-layer/) — Control layer documentation

### For Phase Information
- [TODO.md](../../TODO.md) — Phase roadmap and status
- [docs/PROGRESS.md](../PROGRESS.md) — Implementation progress
- [docs/phases/](../phases/) — Phase-by-phase completion reports

### For Project Overview
- [README.md](../../README.md) — Project introduction
- [FINAL_PROJECT_SUMMARY.md](../../FINAL_PROJECT_SUMMARY.md) — Executive summary
- [DOCUMENTATION_INDEX.md](../../DOCUMENTATION_INDEX.md) — Complete documentation index

---

## Future Guides (Planned)

These guides may be added as project evolves:
- **deployment-guide.md** — Production deployment (Phase 15)
- **troubleshooting-guide.md** — Common problems and solutions
- **api-reference.md** — API documentation
- **contributing-guide.md** — Contribution guidelines
- **security-guide.md** — Security best practices

---

**Last Updated:** 2026-02-07
**Maintained By:** TNDS Platform Team
