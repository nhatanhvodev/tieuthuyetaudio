import { NextRequest } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const TRUSTED_ORIGINS = new Set([
  "http://localhost:3000",
  "https://localhost:3000",
  ...(process.env.NEXTAUTH_URL ? [process.env.NEXTAUTH_URL] : [])
]);

export function isCsrfSafe(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin && TRUSTED_ORIGINS.has(origin)) return true;
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (TRUSTED_ORIGINS.has(refererUrl.origin)) return true;
    } catch {
      // invalid referer
    }
  }

  return false;
}

export function csrfErrorResponse() {
  return Response.json({ error: "Yêu cầu không hợp lệ (CSRF)." }, { status: 403 });
}
