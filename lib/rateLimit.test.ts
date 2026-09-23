import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "./rateLimit";
import { NextRequest } from "next/server";

describe("rateLimit utility", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe("getClientIp", () => {
    it("extracts IP from x-forwarded-for first entry", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("extracts IP from x-real-ip when x-forwarded-for is missing", () => {
      const req = new NextRequest("http://localhost/api/test", {
        headers: { "x-real-ip": "198.51.100.1" },
      });
      expect(getClientIp(req)).toBe("198.51.100.1");
    });

    it("falls back to 127.0.0.1 when headers are missing", () => {
      const req = new NextRequest("http://localhost/api/test");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("checkRateLimit", () => {
    it("allows requests under the limit", () => {
      const key = "test-ip-allow-" + Math.random();
      const res1 = checkRateLimit(key, { limit: 3, windowMs: 10000 });
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = checkRateLimit(key, { limit: 3, windowMs: 10000 });
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = checkRateLimit(key, { limit: 3, windowMs: 10000 });
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it("blocks requests that exceed the limit", () => {
      const key = "test-ip-block-" + Math.random();
      checkRateLimit(key, { limit: 2, windowMs: 10000 });
      checkRateLimit(key, { limit: 2, windowMs: 10000 });

      const blocked = checkRateLimit(key, { limit: 2, windowMs: 10000 });
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.reset).toBeGreaterThan(0);
    });

    it("resets after windowMs passes", () => {
      vi.useFakeTimers();
      const key = "test-ip-reset-" + Math.random();
      checkRateLimit(key, { limit: 1, windowMs: 1000 });
      const blocked = checkRateLimit(key, { limit: 1, windowMs: 1000 });
      expect(blocked.success).toBe(false);

      vi.advanceTimersByTime(1100);

      const afterReset = checkRateLimit(key, { limit: 1, windowMs: 1000 });
      expect(afterReset.success).toBe(true);
      expect(afterReset.remaining).toBe(0);
    });
  });

  describe("createRateLimitResponse", () => {
    it("returns 429 status and required headers", async () => {
      const response = createRateLimitResponse(30, 60);
      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("30");
      expect(response.headers.get("X-RateLimit-Limit")).toBe("60");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");

      const body = await response.json();
      expect(body.error).toContain("Too many requests");
    });
  });
});
