import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export default auth((req: NextRequest) => {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/auth")) {
    return;
  }

  const requiresAuth =
    pathname.startsWith("/secure") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  if (requiresAuth) {
    const authData = (req as any).auth;
    if (!authData) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(loginUrl);
    } else {
      console.log("[MIDDLEWARE] Authenticated user:", authData.user?.email || authData.user?.id);
    }
  }
});
