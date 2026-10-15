---
name: storybook
description: Workflow for component documentation, interaction testing, responsive variants, and axe accessibility auditing in Storybook.
---

# Storybook Component Documentation Workflow

## Purpose
Maintain Storybook as the single source of truth for component states, responsive variants, and automated accessibility verification.

## Execution Sequence
1. **Story Creation & Organization**:
   - Create or update `[Component].stories.tsx` alongside the component in `components/` or `app/`.
   - Provide standard Meta configuration with typed `ComponentStory` or `Meta<typeof Component>`.
2. **State Matrix Documentation**:
   - Explicitly document all meaningful UI states:
     - `Default`: Canonical baseline state.
     - `Loading`: Zero-CLS shimmer or skeleton state.
     - `Empty`: Zero results or unselected location.
     - `Error`: API timeout, network drop, or validation failure.
     - `Interactive / Hover / Active`: Keyboard focus, hover states, toggles.
     - `Edge Cases`: Extremely long city names, extreme temperatures, metric/imperial scales.
3. **Automated Accessibility Testing**:
   - Utilize `@storybook/addon-a11y` with axe-core rules to inspect color contrast, ARIA landmarks, and focus management.
4. **Validation**:
   - Request permission to verify Storybook build integrity:
     `npm run build-storybook`
