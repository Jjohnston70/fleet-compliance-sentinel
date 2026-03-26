# Dependency Audit

Date: 2026-03-25  
Scope: `package.json` + `package-lock.json` + workspace dependency graph  
Commands run:

```bash
npm audit --json
npm outdated --json
npm ls --all --json
npm ls flatted minimatch next xlsx --depth=5
```

## Findings

| Finding Type | Package(s) | Evidence | Risk | Recommended Action |
|---|---|---|---|---|
| Known vulnerabilities | `next@15.5.9` | `npm audit` reports multiple advisories affecting `<15.5.14` | High | Upgrade to `next@15.5.14` minimum (short-term) and plan controlled upgrade path to Next 16.x. |
| Known vulnerabilities | `xlsx@0.18.5` | `npm audit` reports high-severity prototype pollution + ReDoS; `fixAvailable: false` | High | Replace `xlsx` with a maintained alternative (or pin to patched fork/internal wrapper) before processing untrusted uploads in prod. |
| Known vulnerabilities (transitive) | `minimatch`, `flatted` via ESLint toolchain | `npm audit` and `npm ls` show vulnerable transitive paths (`eslint`/`flat-cache`) | High (dev/tooling path) | Upgrade lint stack (`eslint` + related plugins/configs) and re-run `npm audit`; accept temporary risk if only CI/dev usage. |
| Outdated >2 major versions | `@types/node` (`20.x` -> latest `25.x`) | `npm outdated --json` | Medium | Upgrade in a dedicated compatibility pass (Typescript + Next ecosystem validation). |
| Wrong dependency placement | `cheerio` currently in `dependencies` but used by `scripts/download-vendor-docs.mjs` only | source scan shows usage only in scripts path | Low | Move `cheerio` to `devDependencies` to reduce production runtime footprint. |
| Duplicate/transitive version spread | `minimatch` (`3.x`, `9.x`, `10.x`) | `npm ls minimatch` | Medium | Reduce version spread via dependency upgrades; avoid manual overrides unless upgrade path blocked. |
| Duplicate/transitive version spread | `@types/node` (`20.x`, `22.x`) | `npm ls --all --json` | Low | Expected in mixed tool/runtime graph; monitor and normalize during toolchain upgrade. |
| Duplicate/extraneous package | `@emnapi/runtime` (extraneous) | `npm ls --all --json` reports `extraneous` | Low | Run `npm prune` and ensure clean install in CI (`npm ci`) to prevent drift. |

## Package Classification Summary

- Correct in `dependencies` (runtime/server code): `next`, `react`, `react-dom`, `@clerk/nextjs`, `@neondatabase/serverless`, `@sentry/nextjs`, `xlsx`, `mammoth`, `pdf-parse`, `csv-parse`, `@upstash/ratelimit`, `@upstash/redis`.
- Candidate for `devDependencies`: `cheerio` (script-only current usage).
- No direct duplicate package declarations found in `package.json`.

## Priority Actions

1. Patch `next` to `15.5.14` immediately and re-run build/audit.
2. Decide mitigation plan for `xlsx` (replace or isolate/limit trust boundary).
3. Upgrade lint/toolchain packages to clear transitive `minimatch`/`flatted`.
4. Move `cheerio` to `devDependencies`.
5. Run `npm prune` and enforce `npm ci` in CI to prevent extraneous packages.

