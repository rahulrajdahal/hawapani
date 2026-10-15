# Security Rules

## Secrets & API Key Protection
- Never expose `WEATHER_API_KEY` (or equivalent third-party credentials) to client bundles or browser code.
- Keep credentials strictly server-side within Route Handlers (`app/api/weather/*`).
- Never prefix server secrets with `NEXT_PUBLIC_`.
- Never commit secrets to version control, embed them in Storybook fixtures, or output them in console logs.

## Input Sanitization & Web Security
- Sanitize and limit lengths on search inputs before forwarding upstream.
- Prevent XSS: never render raw untrusted HTML (`dangerouslySetInnerHTML`).
- Avoid open redirects or dynamic URL injection.
- Configure robust HTTP security headers in `next.config.ts` (Content-Security-Policy, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
