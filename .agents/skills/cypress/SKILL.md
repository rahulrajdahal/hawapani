---
name: cypress
description: Workflow for crafting, executing, and maintaining reliable end-to-end and component tests using Cypress.
---

# Cypress Testing Workflow

## Purpose
Safeguard critical user journeys (location lookup, autocomplete navigation, favorites persistence, geolocation prompts, unit switching, offline behaviors) via Cypress.

## Execution Sequence
1. **Journey Selection**:
   - Focus on high-value end-to-end paths rather than unit-level validations:
     - Search input debouncing and dropdown selection.
     - Geolocation permission grant vs. denial with fallback to default city.
     - LocalStorage favorites add/remove operations.
     - °C / °F scale toggling and data propagation.
     - Offline cache loading vs. offline fallback game.
2. **Selector & Wait Discipline**:
   - Use resilient, accessible selectors (ARIA roles, accessible labels, `data-testid` when necessary).
   - Avoid hardcoded `cy.wait(number)` timeouts; wait on deterministic element presence or route handler intercepts (`cy.intercept()`).
3. **Execution**:
   - Run interactive runner during development (`npm run e2e` or `npm run component`).
   - Run headless suite for CI verification (`npm run e2e:headless` or `npm run component:headless`).
   - Inspect screenshot and video artifacts upon failure.
