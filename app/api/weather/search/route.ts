import { weatherService } from "@/lib/services/weatherService";
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIp,
} from "@/lib/rateLimit";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 60 requests per minute for search autocomplete
    const rateCheck = checkRateLimit(`search:${ip}`, {
      limit: 60,
      windowMs: 60 * 1000,
    });

    if (!rateCheck.success) {
      return createRateLimitResponse(rateCheck.reset, rateCheck.limit);
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        { data: [] },
        {
          headers: {
            "X-RateLimit-Limit": rateCheck.limit.toString(),
            "X-RateLimit-Remaining": rateCheck.remaining.toString(),
            "X-RateLimit-Reset": rateCheck.reset.toString(),
          },
        }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: "Query parameter 'q' must not exceed 100 characters." },
        { status: 400 }
      );
    }

    const locations = await weatherService.searchLocations(query);

    return NextResponse.json(
      { data: locations },
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
