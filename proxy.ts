import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("fst_session")?.value;
  let userRole = "ADMIN";
  let userEmail = "roystonsoans3@gmail.com";

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie));
      if (parsed.role) {
        userRole = parsed.role;
        userEmail = parsed.email || "";
      }
    } catch {}
  }

  const headerRole = request.headers.get("x-user-role");
  if (headerRole && ["ADMIN", "MEMBER", "GUEST"].includes(headerRole)) {
    userRole = headerRole;
  }

  if (pathname.startsWith("/api/protected")) {
    if (userRole === "GUEST") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Guest role cannot access protected API endpoints",
        },
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith("/dashboard/admin")) {
    if (userRole !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "admin_required");
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (userRole === "GUEST") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "member_required");
      return NextResponse.redirect(url);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-role", userRole);
  if (userEmail) {
    requestHeaders.set("x-user-email", userEmail);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
