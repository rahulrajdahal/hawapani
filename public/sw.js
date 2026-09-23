/**
 * hawapani Service Worker — Production Workbox Configuration
 *
 * Strategies:
 *  - App shell (JS/CSS/fonts/images): StaleWhileRevalidate — serve from cache instantly,
 *    revalidate in the background so users always get the latest on next load.
 *  - Start-URL (/): NetworkFirst — try the network first, fall back to cached shell
 *    so the SPA loads offline. The app's own localStorage forecast cache then takes over
 *    for weather data, and OfflineGame is displayed when no cached forecast exists.
 *  - All other routes: NetworkOnly — no silent caching of arbitrary responses.
 *
 * Offline weather data is handled at the application layer (page.tsx / localStorage),
 * not at the service-worker layer, keeping concerns clean.
 */

// Module loader shim required by the Workbox AMD bundle format.
if (!self.define) {
  let registry = {};
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + '.js', parentUri).href;
    return (
      registry[uri] ||
      new Promise((resolve) => {
        if ('document' in self) {
          const script = document.createElement('script');
          script.src = uri;
          script.onload = resolve;
          document.head.appendChild(script);
        } else {
          nextDefineUri = uri;
          importScripts(uri);
          resolve();
        }
      }).then(() => {
        const promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn't register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri =
      nextDefineUri ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (registry[uri]) return;
    let exports = {};
    const require = (depUri) => singleRequire(depUri, uri);
    const specialDeps = { module: { uri }, exports, require };
    registry[uri] = Promise.all(
      depsNames.map((depName) => specialDeps[depName] || require(depName))
    ).then((deps) => {
      factory(...deps);
      return exports;
    });
  };
}

define(['./workbox-7144475a'], function (workbox) {
  'use strict';

  importScripts();
  self.skipWaiting();
  workbox.clientsClaim();

  // ─── Start URL ───────────────────────────────────────────────────────────────
  // NetworkFirst: try the network, fall back to cached shell so the SPA loads
  // offline. When offline and no network response is available, the cached shell
  // is served and the app's localStorage forecast cache + OfflineGame handles UX.
  workbox.registerRoute(
    '/',
    new workbox.NetworkFirst({
      cacheName: 'hawapani-start-url-v1',
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] }),
        {
          cacheWillUpdate: async ({ response: e }) =>
            e && 'opaqueredirect' === e.type
              ? new Response(e.body, {
                  status: 200,
                  statusText: 'OK',
                  headers: e.headers,
                })
              : e,
        },
      ],
    }),
    'GET'
  );

  // ─── Next.js Static Assets (JS / CSS bundles) ────────────────────────────────
  // StaleWhileRevalidate: serve from cache instantly, revalidate in background.
  // Next.js content-hashes these files, so stale entries are always safe to serve.
  workbox.registerRoute(
    /\/_next\/static\/.*/i,
    new workbox.StaleWhileRevalidate({
      cacheName: 'hawapani-next-static-v1',
      plugins: [
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
    'GET'
  );

  // ─── Images & Public Assets ──────────────────────────────────────────────────
  // StaleWhileRevalidate: images are large; serve cached copy instantly.
  workbox.registerRoute(
    /\/_next\/image\?.*/i,
    new workbox.StaleWhileRevalidate({
      cacheName: 'hawapani-next-image-v1',
      plugins: [
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
    'GET'
  );

  workbox.registerRoute(
    /\/(?:assets|images|icons)\/.*\.(png|jpg|jpeg|svg|webp|ico|gif)$/i,
    new workbox.StaleWhileRevalidate({
      cacheName: 'hawapani-public-images-v1',
      plugins: [
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
    'GET'
  );

  // ─── Google Fonts ────────────────────────────────────────────────────────────
  workbox.registerRoute(
    /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    new workbox.StaleWhileRevalidate({
      cacheName: 'hawapani-google-fonts-v1',
      plugins: [
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
    'GET'
  );

  // ─── Weather API Routes ──────────────────────────────────────────────────────
  // NetworkOnly: weather data freshness is critical; the app's own localStorage
  // layer manages offline fallback for forecast data. Do NOT cache API responses
  // at the SW layer to avoid stale or duplicate caching.
  workbox.registerRoute(
    /\/api\/weather\/.*/i,
    new workbox.NetworkOnly({
      cacheName: 'hawapani-api-v1',
      plugins: [],
    }),
    'GET'
  );

  // ─── WeatherAPI CDN Icons ─────────────────────────────────────────────────────
  workbox.registerRoute(
    /^https:\/\/cdn\.weatherapi\.com\/.*/i,
    new workbox.StaleWhileRevalidate({
      cacheName: 'hawapani-weather-icons-v1',
      plugins: [
        new workbox.CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
    'GET'
  );

  // ─── Fallback: everything else is NetworkOnly ────────────────────────────────
  workbox.registerRoute(
    /.*/i,
    new workbox.NetworkOnly({ cacheName: 'hawapani-fallback-v1', plugins: [] }),
    'GET'
  );
});
