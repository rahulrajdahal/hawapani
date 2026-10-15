---
name: accessibility-audit
description: Comprehensive audit workflow for validating WCAG 2.1 AA / 2.2 AA accessibility across keyboard, ARIA, and visual design.
---

# Accessibility Audit Workflow

## Purpose

Ensure all UI interactions in hawapani comply with WCAG 2.1 AA (mandatory) and strive for WCAG 2.2 AA.

## Audit Checklist

1. **Keyboard Operability**:
   - Every button, input, toggle, modal, and carousel control can be reached and activated via keyboard (`Tab`, `Shift+Tab`, `Space`, `Enter`, `Arrows`, `Escape`).
   - Modals and popovers trap focus appropriately and restore focus to trigger upon dismissal.
2. **Focus Visibility**:
   - Visible outline rings appear on every interactive element (`focus-visible:ring-2 focus-visible:ring-blue-500`).
3. **Form Controls & Labels**:
   - Search inputs and toggles have accessible names via `<label>`, `aria-label`, or `aria-labelledby`.
4. **Semantics & Landmarks**:
   - Check `<header>`, `<main id="main-content">`, `<footer role="contentinfo">`, `<section>`, and `<article>` landmarks.
   - Verify skip-to-content bypass link (`#main-content`).
5. **Color & Contrast**:
   - Text contrast $\ge 4.5:1$ against atmospheric background gradients.
   - Information is not conveyed by color alone (always pair with text, icons, or badges).
6. **Screen Readers & Live Regions**:
   - Loading skeleton transitions and severe weather alerts announce updates appropriately (`role="alert"` or `aria-live="polite"`).
