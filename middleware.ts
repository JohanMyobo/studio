import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/onboarding", "/api/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always inject pathname for layout
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // Pass through public paths without auth check
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return response;
  }

  // Check auth cookie
  const authCookie = request.cookies.get("studio_auth")?.value;
  const secret = process.env.AUTH_SECRET;

  if (!secret || authCookie !== secret) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
