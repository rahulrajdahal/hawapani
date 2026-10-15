# Component Rules

## Responsibilities & Structure
- Follow existing project organization in `components/` using PascalCase.
- Each component must have a single clear responsibility.
- Extract cohesive subcomponents or custom hooks when complexity grows; do not split components mechanically solely for line-count metrics.
- Props must be strongly typed with TypeScript interfaces. Avoid overly generic types or leaking external API payloads.

## Design System & Radix Wrapper Policy
- Use Tailwind CSS v4 and established design tokens (`app/globals.css`).
- Radix UI primitives must NOT be imported directly into feature components when a project wrapper exists (e.g. `components/Input`, `components/SearchInput`, `components/SegmentedControl`).
- When a new primitive is required:
  1. Determine whether semantic native HTML is sufficient.
  2. If Radix is genuinely required, create an accessible project wrapper in `components/`.
  3. Use that project wrapper across the application.
- Document every reusable UI component in Storybook with meaningful interactive states.
