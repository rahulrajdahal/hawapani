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
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
      expect(initPostHog()).toBe(false);
    });

    it("does not throw and returns false when DNT is enabled", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "1" },
      });
      expect(initPostHog()).toBe(false);
    });

    it("returns false during SSR when window is undefined", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      vi.stubGlobal("window", undefined);
      expect(initPostHog()).toBe(false);
    });

    it("returns true immediately if posthog.__loaded is true", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "0" },
        posthog: { __loaded: true },
      });
      expect(initPostHog()).toBe(true);
    });

    it("creates and appends script tag when key is configured", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      const setAttribute = vi.fn();
      const appendChild = vi.fn();
      const mockScript = { setAttribute, async: false, src: "" };

      vi.stubGlobal("window", {
        navigator: { doNotTrack: "0" },
      });
      vi.stubGlobal("document", {
        querySelector: vi.fn().mockReturnValue(null),
        createElement: vi.fn().mockReturnValue(mockScript),
        head: { appendChild },
      });

      const initialized = initPostHog();
      expect(initialized).toBe(true);
      expect(setAttribute).toHaveBeenCalledWith("data-posthog", "true");
      expect(appendChild).toHaveBeenCalledWith(mockScript);
    });

    it("reuses existing script tag if one is already present", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      const appendChild = vi.fn();

      vi.stubGlobal("window", {
        navigator: { doNotTrack: "0" },
      });
      vi.stubGlobal("document", {
        querySelector: vi.fn().mockReturnValue({}),
        createElement: vi.fn(),
        head: { appendChild },
      });

      const initialized = initPostHog();
      expect(initialized).toBe(true);
      expect(appendChild).not.toHaveBeenCalled();
    });

    it("catches DOM errors gracefully and returns false", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "0" },
      });
      vi.stubGlobal("document", {
        querySelector: vi.fn().mockImplementation(() => {
          throw new Error("DOM access denied");
        }),
      });

      expect(initPostHog()).toBe(false);
    });
  });

  describe("captureEvent & analytics helpers", () => {
    it("does nothing without key", () => {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
      expect(() => captureEvent("test_event")).not.toThrow();
    });

    it("does nothing during SSR when window is undefined", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      vi.stubGlobal("window", undefined);
      expect(() => captureEvent("test_event")).not.toThrow();
    });

    it("does not capture when DNT is enabled", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      const capture = vi.fn();
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "1" },
        posthog: { capture },
      });

      captureEvent("test_event");
      expect(capture).not.toHaveBeenCalled();
    });

    it("dispatches events via window.posthog.capture with app metadata", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      const capture = vi.fn();
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "0" },
        posthog: { capture },
      });

      captureEvent("location_search", { query: "Tokyo" });
      expect(capture).toHaveBeenCalledWith("location_search", {
        app: "hawapani",
        query: "Tokyo",
      });
    });

    it("catches errors thrown during captureEvent gracefully", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "0" },
        posthog: {
          capture: vi.fn().mockImplementation(() => {
            throw new Error("PostHog script failure");
          }),
        },
      });

      expect(() => captureEvent("failing_event")).not.toThrow();
    });

    it("safely calls all analytics domain helper functions", () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test_key";
      const capture = vi.fn();
      vi.stubGlobal("window", {
        navigator: { doNotTrack: "0" },
        posthog: { capture },
      });

      expect(() => analytics.searchLocation("Kathmandu")).not.toThrow();
      expect(() => analytics.toggleUnit("fahrenheit")).not.toThrow();
      expect(() => analytics.toggleFavorite("London", "add")).not.toThrow();
      expect(() => analytics.compareCities(2)).not.toThrow();
      expect(() => analytics.playOfflineGame(100)).not.toThrow();
      expect(() => analytics.viewOfflineFallback()).not.toThrow();

      expect(capture).toHaveBeenCalledTimes(6);
    });
  });
});
