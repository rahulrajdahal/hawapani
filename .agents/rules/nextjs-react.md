# Next.js and React Rules

## App Router Conventions
- Use the App Router exclusively (`app/` directory).
- Use React Server Components (RSC) by default.
- Introduce `"use client"` only when browser APIs, user interactivity, React hooks (`useState`, `useEffect`), or client libraries strictly require it.
- Understand and justify why any component cannot remain a Server Component.

## Data Fetching & Rendering Strategy
- Prefer server-side data fetching where appropriate.
- Select rendering strategies based on actual requirements (static rendering, SSR, ISR/revalidation).
- Weather data defaults:
  - Current weather: ~10 minutes revalidation / cache
  - Forecast: ~30 minutes revalidation / cache
  - Location search: ~1 hour cache
- Retry transient upstream failures up to 3 times with exponential backoff; never retry permanent 4xx failures.

## State Management
- Prefer local React state (`useState`, `useReducer`, custom hooks).
- Keep state as close as possible to where it is consumed.
- Avoid global state stores unless a demonstrated product requirement demands it.
- Follow official Next.js 16 and React 19 documentation for version-sensitive behavior. Never invent framework APIs.
