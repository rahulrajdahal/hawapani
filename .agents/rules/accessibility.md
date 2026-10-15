# Accessibility Rules

## Compliance Standards
- Mandatory minimum: **WCAG 2.1 AA**
- Engineering target: **WCAG 2.2 AA**

## Accessibility Requirements
- All interactive controls must be fully operable via keyboard (Tab, Space, Enter, Escape, Arrow keys).
- Every form input and control requires an explicit, accessible name and label (`aria-label`, `<label>`, or `aria-labelledby`).
- Visible focus rings are mandatory (`focus-visible:ring-2 focus-visible:outline-hidden`).
- Landmark architecture: `<header>`, `<main id="main-content">`, `<section>`, `<article>`, `<footer role="contentinfo">`.
- Color must never be the sole mechanism for conveying state (provide icons, text, or badges).
- Respect user motion preferences (`motion-reduce:`).
- Verify color contrast ratios ($\ge 4.5:1$ for normal text, $\ge 3:1$ for large text/graphical elements).
- Use axe automated checks via Storybook `@storybook/addon-a11y` and Cypress tests; augment with manual keyboard reasoning.
