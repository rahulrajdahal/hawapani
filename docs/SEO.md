# Search Engine Optimization (SEO)

## URL Architecture

- hawapani operates on a single canonical page model:
  `https://hawapani.app/`
  with location state passed via search query parameters:
  `/?q=<location>`
- Deep routing (e.g. `/weather/[city]`) is intentionally deferred unless full-scale multi-city static generation is required.

## Metadata & Social Sharing

- **Dynamic Metadata**: Managed in `app/layout.tsx` via Next.js `Metadata` export.
- **Title Templates**: Formatted as `%s | hawapani Weather`.
- **OpenGraph & Twitter Cards**: Configured with rich preview cards, high-contrast imagery, and localized summaries.
- **Search Directives**:
  - `app/robots.ts`: Generates dynamic `robots.txt` crawler policies.
  - `app/sitemap.ts`: Generates sitemap index.
- **Structured Data**:
  - Embedded `schema.org/WebApplication` JSON-LD schema providing application features, category, and browser requirements for Google rich snippets.
- **Resource Hints**:
  - Preconnect and dns-prefetch links for `https://cdn.weatherapi.com` in `app/layout.tsx`.
