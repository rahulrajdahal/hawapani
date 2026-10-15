---
name: project-analysis
description: Procedural workflow for analyzing repository architecture, components, dependencies, and patterns prior to implementation.
---

# Project Analysis Workflow

## Purpose
Thoroughly understand the project context, technical architecture, and established patterns before attempting any code modification.

## Step-by-Step Execution
1. **Context Ingestion**:
   - Read `AGENTS.md` and `docs/PROJECT_CONTEXT.md`.
   - Inspect `package.json` for active versions, dependencies, and available scripts.
2. **Directory & Codebase Inspection**:
   - Trace relevant directory structures (`app/`, `components/`, `lib/`, `hooks/`).
   - Check existing components, custom hooks, and shared utilities for existing patterns.
3. **Configuration & Verification Context**:
   - Inspect relevant configuration (`next.config.ts`, `vitest.config.ts`, `cypress.config.ts`, `.storybook/`).
   - Review relevant test files (`*.test.ts`, `*.cy.tsx`, `*.cy.ts`) and Storybook stories (`*.stories.tsx`).
4. **Impact Assessment**:
   - Identify existing conventions, constraints, and dependencies.
   - Determine the minimal coherent change set required.
   - Identify risks, breaking changes, and affected functional areas.
5. **Plan Formulation**:
   - Produce a structured implementation plan.
   - Wait for explicit human approval before touching any code.
