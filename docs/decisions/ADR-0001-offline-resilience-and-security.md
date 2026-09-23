# ADR-0001: Offline Resilience, Security Containment, and Primitive Encapsulation

## Status

Accepted

## Context

hawapani is a privacy-first weather Progressive Web Application built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4.
During architecture compliance audits against repository operating guidelines (`AGENTS.md` and `.agents/rules/*`), several requirements needed formal technical reconciliation:

1. **Secrets & Privacy**: Upstream WeatherAPI credentials (`WEATHER_API_KEY`) had historical legacy references to client-exposed `NEXT_PUBLIC_` prefixes.
2. **Resilience & Upstream Failures**: Direct fetches without retry strategies subjected users to immediate UI errors on transient 5xx or network hiccups.
3. **Offline Operation**: Intermittent mobile network disruptions previously triggered blank or error screens instead of serving cached forecasts or interactive fallbacks.
4. **Design System & Component Wrappers**: Radix UI primitives (`@radix-ui/react-popover`) were directly imported into feature views without project encapsulation.

## Decision

1. **Strict Server-Side Secret Isolation**:
   - `WEATHER_API_KEY` is strictly accessed within server-side Route Handlers (`app/api/weather/*`) via `weatherService.ts`.
   - All `NEXT_PUBLIC_` prefixes were completely removed from code, configs, and documentation.
   - Robust HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are configured in `next.config.ts`.
   - Input length validation (100 characters maximum) protects route handlers from parameter flooding.
2. **Transient Retry with Exponential Backoff**:
   - Upstream fetch operations implement `fetchWithRetry()` with up to 3 retries and exponential backoff (300ms base delay).
   - Permanent 4xx client errors are rejected immediately without retrying.
3. **Offline Strategy & Graceful Degradation**:
   - Client forecasts are persistently cached in `localStorage` under `hawapani_forecast_${city}`.
   - The SSR-safe `useOnlineStatus` hook detects network disconnections.
   - When offline with cached forecast: displays cached meteorological metrics accompanied by an accessible `OfflineBadge`.
   - When offline without cached forecast: avoids browser error screens and renders the interactive `OfflineGame` fallback.
4. **Radix Primitive Encapsulation**:
   - Created `components/Popover/Popover.tsx` encapsulating `@radix-ui/react-popover` primitives (`Root`, `Trigger`, `Anchor`, `Portal`, `Content`, `Close`), fulfilling the project Radix Wrapper Policy while eliminating wrapper boilerplate.
5. **Performance Code-Splitting**:
   - Heavy client subtrees (`WeatherTrendChart` requiring `recharts` and `CityComparisonModal`) are dynamically code-split via `next/dynamic` with SSR disabled.

## Alternatives Considered

- **Client-Side WeatherAPI Fetching**: Evaluated and rejected due to fatal secret exposure in browser network panels and bundle source maps.
- **Service Worker Workbox Offline Interception**: Deferred in favor of lightweight `localStorage` caching and React-driven offline fallback states to maintain compatibility with Next.js 16 and Turbopack.
- **Direct Radix Component Usage in Views**: Rejected per project Radix Wrapper Policy to keep UI primitives reusable, token-compliant, and Storybook-documented.

## Consequences

- Zero credentials leak to browser bundles or client requests.
- Application remains operational and engaging offline or under poor network conditions.
- Initial JavaScript bundle size is significantly reduced through dynamic imports.
- Automated tests (Vitest, Storybook, Cypress) remain 100% deterministic with zero dependence on live third-party APIs.

## Date

2026-09-17
