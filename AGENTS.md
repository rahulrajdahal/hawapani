<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Engineering Instructions

This repository is a Next.js 16 weather application (**HawaPani**).
These instructions are the primary operating contract for AI coding agents working in this repository.

---

## 1. Instruction Hierarchy

Follow this priority order:

1. User requirements for the current task.
2. This file and applicable `.agents/rules/*` rules.
3. `docs/PROJECT_CONTEXT.md`.
4. Existing project architecture and established implementation patterns.
5. Official documentation for the technology being changed.
6. Established engineering standards.
7. General model knowledge.

_When instructions conflict, prefer the higher-priority source._

---

## 2. Before Doing Anything

Before implementing any task:

1. Understand the user's request.
2. Inspect the relevant repository structure.
3. Read `docs/PROJECT_CONTEXT.md`.
4. Read relevant documentation in `docs/`.
5. Inspect existing implementations before creating new patterns.
6. Check existing components, hooks, utilities, tests, stories, configuration, and dependencies.
7. Determine the smallest coherent change that satisfies the requirement.
8. Identify risks, breaking changes, and affected areas.
9. Produce an implementation plan.
10. Wait for user approval before implementation.
    _Do not begin implementation merely because a task is technically understandable._

---

## 3. Terminal and CLI Policy

**Terminal/CLI execution requires explicit user permission.**
Do not run commands automatically, including:

- npm commands
- Git commands
- tests
- builds
- linters
- formatters
- package installation
- development servers
- deployment commands
- scripts

When validation is required, ask for permission to run the required commands.
Never execute destructive commands without explicit authorization.
Never run:

- `git reset --hard`
- `git clean`
- force pushes
- destructive filesystem commands
- production deployment commands
- production data modification
  unless explicitly authorized.

---

## 4. Git Policy

AI must not:

- commit without explicit approval
- push without explicit approval
- force push
- rewrite shared Git history
- merge branches without explicit approval
- delete files automatically

AI may propose or create a feature branch only after asking permission.
Preferred branch naming:

- `feature/<description>`
- `fix/<description>`
- `refactor/<description>`
- `test/<description>`
- `docs/<description>`
- `chore/<description>`
- `perf/<description>`
- `security/<description>`

Conventional Commits are required when commits are created:
`type(scope): concise imperative description`
Supported types include: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

**Local AI Files Isolation**:
`AGENTS.md`, `CLAUDE.md`, and `.agents/` are local AI operating files that must remain uncommitted and unstaged without modifying `.gitignore`. Never use blanket staging commands (`git add .` or `git add -A`) that would stage these files.

---

## 5. File Deletion & Dependencies Policy

### File Deletion

Never delete files automatically. This applies to source files, tests, stories, configuration, documentation, assets, generated files, and scripts.
If deletion appears necessary:

1. Identify the file.
2. Explain why it appears obsolete.
3. Flag it for deletion.
4. Ask the user for approval.
   Removing a dependency from `package.json` also requires explicit approval.

### Dependencies

Do not add dependencies unless absolutely necessary.
Before adding one:

1. Check whether the functionality already exists in the project.
2. Check whether it can be implemented simply with existing APIs.
3. Check whether an existing dependency already provides it.
4. Check maintenance status, security, and compatibility.
5. Explain why the dependency is justified.
6. Ask permission before installing it.
   Prefer maintained, focused dependencies over unnecessary packages. Do not introduce a library merely because it is popular.

---

## 6. Core Engineering Priorities & Architecture

When requirements conflict, prioritize:

1. Correctness and user requirements
2. Security and privacy
3. Preservation of existing functionality
4. Simplicity
5. Maintainability
6. Accessibility
7. Performance
8. Scalability
9. Testability
10. Developer experience

### Architecture

This is a small weather application. Use clean, pragmatic architecture appropriate to its scope.
Do not introduce:

- unnecessary DDD layers
- repositories for trivial operations
- microservices
- unnecessary global state
- unnecessary dependency injection
- unnecessary abstractions
- databases, Kubernetes, or infrastructure-as-code
  unless actual requirements justify them. Follow existing project patterns before introducing new patterns.

---

