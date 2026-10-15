# SEO Rules

## Routing Model
- The application uses a single root route with query parameters for location state:
  `/?q=<location>`
- Do NOT restructure into speculative routes like `/weather/[city]` unless explicit product requirements require a multi-page migration.

## Metadata & Search Engine Discovery
- Maintain comprehensive dynamic Next.js metadata in `app/layout.tsx` (title templates, descriptions, canonical URLs).
- Provide rich OpenGraph and Twitter card previews for social sharing.
- Maintain native `app/robots.ts` and `app/sitemap.ts` files for search crawler indexing.
- Embed `schema.org/WebApplication` JSON-LD structured data.
- Ensure semantic heading hierarchy (`<h1>` unique per page, logical `<h2>`/`<h3>` tags).
