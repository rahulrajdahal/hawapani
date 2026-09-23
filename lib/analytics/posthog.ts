/**
 * PostHog Analytics Client for hawapani
 * Privacy-first, zero-dependency analytics integration.
 */

declare global {
  interface Window {
    posthog?: {
      init: (apiKey: string, options?: Record<string, unknown>) => void;
      capture: (event_name: string, properties?: Record<string, unknown>) => void;
      opt_out_capturing: () => void;
      opt_in_capturing: () => void;
      has_opted_out_capturing: () => boolean;
      __loaded?: boolean;
    };
  }
}

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Checks if user has Do Not Track enabled.
 */
export function isDoNotTrackEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.navigator?.doNotTrack === "1" ||
    (window as unknown as { doNotTrack?: string }).doNotTrack === "1"
  );
}

/**
 * Initializes PostHog using the official web script loader if an API key is configured.
 */
export function initPostHog(): boolean {
  if (typeof window === "undefined") return false;
  if (!POSTHOG_KEY) return false;

  // Respect user's privacy preference
  if (isDoNotTrackEnabled()) {
    return false;
  }

  if (window.posthog?.__loaded) {
    return true;
  }

  // Load PostHog array script dynamically
  try {
    const existingScript = document.querySelector("script[data-posthog]");
    if (!existingScript) {
      const script = document.createElement("script");
      script.setAttribute("data-posthog", "true");
      script.async = true;
      script.src = `${POSTHOG_HOST}/static/array.js`;
      document.head.appendChild(script);
    }

    // Initialize mock queue if posthog is not yet defined
    window.posthog = window.posthog || ({} as Window["posthog"]);

    return true;
  } catch {
    return false;
  }
}

/**
 * Captures an analytics event safely.
 */
export function captureEvent(
  eventName: string,
  properties: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY || isDoNotTrackEnabled()) return;

  try {
    if (window.posthog?.capture) {
      window.posthog.capture(eventName, {
        app: "hawapani",
        ...properties,
      });
    }
  } catch {
    // Analytics failure should never disrupt user experience
  }
}

// Pre-typed analytical domain events
export const analytics = {
  searchLocation: (query: string) =>
    captureEvent("search_location", { query_length: query.length }),

  toggleUnit: (unit: "celsius" | "fahrenheit") =>
    captureEvent("toggle_temperature_unit", { unit }),

  toggleFavorite: (city: string, action: "add" | "remove") =>
    captureEvent("toggle_favorite_city", { city, action }),

  compareCities: (count: number) =>
    captureEvent("compare_cities", { count }),

  playOfflineGame: (score: number) =>
    captureEvent("offline_game_played", { score }),

  viewOfflineFallback: () =>
    captureEvent("offline_fallback_viewed"),
};
