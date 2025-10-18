import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  providers: [], // always add providers even if empty
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnSecureDashboard = nextUrl.pathname.startsWith('/secure/dashboard');
      if (isOnSecureDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/secure/dashboard', nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;