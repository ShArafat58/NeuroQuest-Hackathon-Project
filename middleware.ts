import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("neuroquest_session")?.value;
  const { pathname } = request.nextUrl;

  // Enforce JWT validation for protected page routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/ielts") ||
    pathname.startsWith("/medical")
  ) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("reason", "auth_required");
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("reason", "auth_required");

      const response = NextResponse.redirect(loginUrl);
      // Clean up invalid session cookie in the user's browser
      response.cookies.delete("neuroquest_session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/select-subject/:path*",
    "/select-chapter/:path*",
    "/coming-soon/:path*",
    "/settings/:path*",
    "/quiz/:path*",
    "/ielts/:path*",
    "/medical/:path*",
    "/api/quiz/:path*",
    "/api/chapters/:path*",
  ],
};