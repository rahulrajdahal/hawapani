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
    vi.stubGlobal("window", {
      navigator: { doNotTrack: "0" },
      document: {
        querySelector: vi.fn().mockReturnValue(null),
        createElement: vi.fn().mockReturnValue({ setAttribute: vi.fn() }),
        head: { appendChild: vi.fn() },
      },
    });
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = originalEnv;
    vi.unstubAllGlobals();
  });

  describe("isDoNotTrackEnabled", () => {
    it("returns false by default in test env", () => {
      expect(isDoNotTrackEnabled()).toBe(false);
    });

    it("returns true when navigator.doNotTrack is '1'", () => {
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "1" },
      });
      expect(isDoNotTrackEnabled()).toBe(true);
    });

    it("returns false when window is undefined (SSR)", () => {
      vi.stubGlobal("window", undefined);
      expect(isDoNotTrackEnabled()).toBe(false);
    });
  });

  describe("initPostHog", () => {
    it("returns false if no POSTHOG_KEY is set", () => {
      expect(initPostHog()).toBe(false);
    });

    it("does not throw and returns false when DNT is enabled", () => {
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "1" },
      });
      expect(initPostHog()).toBe(false);
    });

    it("returns false during SSR when window is undefined", () => {
      vi.stubGlobal("window", undefined);
      expect(initPostHog()).toBe(false);
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
