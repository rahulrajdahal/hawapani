# Security & Privacy Architecture

## Secrets Protection

- **Zero API Key Leakage**: WeatherAPI credentials (`WEATHER_API_KEY`) reside exclusively in server-side environment configurations.
- Client bundles never reference `WEATHER_API_KEY` or expose it via `NEXT_PUBLIC_` prefixes.
- Route Handlers (`app/api/weather/forecast` and `app/api/weather/search`) act as the secure gateway, proxying queries and stripping upstream authentication headers.
- Route Handler error boundaries mask internal server exceptions (e.g. missing API keys or upstream diagnostics) to prevent leaking backend infrastructure details to clients.

## Input Sanitization & Validation

- Search queries (`?q=`) are sanitized at both client and server boundaries:
  - Whitespace trimmed.
  - Stripped of control characters (`\u0000-\u001F`, `\u007F-\u009F`) and null bytes to prevent injection and HTTP splitting.
  - Length capped to 100 characters on both UI `<Input>` components and Route Handlers.
  - URL encoding applied to protect against parameter pollution.
- In-memory rate limiter incorporates capacity bounding (`MAX_STORE_SIZE = 5000`), client IP character sanitization, and periodic garbage collection to prevent memory exhaustion DoS from spoofed IP addresses.
- Internal Route Handlers enforce W3C Fetch Metadata validation (`Sec-Fetch-Site: cross-site` returns HTTP 403), preventing third-party websites from leeching backend WeatherAPI quota.
- Upstream responses are validated before returning to clients; raw untrusted HTML is never passed to `dangerouslySetInnerHTML`.
- Structured JSON-LD metadata defensively escapes `<` characters to prevent script injection breakout.
- Client-side storage (`localStorage`) enforces schema validation and length caps (`<= 100` chars) on deserialization to protect against storage corruption and injection.

## HTTP Security Headers

Configured in Next.js response pipeline (`next.config.ts`):

- `Content-Security-Policy`:
  - `default-src 'self'`.
  - `connect-src 'self' https://cdn.weatherapi.com https://*.posthog.com https://us.i.posthog.com https://eu.i.posthog.com` (enforcing zero-trust isolation from external weather APIs).
  - `object-src 'none'` (blocking Flash and plugin execution).
  - `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.
  - `upgrade-insecure-requests;` (automatically promoting HTTP requests to HTTPS).
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`.
- `X-Frame-Options: DENY`: Prevents clickjacking attacks.
- `X-Content-Type-Options: nosniff`: Mitigates MIME-type sniffing.
- `Cross-Origin-Opener-Policy: same-origin`: Isolates browsing context from cross-origin popups/windows.
- `Cross-Origin-Resource-Policy: same-origin`: Prevents other websites from embedding application resources.
- `X-Permitted-Cross-Domain-Policies: none`: Disallows cross-domain policy files.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=()`.
