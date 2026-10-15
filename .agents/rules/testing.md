# Testing Rules

## Testing Layers
- **Storybook Interaction Tests**: Primary home for reusable component behavior, states, and accessibility checks.
- **Vitest**: Isolated unit tests for pure functions, utilities, math conversions, and logic not naturally represented in Storybook (`npm test`).
- **Integration Tests**: Multi-layer interaction tests utilizing MSW for external service mocking.
- **Cypress**: High-value end-to-end user journeys (search flow, favorites, geolocation denial/approval, offline fallback).

## Quality & Integrity Standards
- Target 90%+ overall project coverage without sacrificing test meaningfulness or gaming metrics.
- Automated tests must NEVER depend on live external WeatherAPI calls.
- AI must NEVER:
  - Delete a test to make CI pass.
  - Weaken an assertion merely to pass.
  - Skip failing tests without clear documented justification.
  - Change expected behavior solely to satisfy an incorrect test.
- Pre-existing test failures must be reported separately before proceeding.
