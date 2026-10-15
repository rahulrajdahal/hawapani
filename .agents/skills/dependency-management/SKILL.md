---
name: dependency-management
description: Evaluation and vetting workflow for proposing, adding, auditing, or pruning npm packages.
---

# Dependency Management Workflow

## Purpose
Maintain a lean dependency footprint, avoid bundle bloat, and prevent introducing security liabilities.

## Evaluation Protocol
1. **Necessity Assessment**:
   - Can this capability be implemented cleanly using native Web APIs (e.g. `Intl`, `fetch`, `localStorage`) or modern CSS?
   - Can an already-installed package fulfill the requirement?
2. **Package Health Check**:
   - Is the package actively maintained with recent releases?
   - Does it support React 19 and Next.js 16?
   - What is its unpacked bundle size impact (via Bundlephobia)?
   - Are there known CVE security vulnerabilities (`npm audit`)?
3. **Approval Request**:
   - Document the concrete problem solved, bundle size, and alternatives considered.
   - Request explicit permission before running `npm install`.
