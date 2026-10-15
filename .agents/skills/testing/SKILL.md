---
name: testing
description: Workflow for multi-tier automated testing, mock management, and coverage validation across Vitest, Storybook, and Cypress.
---

# Testing Workflow

## Purpose
Maintain test pyramid integrity (Storybook component interaction tests, Vitest isolated logic, and Cypress user journeys) with a 90%+ overall coverage target.

## Execution Sequence
1. **Identify Test Boundary**:
   - Pure logic / converters / mappers / utilities -> Vitest (`*.test.ts`).
   - Component rendering / states / accessibility -> Storybook (`*.stories.tsx`).
   - Critical multi-step user flows -> Cypress (`cypress/e2e/*.cy.ts`).
2. **Mocking Standards**:
   - Never query live external WeatherAPI endpoints in automated tests.
   - Use MSW or deterministic test fixtures in `cypress/fixtures/` and test helpers.
   - Cover success, malformed payload, rate limit (429), and upstream failure (500) scenarios.
3. **Execution & Validation**:
   - Request permission to run test suites:
     - `npm run test:coverage` for unit/logic tests.
     - `npm run component:headless` for Cypress component tests.
     - `npm run e2e:headless` for end-to-end user journeys.
4. **Coverage Analysis**:
   - Verify coverage report artifacts (`coverage/html`, `coverage/coverage-summary.json`).
   - Never weaken assertions or remove tests to artificially pass or inflate coverage metrics.
