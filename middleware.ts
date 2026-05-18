import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const { nextUrl } = request;
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
  matcher: ["/tai-khoan/:path*", "/admin/:path*"]
};
