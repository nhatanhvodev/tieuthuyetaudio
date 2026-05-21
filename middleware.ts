import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isCsrfSafe } from "@/lib/csrf";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_PROTECTED_PREFIXES = ["/api/admin", "/api/bookmarks", "/api/follow", "/api/progress", "/api/reviews", "/api/theme", "/api/register"];

function isCsrfProtected(pathname: string): boolean {
  return CSRF_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // CSRF protection for state-changing API requests
  if (!SAFE_METHODS.has(request.method) && isCsrfProtected(nextUrl.pathname)) {
    if (!isCsrfSafe(request)) {
      return NextResponse.json({ error: "Yêu cầu không hợp lệ (CSRF)." }, { status: 403 });
    }
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const isAccount = nextUrl.pathname.startsWith("/tai-khoan");
  const isAdmin = nextUrl.pathname.startsWith("/admin");

  if ((isAccount || isAdmin) && !token) {
    return NextResponse.redirect(new URL("/dang-nhap", nextUrl));
  }

  if (isAdmin && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tai-khoan/:path*", "/admin/:path*", "/api/admin/:path*", "/api/bookmarks/:path*", "/api/follow/:path*", "/api/progress/:path*", "/api/reviews/:path*", "/api/theme/:path*", "/api/register"]
};
