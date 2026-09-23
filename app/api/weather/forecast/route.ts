import { weatherService } from "@/lib/services/weatherService";
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
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
    const query = searchParams.get("q")?.trim();

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
          "X-RateLimit-Limit": rateCheck.limit.toString(),
          "X-RateLimit-Remaining": rateCheck.remaining.toString(),
          "X-RateLimit-Reset": rateCheck.reset.toString(),
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
