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

/** Maximum number of tracked IP keys in memory to prevent exhaustion attacks */
export const MAX_STORE_SIZE = 5000;

// Periodic garbage collection every 5 minutes to prevent memory leak
const GC_INTERVAL_MS = 5 * 60 * 1000;
let lastGc = Date.now();

export function cleanupExpiredRecords(now: number, force = false) {
  if (!force && now - lastGc < GC_INTERVAL_MS) return;
  lastGc = now;
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }

  // Evict oldest entries if store still reaches MAX_STORE_SIZE
  if (store.size >= MAX_STORE_SIZE) {
    const keysToDelete = Array.from(store.keys()).slice(
      0,
      Math.max(1, Math.floor(MAX_STORE_SIZE * 0.2))
    );
    for (const key of keysToDelete) {
      store.delete(key);
    }
  }
}

export function resetRateLimitStore(): void {
  store.clear();
  lastGc = Date.now();
}

export function getRateLimitStoreSize(): number {
  return store.size;
}

function sanitizeIp(raw: string): string | null {
  const firstEntry = raw.split(/[,;]/)[0]?.trim();
  if (!firstEntry) return null;
  const candidate = firstEntry.split(/\s+/)[0];
  const ip = candidate.replace(/[^0-9a-fA-F:.]/g, "");
  return ip || null;
}

/**
 * Extracts a client identifier from NextRequest headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = sanitizeIp(forwarded);
    if (ip) return ip;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    const ip = sanitizeIp(realIp);
    if (ip) return ip;
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
  cleanupExpiredRecords(now, store.size >= MAX_STORE_SIZE);

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
