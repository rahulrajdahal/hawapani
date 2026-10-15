# Performance Rules

## Architectural Principles
- Maximize Server Components to minimize client JavaScript bundle footprints.
- Leverage dynamic code-splitting (`next/dynamic`) for heavy client components (e.g. interactive charts, complex modals).
- Optimize static and remote images via `next/image` with domain allowlisting.
- Deduplicate requests and utilize appropriate cache lifetimes.

## Performance Guardrails
- Avoid introducing large dependencies for simple tasks (prefer native browser and Node.js APIs).
- Maintain fast Core Web Vitals:
  - Cumulative Layout Shift (CLS = 0) via zero-CLS skeleton loaders and explicit dimensions.
  - First Contentful Paint (FCP < 1.2s).
  - Interaction to Next Paint (INP < 200ms).
- Avoid premature memoization (`useMemo`, `useCallback`) unless profiling indicates a measurable rendering performance bottleneck.
