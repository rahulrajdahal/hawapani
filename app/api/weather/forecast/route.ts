import { weatherService } from "@/lib/services/weatherService";
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Block cross-site browser requests attempting to abuse internal API quota
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (secFetchSite === "cross-site") {
      return NextResponse.json(
        { error: "Cross-site requests to internal weather APIs are forbidden." },
        { status: 403 }
      );
    }

    const ip = getClientIp(req);
    // Rate limit: 30 requests per minute for forecast
    const rateCheck = checkRateLimit(`forecast:${ip}`, {
      limit: 30,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return createRateLimitResponse(rateCheck.reset, rateCheck.limit);
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q")?.trim() ?? "";
    // Sanitize query by stripping control characters and null bytes
    const query = rawQuery.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required." },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: "Query parameter 'q' must not exceed 100 characters." },
        { status: 400 }
      );
    }

    const data = await weatherService.getForecast(query);

    return NextResponse.json(
      { data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
          "X-RateLimit-Limit": rateCheck.limit.toString(),
          "X-RateLimit-Remaining": rateCheck.remaining.toString(),
          "X-RateLimit-Reset": rateCheck.reset.toString(),
        },
      }
    );
  } catch (error: unknown) {
    const rawError =
      error instanceof Error ? error.message : "Internal server error";
    // Never leak API keys, environment paths, or secret instructions to clients
    const isSensitive = /key|token|secret|\.env/i.test(rawError);
    const errorMessage = isSensitive
      ? "Failed to fetch weather forecast."
      : rawError;

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
