---
name: bug-fixing
description: Systematic root-cause diagnosis, targeted remediation, and regression test protocol for bug fixes.
---

# Bug Fixing Workflow

## Purpose
Identify the root cause of an issue, design the minimal necessary remedy without masking symptoms, and guarantee regression coverage.

## Execution Sequence
1. **Diagnosis & Reproduction**:
   - Inspect the reported failure, error stack traces, and environment assumptions.
   - Contrast expected behavior vs. actual behavior.
   - Trace back to the origin (e.g. data mapper, edge-case null handling, timezone parsing, network failure).
2. **Root Cause Identification**:
   - Do not merely patch symptoms or add superficial null checks when the underlying model or contract is broken.
   - Assess potential side effects across dependent callers and components.
3. **Plan & Seek Approval**:
   - Formulate a targeted fix plan and describe regression test coverage.
   - Obtain user approval.
4. **Implement Fix & Regression Test**:
   - Implement the smallest coherent change to resolve the root cause.
   - Add a unit test or integration test explicitly targeting the failing edge case.
5. **Validate & Report**:
   - Request permission to run relevant Vitest or Cypress specs.
   - Report the root cause, fix applied, files changed, and regression test added.
