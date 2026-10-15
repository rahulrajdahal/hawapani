# Progressive Web App (PWA) Rules

## Offline & Installation Requirements
- The application must support installation and reliable offline behavior.
- Manifest configuration resides in `app/manifest.ts` with crisp standard icons (`/favicon.svg`, `/icon.png`).

## Offline Execution Flow
1. **Network Available**: Serve fresh weather forecast, update client cache.
2. **Network Lost + Cached Forecast Exists**: Display cached forecast data immediately, accompanied by an accessible offline indicator badge. Keep saved favorites browsable.
3. **Network Lost + No Cache Exists**: Render an intentional offline fallback experience (offline weather game), avoiding default browser network error screens.

## Compatibility Guardrails
- Consult current Next.js 16 official ecosystem documentation when configuring service workers.
- Do not introduce unmaintained or incompatible PWA wrappers without verifying compatibility with React 19 and Next.js 16.
