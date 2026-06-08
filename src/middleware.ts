import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";
import { PROTECTED_PREFIXES } from "@/lib/constants";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isLoginPage = pathname === "/login";

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtectedPath(pathname)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = req.auth?.user?.role as Role | undefined;
    if (role && !canAccessRoute(role, pathname)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/shipments/:path*",
    "/customers/:path*",
    "/branches/:path*",
    "/fleet/:path*",
    "/news/:path*",
    "/testimonials/:path*",
    "/content/:path*",
    "/offerings/:path*",
    "/partners/:path*",
    "/inbox/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/unauthorized",
  ],
};
