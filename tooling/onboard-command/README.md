# onboard-command TNDS Module

Enterprise Google Workspace provisioning and employee onboarding HYBRID TypeScript service.

## Overview

onboard-command orchestrates the complete employee onboarding process for Google Workspace, including:
- User creation and configuration
- License assignment
- Drive and folder structure setup
- Email label configuration
- Document generation
- Rollback and recovery operations
- Comprehensive audit logging

## Architecture

The module follows a 6-layer architecture:

```
src/
  data/           # Firestore schema types, in-memory repository, seed data
  services/       # State machine, queue, documents, rollback, folders, audit
  api/            # REST endpoint handlers
  hooks/          # Queue processor automation
  config/         # Department configs, branding, defaults
  reporting/      # Status and audit reports
```

### Key Services

- **StateMachine**: Orchestrates onboarding workflow (pending -> provisioning -> complete/partial/failed)
- **QueueService**: Manages provisioning queue with retry logic (max 3 retries)
- **DocumentGenerator**: Template-based document generation (proposal, MSA, SOW, checklist)
- **RollbackEngine**: Reverts provisioning operations on failure
- **FolderService**: Creates department-specific folder structures (7 default folders)
- **AuditService**: Compliance logging (no PII in logs)

## Quick Start

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```env
MODE=test                              # test or production
FIREBASE_PROJECT_ID=your-project      # Firebase project ID
FIRESTORE_COLLECTION_PREFIX=onboard   # Firestore collection prefix
BRANDING_PRIMARY_COLOR=#1a3a5c        # Navy
BRANDING_SECONDARY_COLOR=#3d8eb9      # Teal
BRANDING_COMPANY_NAME=Your Company
LOG_RETENTION_DAYS=90
MAX_QUEUE_RETRIES=3
DEFAULT_DEPARTMENT=Operations
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run typecheck       # TypeScript validation
```

### Build

```bash
npm run build           # Compile TypeScript
npm run dev            # Watch and rebuild
```

## Quick Start

### Installation

```bash
npm install
```

### Running Tests

```bash
npm test
npm run typecheck
```

## Default Department Configs

5 pre-configured departments with 7-folder structure:
- Engineering, Operations, Sales, Finance, Admin

## Workflow States

pending -> provisioning -> complete/partial/failed/rolled_back

## Hybrid Architecture

**TypeScript (src/)**: Business logic, state machine, queue, documents, audit
**Apps Script (future)**: Google Workspace Admin SDK integration

See `apps-script/README.md` for integration details.

## LLM Tools

- start_onboarding
- check_onboarding_status
- rollback_onboarding
- get_audit_log
- list_onboarding_requests
- get_queue_status
- process_next_queue_item
- get_department_config
- get_onboarding_status_report
- get_audit_report

## License

MIT
