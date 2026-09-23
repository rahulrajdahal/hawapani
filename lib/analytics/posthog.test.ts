import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  initPostHog,
  captureEvent,
  isDoNotTrackEnabled,
  analytics,
} from "./posthog";

describe("PostHog analytics module", () => {
  const originalEnv = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as { posthog?: unknown }).posthog;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = originalEnv;
  });

  describe("isDoNotTrackEnabled", () => {
    it("returns false by default in test env", () => {
      expect(isDoNotTrackEnabled()).toBe(false);
    });

    it("returns true when navigator.doNotTrack is '1'", () => {
      Object.defineProperty(window.navigator, "doNotTrack", {
        value: "1",
        configurable: true,
      });
      expect(isDoNotTrackEnabled()).toBe(true);
      Object.defineProperty(window.navigator, "doNotTrack", {
        value: "0",
        configurable: true,
      });
    });
  });

  describe("initPostHog", () => {
    it("returns false if no POSTHOG_KEY is set", () => {
      expect(initPostHog()).toBe(false);
    });

    it("does not throw and returns false when DNT is enabled", () => {
      Object.defineProperty(window.navigator, "doNotTrack", {
        value: "1",
        configurable: true,
      });
      expect(initPostHog()).toBe(false);
      Object.defineProperty(window.navigator, "doNotTrack", {
        value: "0",
        configurable: true,
      });
    });
  });

  describe("captureEvent & analytics helpers", () => {
    it("does nothing without key", () => {
      expect(() => captureEvent("test_event")).not.toThrow();
    });

    it("safely calls analytics helper functions without errors", () => {
      expect(() => analytics.searchLocation("Kathmandu")).not.toThrow();
      expect(() => analytics.toggleUnit("fahrenheit")).not.toThrow();
      expect(() => analytics.toggleFavorite("London", "add")).not.toThrow();
      expect(() => analytics.compareCities(2)).not.toThrow();
      expect(() => analytics.playOfflineGame(100)).not.toThrow();
      expect(() => analytics.viewOfflineFallback()).not.toThrow();
    });
  });
});
