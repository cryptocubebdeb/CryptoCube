/*
  Auth route for NextAuth v5 beta + Prisma + JWT sessions.
  We intentionally relax types here because v5 beta typings are broken.
*/
import * as NextAuthPkg from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import GoogleProvider from "next-auth/providers/google";
import RedditProvider from "next-auth/providers/reddit";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---- FIX THE “not callable” TS ERROR HERE ----
// next-auth@5 beta typings are messed up, so we coerce the default export.
const NextAuth: any =
  (NextAuthPkg as any).default ?? NextAuthPkg;

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  trustHost: true,

  // JWT sessions so middleware doesn’t hit Prisma in the edge runtime
  session: { strategy: "jwt" },

  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID!}/v2.0`,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    RedditProvider({
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      profile(profile) {
        const name = profile.name ?? "Reddit User";
        return {
          id: String(profile.id),
          name,
          email: profile.name ? `${profile.name}@reddit.local` : undefined,
          image: (profile as any)?.icon_img ?? undefined,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email ?? undefined,
          name: `${user.prenom ?? ""} ${user.name ?? ""}`.trim() || undefined,
        };
      },
    }),
  ],

  callbacks: {
    // types here are intentionally loose – we just need it to work
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token, user }: any) {
      if (session?.user) {
        session.user.id = (token?.sub ?? user?.id ?? "").toString();
      }
      return session;
    },
  },

  pages: { signIn: "/auth/login" },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Call NextAuth once, then export what we need
const nextAuth = NextAuth(authOptions);

// These are used by the API route
export const { GET, POST } = nextAuth.handlers;

// This is what you use in middleware and (optionally) elsewhere
export const { auth, signIn, signOut } = nextAuth;
