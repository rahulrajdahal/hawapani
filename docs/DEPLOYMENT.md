# Deployment & CI/CD Strategy

## Platform: Vercel

Vercel is the primary deployment target for hawapani.

## Continuous Delivery Pipeline

```
1. Feature Branch (git push)
        ↓
2. GitHub Actions (`.github/workflows/quality.yml`)
   - Lint & Typecheck (`npm run lint`)
   - Vitest Unit Tests & Coverage (`npm run test:coverage`)
   - Storybook Build (`npm run build-storybook`)
   - Production Build (`npm run build`)
   - Cypress Headless Tests
        ↓
3. Vercel Preview Deployment
   - Automatic preview URL generated per branch
   - Pre-merge smoke validation
        ↓
4. Merge to `main`
        ↓
5. Vercel Production Deployment
   - Zero-downtime atomic deployment
   - Production smoke check
```

## Environment Variables Configuration

- **Server Environment Variable**: `WEATHER_API_KEY` (configured in Vercel project settings).
- **Public Environment Variables**: None required by default; never store API keys in `NEXT_PUBLIC_*`.
