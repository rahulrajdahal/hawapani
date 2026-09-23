import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

const store = new Map<string, RateLimitRecord>();

// Periodic garbage collection every 5 minutes to prevent memory leak
const GC_INTERVAL_MS = 5 * 60 * 1000;
let lastGc = Date.now();

function cleanupExpiredRecords(now: number) {
  if (now - lastGc < GC_INTERVAL_MS) return;
  lastGc = now;
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * Extracts a client identifier from NextRequest headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Pick the first IP in the chain
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Checks rate limit for a given key.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { limit: 60, windowMs: 60 * 1000 }
) {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const existing = store.get(key);

  if (!existing || now > existing.resetTime) {
    const record: RateLimitRecord = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    store.set(key, record);
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  if (existing.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: Math.ceil((existing.resetTime - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    reset: Math.ceil((existing.resetTime - now) / 1000),
  };
}

/**
 * Helper to generate a 429 response with standard rate limit headers.
 */
export function createRateLimitResponse(resetSeconds: number, limit: number) {
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down and try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": resetSeconds.toString(),
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetSeconds.toString(),
      },
    }
  );
}
