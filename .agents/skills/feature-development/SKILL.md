---
name: feature-development
description: End-to-end workflow for designing, planning, implementing, and validating new features.
---

# Feature Development Workflow

## Purpose
Guide the disciplined addition of new user features while preserving architectural integrity, performance, and stability.

## Execution Sequence
1. **Analysis & Scope Definition**:
   - Run the `project-analysis` skill to assess the existing codebase.
   - Clarify user requirements and identify the exact surface area affected.
2. **Implementation Planning**:
   - Formulate a phased implementation plan detailing proposed additions and changes.
   - Identify risks, breaking changes, and necessary test coverage.
   - Present the plan to the user and await explicit approval.
3. **Incremental Implementation**:
   - Adhere to Server Components by default; isolate client hooks to dedicated client wrappers.
   - Reuse existing design tokens, components, and Radix project wrappers.
   - Introduce no unnecessary dependencies or speculative architectural layers.
4. **Verification & Testing**:
   - Request permission to execute automated validation suites.
   - Add/update unit tests (`*.test.ts`) and Storybook stories (`*.stories.tsx`).
   - Run end-to-end Cypress journey tests where applicable.
5. **Documentation & Review**:
   - Update `docs/` and `AGENTS.md` roadmap sections.
   - Review git diff to ensure no unintended changes or uncommitted AI files are staged.
   - Report implemented changes, validation results, and risks.
