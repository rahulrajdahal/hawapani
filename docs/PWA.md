# Progressive Web App (PWA) & Offline Strategy

## Vision & Capabilities

hawapani delivers an installable, dependable Progressive Web App that remains useful even during intermittent connectivity or complete network loss.

## Assets & Configuration

- **Web App Manifest**: Configured in `app/manifest.ts`:
  - `name`: "hawapani — Modern Global Weather"
  - `short_name`: "hawapani"
  - `display`: "standalone"
  - `background_color`: Atmospheric dark slate `#0f172a`
  - `theme_color`: Brand blue `#3b82f6`
  - Icons: High-resolution SVG and PNG icons.

## Offline Graceful Degradation

1. **Active Connection**: Fetch latest meteorological data from Route Handlers and update browser `localStorage` forecast cache.
2. **Network Disconnected (Cache Available)**:
   - Immediately render cached forecast data.
   - Display a non-intrusive "Offline — Cached data" status badge.
   - Allow user to switch between saved favorite cities that have local cache entries.
3. **Network Disconnected (No Cache Available)**:
   - Avoid generic browser "No Internet" dino screens.
   - Display the built-in offline weather mini-game to keep users engaged until connectivity is restored.
