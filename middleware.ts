import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((request) => {
  const { nextUrl, auth: session } = request;
  const isAccount = nextUrl.pathname.startsWith("/tai-khoan");
  const isAdmin = nextUrl.pathname.startsWith("/admin");

  if ((isAccount || isAdmin) && !session?.user) {
    return NextResponse.redirect(new URL("/dang-nhap", nextUrl));
  }

  if (isAdmin && session?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/tai-khoan/:path*", "/admin/:path*"]
};
