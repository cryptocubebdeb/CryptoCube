import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export default auth((req: NextRequest) => {
  const { pathname, search } = req.nextUrl;

  // Debug log
  console.log("[MIDDLEWARE] Path:", pathname);
  console.log("[MIDDLEWARE] Auth object:", (req as any).auth);

  if (pathname.startsWith("/auth")) {
    console.log("[MIDDLEWARE] Skipping auth check for", pathname);
    return;
  }

  const requiresAuth =
    pathname.startsWith("/secure") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  if (requiresAuth) {
    const authData = (req as any).auth;
    if (!authData) {
      console.warn("[MIDDLEWARE] No auth — redirecting to login");
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    } else {
      console.log("[MIDDLEWARE] Authenticated user:", authData.user?.email || authData.user?.id);
    }
  }
});
