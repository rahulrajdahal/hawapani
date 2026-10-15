---
name: release
description: Pre-flight checklist and validation workflow for Vercel preview branch deployment and production release.
---

# Release & Deployment Workflow

## Purpose
Ensure zero-defect continuous delivery through Vercel Preview deployments to production.

## Deployment Flow
```
feature/<branch>
  -> CI (quality.yml: Lint, Vitest, Cypress, Storybook, Build)
  -> Vercel Preview Deployment
  -> Preview Verification & Smoke Testing
  -> Merge to 'main'
  -> Vercel Production Deployment
  -> Production Smoke Verification
```

## Pre-Release Checklist
1. **Automated Verification**:
   - `npm run lint` passes with zero TypeScript diagnostics.
   - `npm run test:coverage` passes with target coverage.
   - Headless Cypress E2E passes on critical journeys.
   - `npm run build` succeeds without production bundle warnings.
2. **Environment & Secrets**:
   - Verify `WEATHER_API_KEY` is configured in Vercel project environment variables.
   - Confirm no test or mock credentials enter the production build.
3. **Smoke Verification**:
   - Verify initial load displays default city without blank layout shift.
   - Verify search autocomplete, unit scale toggle, and favorites persistence.
   - Verify offline fallback page renders when network is disconnected.