## 7. Next.js and React Guidelines

- Use the App Router exclusively (`app/`).
- Use Server Components by default.
- Use Client Components only when browser APIs, interaction, state, effects, or other client-only behavior require them.
- Prefer server-side data fetching when appropriate.
- Use SSR, static rendering, caching, and ISR/revalidation according to actual data and UX requirements.
- Do not introduce client-side fetching merely because it is familiar.
- Do not introduce `"use client"` unless necessary.
- When introducing a Client Component, understand why it cannot remain a Server Component.
- Follow current official Next.js documentation for version-sensitive behavior.

---

## 8. WeatherAPI & Data Fetching Boundary

- WeatherAPI is an external infrastructure concern.
- WeatherAPI credentials must remain strictly server-side.
- Never expose secrets through Client Components, browser requests, logs, source code, Storybook, Cypress fixtures, generated bundles, or public environment variables.
- Use the application's server-side boundary (`app/api/weather/*`) for WeatherAPI communication.
- WeatherAPI response structures should not unnecessarily leak throughout the UI; use adapters/mappers (`lib/services/weatherService.ts`).
- Current endpoints: `search.json`, `forecast.json`.

### Data Fetching Defaults

Weather data should:

- use appropriate caching
- revalidate according to data volatility:
  - Current weather: ~10 minutes
  - Forecast: ~30 minutes
  - Location search: ~1 hour
- avoid duplicate requests
- retry transient failures up to 3 times with exponential backoff
- avoid retrying permanent 4xx failures
- expose loading and error states
- support offline behavior

---

## 9. State & UI Components

- Prefer local React state (`useState`, `useMemo`, custom hooks).
- Keep state as close as possible to where it is used.
- Lift state only when genuinely required.
- Update existing hooks when appropriate rather than duplicating their behavior.
- Use existing project components before creating new ones.
- **Radix Wrapper Policy**: Radix primitives must not be used directly when an existing project wrapper exists. If a wrapper does not exist:
  1. Determine whether a simple native implementation is sufficient.
  2. If so, prefer the simple implementation.
  3. If Radix is genuinely necessary, create a project-level wrapper in `components/`.
  4. Use the wrapper thereafter. Do not introduce another UI library.
- Components should have a single clear responsibility.
- Use Tailwind CSS v4 and established design tokens. Extend the existing color system rather than introducing arbitrary colors.

---

## 10. Accessibility (a11y) & SEO

### Accessibility

- Minimum target: **WCAG 2.1 AA**; Strive for **WCAG 2.2 AA**.
- Every interactive element must be keyboard operable with visible focus indicators.
- Semantic HTML before ARIA; ARIA only when necessary.
- Accessible names/labels on all form controls and icon buttons.
- Use axe-based automated testing (`@storybook/addon-a11y`). Automated success does not eliminate manual reasoning.

### SEO

- The current route model is single root with query parameter:
  `/?q=<location>`
- Do not introduce a route architecture such as `/weather/[location]` unless product scope changes and architecture is intentionally approved.
- Use appropriate metadata, titles, descriptions, canonical URLs, Open Graph metadata, semantic headings, sitemap/robots, and structured JSON-LD.

---

## 11. Offline, PWA & Favorites

- Offline behavior is required.
- When offline:
  - Use cached weather data where available and display an offline status badge.
  - Keep cached favorites usable.
  - Avoid pointless network retries.
  - If no cached weather is available, display the offline weather game.
- Follow current official Next.js guidance for PWA capabilities without hardcoding incompatible wrappers.
- Favorite cities are stored locally in `localStorage` in a client-safe and SSR-safe manner. Prefer storing the minimum information required.

---

## 12. Testing & Quality Hierarchy

### Testing Layers

- **Storybook**: Component behavior, visual states, and accessibility interaction tests.
- **Vitest**: Isolated unit tests for pure functions, math, utilities, and date conversions (`npm test`).
- **Integration**: Cross-layer interaction using MSW or mock route handlers.
- **Cypress**: Important user journeys (search flow, favorites, geolocation grant/denial, offline fallback).

### Mocking & Coverage

