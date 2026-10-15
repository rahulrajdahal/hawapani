# Documentation Rules

## Documentation Architecture
- Keep project-level engineering documentation inside `docs/`.
- Keep AI operating policies inside `.agents/rules/` and procedural workflows in `.agents/skills/`.
- Keep reusable component documentation strictly inside Storybook (`.stories.tsx` files).
- Keep architectural shifts recorded in `docs/decisions/` (ADR format).

## Quality & Up-to-Date Standard
- Update documentation immediately whenever behavior, configuration, component APIs, or dependencies change.
- Never write comments that merely restate self-explanatory code.
- Code comments should strictly explain:
  - *Why* a non-intuitive design choice was made.
  - Subtleties of third-party API constraints or workarounds.
  - Complex mathematical formulas or timezone conversions.
