# Onboarding Phase 6 Release-Gate Plan

Status: In progress  
Date: 2026-04-06  
Scope: Release-gate hardening layered on top of the canonical onboarding orchestration spec (`ONBOARDING_ORCHESTRATION_IMPLEMENTATION_SPEC.md`).

## Why Phase 6 Exists

The canonical onboarding spec formally defines Phases 1-5. This Phase 6 plan is the execution layer for:

1. Section 15 acceptance scenarios.
2. Section 16 CI/build verification gate.
3. Section 17 definition-of-done evidence.

## Phase 6 TODO Breakdown

| TODO | Goal | Deliverables | Gate |
|---|---|---|---|
| `P6-T1` Automated acceptance matrix | Make release scenarios executable and repeatable in CI | `phase6-release-gate.test.ts` covering spec scenarios 1-5, plus npm script | Green test run proves deterministic behavior across two orgs |
| `P6-T2` API/contract drift checks | Prevent accidental changes to onboarding mutation contracts | Static contract assertions for required onboarding APIs/events/guards | Build/test fails on route contract drift |
| `P6-T3` Observability operations binding | Ensure metrics/alerts are actionable by operators | Dashboard + alert rule manifests/runbook command snippets | Simulated failures trigger expected alert keys |
| `P6-T4` Evidence pack + sign-off checklist | Produce auditable release artifacts for go/no-go | Operator checklist, test log template, build verification capture, residual risk record | Release decision can be made without ad hoc reconstruction |

## Implementation Slice Started

`P6-T1` is now the active slice.

Slice deliverables:

1. Add a dedicated test suite for the release-gate acceptance matrix.
2. Add a dedicated test command (`npm run test:onboarding-phase6`).
3. Validate with local run output and keep it build-safe.

## Exit Criteria for This Slice

1. All five spec acceptance scenarios have explicit test coverage.
2. Matrix includes two-org isolation assertions.
3. New suite passes locally and does not break `npm run build`.
