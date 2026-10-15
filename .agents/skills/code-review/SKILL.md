---
name: code-review
description: Structured code review protocol prioritizing correctness, security, regression risks, accessibility, and maintainability.
---

# Code Review Workflow

## Purpose
Systematically assess proposed or existing code changes against project architectural standards and security rules.

## Review Priority Hierarchy
1. **Correctness & User Intent**: Does the code satisfy the exact requirement without edge-case regressions?
2. **Security & Privacy**: Are API keys protected behind server boundaries? Are inputs sanitized?
3. **Regression Risk**: Can this change break existing tests, layouts, or callers?
4. **Architecture & Clean Boundaries**: Does it respect Server vs. Client component boundaries and Radix wrapper rules?
5. **Accessibility**: Are keyboard navigation, visible focus, and screen-reader semantics intact?
6. **Performance**: Does it avoid bundle bloat, duplicate network requests, or excessive re-renders?
7. **Test Coverage**: Are unit, component, or E2E tests added for new logic?
8. **Maintainability & Documentation**: Are code comments restricted to non-obvious explanations?

## Output Structure
Findings must be categorized strictly as:
- **Must fix**: Critical bugs, security flaws, or breaking regressions.
- **Should fix**: Important architectural or accessibility improvements.
- **Optional**: Minor style consistency or enhancement suggestions.
(Do not generate arbitrary numerical scores.)
