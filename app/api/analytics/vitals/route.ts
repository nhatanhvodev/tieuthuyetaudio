import { NextResponse } from "next/server";
import { z } from "zod";

const ratingSchema = z.enum(["good", "needs-improvement", "poor"]);

const vitalsPayloadSchema = z.object({
  id: z.string().trim().min(1),
  name: z.enum(["CLS", "FCP", "INP", "LCP", "TTFB"]),
  value: z.number().finite().nonnegative(),
  delta: z.number().finite(),
  rating: ratingSchema,
  navigationType: z.string().trim().min(1).optional(),
  pathname: z.string().trim().min(1),
  href: z.string().url().optional(),
  source: z.string().trim().min(1).default("next_web_vitals"),
  timestamp: z.string().datetime(),
  attribution: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = vitalsPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid vitals payload"
      },
      { status: 400 }
    );
  }

  if (process.env.NODE_ENV !== "production") {
    const { name, rating, value, pathname } = parsed.data;
    console.info(`[analytics:vitals] ${name} ${rating} ${value} ${pathname}`);
  }

  return NextResponse.json(
    {
      ok: true,
      accepted: true
    },
    { status: 202 }
  );
}
