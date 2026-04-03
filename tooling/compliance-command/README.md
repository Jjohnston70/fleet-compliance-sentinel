# compliance-command

**Compliance Document Generation Module**  
True North Data Strategies | v1.0.0

---

## Overview

`compliance-command` is a TNDS Command Module that automates compliance document generation. Clients submit company information once, and the module generates all 7 compliance packages with data auto-populated into templates.

### Key Features

- **Single Intake** — Company submits info once, never repeat
- **Auto-Population** — {{PLACEHOLDER}} tokens replaced with company data
- **7 Compliance Packages** — Internal Compliance, Security, Data Handling, Government Contracting, Google Partner, Business Operations, Advanced (CMMC/FedRAMP)
- **Idempotent Generation** — Re-run overwrites, never duplicates
- **Firestore Persistence** — Production-ready with in-memory fallback
- **PDF & DOCX Output** — Multiple document formats
- **LLM Integration** — Exposed as tools for AI agents

---

## The 7 Packages

1. **Internal Compliance Policy** — Standards and procedures
2. **Security Compliance Handbook** — Security policies
3. **Data Handling & Privacy** — Privacy and data protection
4. **Government Contracting** — Federal contracting requirements
5. **Google Partner** — Google partnership compliance
6. **Business Operations** — General business compliance
7. **Advanced Compliance** — CMMC, FedRAMP readiness

---

## Company Information Schema (40+ fields)

### Core
- `company_name` (required) — Legal name
- `company_short_name` — Abbreviated name
- `address`, `city`, `state`, `zip` — Address
- `website`, `company_email`, `company_phone`

### Legal
- `ein` — Tax ID
- `state_of_incorporation`, `year_founded`, `entity_type`

### Government
- `cage_code`, `duns_number`, `sam_uei`
- `naics_codes`, `sic_codes`
- `contract_types`, `clearance_level`, `set_aside_status`

### Personnel
- `ceo`, `cfo`, `cto`, `ciso`
- `primary_contact` (required), `it_poc`, `security_poc`, `compliance_poc`, `hr_director`

### Operations
- `employee_count`, `annual_revenue`
- `remote_workforce`, `cloud_provider`, `email_platform`
- `insurance_carrier`, `cyber_insurance`

---

## Setup

### Local Development

```bash
npm install
cp .env.example .env
npm test
npm run build
```

### Firestore Production Setup

1. Create Google Cloud project
2. Enable Firestore
3. Create service account with Datastore.user role
4. Download service account key JSON
5. Set environment variables:
   ```env
   GOOGLE_CLOUD_PROJECT=your-project-id
   FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/key.json
   ```

### Deploy to Vercel

```bash
vercel link
vercel env add GOOGLE_CLOUD_PROJECT
vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
vercel deploy --prod
```

---

## API Examples

### Submit Company
```bash
curl -X POST https://your-app.vercel.app/api/compliance/submit-company-info \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Federal",
    "primaryContact": "Jane Doe",
    "ein": "12-3456789",
    "ceo": "John Smith"
  }'
```

### Generate Package 1
```bash
curl -X POST https://your-app.vercel.app/api/compliance/generate-package \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "comp_abc123",
    "packageNumber": 1
  }'
```

### Generate All 7 Packages
```bash
curl -X POST https://your-app.vercel.app/api/compliance/generate-all \
  -H "Content-Type: application/json" \
  -d '{"companyId": "comp_abc123"}'
```

### Get Package Status
```bash
curl -X POST https://your-app.vercel.app/api/compliance/get-package-status \
  -H "Content-Type: application/json" \
  -d '{"companyId": "comp_abc123"}'
```

### List All Companies
```bash
curl -X GET https://your-app.vercel.app/api/compliance/list-companies
```

---

## LLM Tools

### 1. generate_compliance_package
Generate one package (1-7) for a company.
- `companyId` (string)
- `packageNumber` (integer 1-7)

### 2. get_company_info
Retrieve company profile.
- `companyId` (string)

### 3. check_package_status
Get generation status for all 7 packages.
- `companyId` (string)

### 4. list_frameworks
List compliance frameworks (CMMC, SOC2, FedRAMP, NIST, HIPAA, PCI).

---

## Template Placeholders

40+ available placeholders using `{{PLACEHOLDER}}` syntax:

- `{{COMPANY_NAME}}`, `{{COMPANY_SHORT_NAME}}`
- `{{FULL_ADDRESS}}`, `{{WEBSITE}}`
- `{{EIN}}`, `{{CAGE_CODE}}`, `{{SAM_UEI}}`
- `{{CEO}}`, `{{CFO}}`, `{{CTO}}`, `{{CISO}}`
- `{{PRIMARY_CONTACT}}`, `{{IT_POC}}`, `{{SECURITY_POC}}`
- `{{EMPLOYEE_COUNT}}`, `{{ANNUAL_REVENUE}}`
- `{{CLOUD_PROVIDER}}`, `{{EMAIL_PLATFORM}}`
- `{{CURRENT_DATE}}`, `{{CURRENT_YEAR}}`, `{{GENERATED_BY}}`
- And 15+ more...

Unresolved placeholders are tracked and returned in responses.

---

## Testing

```bash
npm test              # Run all tests
npm run test:watch   # Watch mode
```

Covers: idempotency, template rendering, company CRUD, integration workflows, error handling.

---

## Architecture

```
src/
├── services/          # Business logic (CompanyService, PackageService, etc.)
├── data/              # Repository layer (in-memory, Firestore adapter)
├── api/               # HTTP routing, Next.js handlers
├── config/            # Module metadata
└── tools.ts           # LLM tool definitions
tests/                 # Unit and integration tests
adapters/              # TypeScript and Python examples
```

---

## Compliance Frameworks

Supports 6 frameworks with controls and implementation tracking:
- **CMMC v2.0** — DoD Cybersecurity Maturity Model
- **SOC 2** — Service Organization Controls
- **FedRAMP** — Federal Risk and Authorization Management
- **NIST 800-53** — Security controls for federal systems
- **HIPAA** — Health information privacy
- **PCI DSS** — Payment card security

---

## License

Proprietary — True North Data Strategies

**Version:** 1.0.0 | **Updated:** 2024-03-30
