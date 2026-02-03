import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Skip check for the disabled page itself to prevent redirect loops
  const isDisabledPage = pathname === "/auth/account-disabled";

  // If user is authenticated but account is disabled, redirect to disabled page
  if (session && session.user.isActive === false && !isDisabledPage) {
    return NextResponse.redirect(new URL("/auth/account-disabled", req.url));
  }

  // protected routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isVendorRoute = pathname.startsWith("/vendor");
  const isProtectedRoute = isAdminRoute || isVendorRoute;

  // => login if not auth
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/?modal=login", req.url));
  }

  // role control
  if (session) {
    if (isAdminRoute && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (
      isVendorRoute &&
      session.user.role !== "VENDOR" &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
