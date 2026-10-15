---
name: component-development
description: Workflow for engineering accessible, responsive, strongly-typed UI components paired with Storybook documentation.
---

# Component Development Workflow

## Purpose
Guide the creation and refinement of reusable UI components adhering to WCAG 2.1/2.2 AA accessibility, Tailwind v4 design tokens, and Storybook interaction documentation.

## Execution Sequence
1. **Search & Evaluate Existing Components**:
   - Inspect `components/` to verify if an existing component or wrapper fulfills the requirement.
   - If a Radix primitive is needed, ensure it is wrapped in an accessible project wrapper rather than imported directly into feature views.
2. **Interface & Responsibility Design**:
   - Formulate strongly typed TypeScript props interfaces.
   - Ensure the component has a single, cohesive responsibility.
3. **Accessible Implementation**:
   - Use semantic HTML tags before introducing ARIA attributes.
   - Guarantee visible focus outlines (`focus-visible:ring-2 focus-visible:ring-blue-500`).
   - Support keyboard interaction (Tab, Enter, Space, Escape, Arrows) where relevant.
   - Ensure color contrast complies with WCAG AA standards.
4. **Storybook Documentation**:
   - Create colocated `[Component].stories.tsx` documenting default, loading, error, empty, interactive, and responsive states.
   - Configure Storybook interaction tests and accessibility checks (`@storybook/addon-a11y`).
5. **Logic Isolation**:
   - Author Vitest unit tests only if the component contains isolated domain math or utility logic not naturally covered in Storybook.
