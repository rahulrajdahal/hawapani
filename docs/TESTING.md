# Testing Strategy

## Test Pyramid & Hierarchy

hawapani maintains a three-tiered testing structure:

```
        /  Cypress E2E  \       -> Critical user journeys & cross-page flows
       /   Storybook     \      -> Visual states, interaction tests, axe a11y
      /   Vitest Units    \     -> Pure utilities, date math, mappers, hooks
```

### 1. Vitest (Unit & Domain Logic)

- Executes in Node.js environment with `@vitest/coverage-v8`.
- Focuses on:
  - Unit conversions (`lib/utils/weatherMetrics.ts`).
  - Rolling 24-hour epoch slicing (`lib/services/weatherService.ts`).
  - DateTime formatting and timezone adaptation (`lib/utils/dateTime.ts`).
  - Atmospheric color gradient mapping (`lib/utils/weatherTheme.ts`).
  - Custom hook behavior (`hooks/useFavorites.test.ts`).

### 2. Storybook (Component Workbench & A11y)

- Documents UI states: Default, Loading shimmer, Error, Empty, Disabled, and Active.
- Uses `@storybook/addon-a11y` to run axe automated accessibility assertions during component authoring.
- Storybook interaction tests validate local user events (clicks, toggles, keyboard focus).

### 3. Cypress (End-to-End & Component Testing)

- Modern Cypress 16 test suite verifying critical user journeys:
  - `LandingPage.cy.ts`: Core dashboard smoke test, hero metrics, and shell rendering.
  - `search_and_navigation.cy.ts`: Location search input debouncing, suggestion listbox popover, keyboard navigation, and URL query synchronization.
  - `geolocation.cy.ts`: Geolocation prompt handling (granted coordinates navigation vs. denied accessible notification).
  - `favorites_and_compare.cy.ts`: Favorites persistence in `localStorage`, bookmark pills, and multi-city comparison modal.
  - `units_and_views.cy.ts`: Temperature unit scale switching (°C / °F) and projection tab switcher (Hourly 24h vs. 7-Day Forecast).
  - `offline_resiliency.cy.ts`: Offline cached forecast recovery with `OfflineBadge` vs. un-cached `OfflineGame` interactive fallback.

## Mocking & CI Integrity

- Normal automated tests must **never** hit live WeatherAPI endpoints.
- Integration tests employ mock route handlers or MSW fixtures.
- Target coverage: **90%+ overall project coverage**. CI generates HTML and JSON coverage artifacts (`coverage/`).
