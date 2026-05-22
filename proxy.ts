import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { isCsrfSafe } from "@/lib/csrf";
import { isClerkAdminEmail, isClerkAdminUser } from "@/lib/clerk-admin";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_PROTECTED_PREFIXES = ["/api/admin", "/api/bookmarks", "/api/follow", "/api/progress", "/api/reviews", "/api/theme"];

function isCsrfProtected(pathname: string): boolean {
  return CSRF_PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { nextUrl } = request;

  if (!SAFE_METHODS.has(request.method) && isCsrfProtected(nextUrl.pathname)) {
    if (!isCsrfSafe(request)) {
      return NextResponse.json({ error: "Yeu cau khong hop le (CSRF)." }, { status: 403 });
    }
  }

  const session = await auth();
  const isAccountPage = nextUrl.pathname.startsWith("/tai-khoan");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isAdminApi = nextUrl.pathname.startsWith("/api/admin");
  const isAdminRoute = isAdminPage || isAdminApi;

  if ((isAccountPage || isAdminPage) && !session.userId) {
    return NextResponse.redirect(new URL("/dang-nhap", nextUrl));
  }

  if (isAdminApi && !session.userId) {
    return NextResponse.json({ error: "Vui long dang nhap de tiep tuc." }, { status: 401 });
  }

  if (isAdminRoute) {
    const claims = session.sessionClaims as Record<string, unknown> | null;
    const emailFromClaims =
      (typeof claims?.email === "string" && claims.email) ||
      (typeof claims?.email_address === "string" && claims.email_address) ||
      null;
    const allowedByEmail = isClerkAdminEmail(emailFromClaims);
    const allowedByUser = await isClerkAdminUser(session.userId);

    if (!allowedByEmail && !allowedByUser) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Ban khong co quyen truy cap admin." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/(.*)",
    "/(api|trpc)(.*)"
  ]
};