- Automated tests must never depend on live WeatherAPI.
- Target overall project coverage: **90%+**. CI uploads HTML and JSON summary artifacts.
- AI must never delete, weaken, or skip failing tests to make CI pass.

---

## 13. Performance & Security

### Performance

- Prefer Server Components, minimal client JavaScript, dynamic imports where justified, image optimization via `next/image`, and zero-CLS skeleton loaders.
- Avoid large dependencies for small utility tasks.

### Security

- Never expose secrets (`WEATHER_API_KEY`).
- Validate and limit search input length.
- Prevent unsafe HTML rendering, dynamic URL injection, and open redirects.
- Configure robust HTTP security headers in Next.js response pipeline.

---

## 14. Definition of Done & Reporting

A task is not considered complete until applicable items are satisfied:

- Requirement implemented
- Existing functionality preserved
- Architecture respected
- Types correct
- Formatting correct
- Lint passes
- Tests pass
- Storybook updated where applicable
- Cypress updated where applicable
- Accessibility verified
- SEO checked where relevant
- Security verified
- Performance considered
- Build succeeds
- Documentation updated where necessary
- Diff reviewed

### Final Response Format

After implementation, report:

- **Implemented**: What changed.
- **Files Changed**: Relevant files.
- **Validation**: Commands/tests run and their results.
- **Risks**: Known limitations or possible regressions.
- **Documentation**: What was updated.
- **Follow-up**: Optional improvements or pre-existing issues.

_(Never claim that a test, build, or command was run if it was not actually run.)_

---

## 15. Implemented Architecture & Current Modules

- **Next.js 16 App Router & Core Layout**: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`.
- **Atmospheric 404 Not Found Page**: `app/not-found.tsx`, `app/not-found.stories.tsx`, `cypress/e2e/not_found.cy.ts`.
- **Current Weather Hero Panel**: `app/CurrentForecast.tsx`.
- **24-Hour Hourly Forecast Carousel**: `app/HourlyForecast.tsx`, `components/HourForecastCard/HourForecastCard.tsx`.
- **Location Search & Autocomplete Navigation**: `components/Navbar/Navbar.tsx`, `components/SearchInput/SearchInput.tsx`, `hooks/useDebounce.ts`.
- **Decoupled Weather Service & Backend Handlers**: `lib/services/weatherService.ts`, `lib/types/weather.ts`, `lib/constants.ts`, `app/api/weather/forecast/route.ts`, `app/api/weather/search/route.ts`.
- **7-Day Extended Daily Forecast & Tab Switcher**: `app/DailyForecast.tsx`, `components/DailyForecastCard/DailyForecastCard.tsx`.
- **Complete Meteorological Metrics Suite & Air Quality**: `components/MetricsGrid/MetricsGrid.tsx`, `lib/utils/weatherMetrics.ts`.
- **Severe Weather Alert Banner**: `components/AlertBanner/AlertBanner.tsx`.
- **Quick-Access Favorites Bar**: `components/FavoritesBar/FavoritesBar.tsx`, `hooks/useFavorites.ts`.
- **Side-by-Side City Comparison Modal**: `components/CityComparisonModal/CityComparisonModal.tsx`.
- **Dynamic Atmospheric Themes**: `lib/utils/weatherTheme.ts`, `app/globals.css`.
- **Zero-CLS Shimmer Skeleton Loaders**: `components/WeatherDashboardSkeleton/WeatherDashboardSkeleton.tsx`.
- **Interactive 24-Hour Recharts Trendline**: `components/WeatherTrendChart/WeatherTrendChart.tsx`.
- **WCAG 2.1 AA Accessibility**: Skip link, landmark structure, combobox pattern, focus rings.
- **Next.js 16 SEO Suite**: Dynamic metadata, OpenGraph, JSON-LD, `app/robots.ts`, `app/sitemap.ts`.
- **Testing Setup**: Storybook 10 (`.storybook/`), Vitest 5 (`vitest.config.ts`), Cypress 16 (`cypress/`).
- **Input & Control Primitives**: `components/Input/Input.tsx`, `components/SegmentedControl/SegmentedControl.tsx`, `components/UnitToggle/UnitToggle.tsx`.
