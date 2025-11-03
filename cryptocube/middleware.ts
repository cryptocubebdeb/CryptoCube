import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route"; // adjust path if different

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow all /auth/* pages (login, signup, callbacks, etc.)
  if (pathname.startsWith("/auth")) return;

  // Protect secure areas
  const requiresAuth =
    pathname.startsWith("/secure") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  if (requiresAuth && !req.auth) {
    const loginUrl = new URL("/src/app/auth/login/page.tsx", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/secure/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};
