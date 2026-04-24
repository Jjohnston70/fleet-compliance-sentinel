<div align="center">

# Fleet Compliance Sentinel
### Multi-tenant fleet and DOT compliance operations platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![TNDS](https://img.shields.io/badge/TNDS-truenorthstrategyops.com-0A8EA0?style=for-the-badge)](https://truenorthstrategyops.com)

<img src="fleet-compliance-sentinel.png" alt="Fleet Compliance Sentinel" width="260" />

</div>

## What this is
Fleet Compliance Sentinel is a Next.js application for fleet operations, compliance tracking, telematics risk workflows, and regulated training support.
It is structured as a product shell plus modular tooling packages used by operators.

## What it does
- Provides fleet compliance dashboards, alerts, and records workflows
- Exposes module tools through a command-center UI
- Supports telematics sync and risk-scoring workflows
- Includes training and onboarding workflow surfaces

## How it works
```text
Operator UI (Next.js)
  -> API routes (auth + policy checks)
    -> Postgres + integrations (telematics, billing, notifications)
      -> module tooling packages for specialized workflows
```

## Quick start
```bash
npm install
npm run dev
```

## Project structure
```text
src/                application pages, APIs, components, libraries
railway-backend/    backend integration services
packages/           shared workspace packages
docs/               operational and architecture documentation
tooling/            specialized command modules
knowledge/          public regulation/reference content
```

## License
MIT. See [LICENSE](LICENSE).

## Built by
Jacob Johnston | True North Data Strategies LLC | SDVOSB
