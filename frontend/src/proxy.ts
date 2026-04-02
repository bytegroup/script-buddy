import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, ROUTES } from "@/lib/constants";

// Routes that are accessible without authentication
const PUBLIC_PATHS: Set<string> = new Set([ROUTES.HOME, ROUTES.LOGIN, ROUTES.REGISTER]);

// Routes that authenticated users should NOT access (e.g. login page)
const AUTH_ONLY_PATHS: Set<string> = new Set([ROUTES.LOGIN, ROUTES.REGISTER]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets and Next.js internals to pass through immediately
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token);
  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const isAuthOnlyPath = AUTH_ONLY_PATHS.has(pathname);

  // Redirect authenticated users away from login/register
  if (isAuthenticated && isAuthOnlyPath) {
    return NextResponse.redirect(new URL(ROUTES.FEED, request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("next", pathname); // preserve intended destination
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run proxy on all routes except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
