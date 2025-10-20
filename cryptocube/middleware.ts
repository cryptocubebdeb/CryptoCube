// src/middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/secure/:path*"], // only protect /secure routes
};
