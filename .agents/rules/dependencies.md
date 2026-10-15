# Dependency Management Rules

## Dependency Addition Policy
- Do NOT add new dependencies unless strictly necessary.
- Before proposing any dependency:
  1. Verify whether the required capability already exists in native browser or Node.js APIs (e.g. `Intl.DateTimeFormat` over `moment`).
  2. Verify whether an existing project dependency already fulfills the need.
  3. Inspect maintenance activity, TypeScript types, vulnerabilities, and bundle footprint.
  4. Formulate a technical justification explaining why custom code is insufficient.
  5. Ask for explicit user permission before installing.

## Dependency Pruning
- Routinely identify unused or bloated packages.
- Explain obsolescence and request human approval before removing entries from `package.json`.
