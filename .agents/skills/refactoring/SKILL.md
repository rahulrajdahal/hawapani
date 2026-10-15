---
name: refactoring
description: Discipline and safety protocols for behavior-preserving code refactoring and technical debt remediation.
---

# Refactoring Workflow

## Purpose
Safely improve internal code architecture, type hygiene, or maintainability without breaking observable runtime behavior or public APIs.

## Execution Sequence
1. **Pre-Refactor Assessment**:
   - Verify current test suite coverage on the target module.
   - Run tests (`npm test`) before making modifications to ensure a green baseline.
   - Identify all dependent callers and components.
2. **Scope Limitation**:
   - Refactor only the targeted area.
   - Never combine unrelated broad rewrites, formatting changes, or dependency upgrades into a refactoring pass.
3. **Incremental Migration**:
   - Extract logic into pure utility functions or custom hooks.
   - Maintain backwards compatibility during transitions where applicable.
4. **Post-Refactor Verification**:
   - Re-run unit and integration tests.
   - Review git diff carefully to confirm zero unintended behavioral or visual regressions.
   - Update relevant documentation in `docs/` and Storybook stories if internal contracts shifted.
