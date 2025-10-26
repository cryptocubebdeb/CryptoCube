/*
    This file handles all the the authentication logic using NextAuth.js.
    Its a catch all : all URL starting with /api/auth/ will be handled here, instead of having
    multiple files for each endpoint (like /api/auth/signin, /api/auth/callback/google, etc).
*/

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import RedditProvider from "next-auth/providers/reddit";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthConfig  = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "database",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),

    RedditProvider({
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      profile(profile) {
        // Reddit doesn’t return an email by default — generate a placeholder
        return {
          id: profile.id,
          name: profile.name ?? "Reddit User",
          email: `${profile.name}@reddit.local`,
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
          if (!credentials?.email || !credentials?.password) return null;
  
          const email = String(credentials.email);
          const password = String(credentials.password);
          const user = await prisma.user.findUnique({
            where: { email },
          });
  
          if (!user || !user.passwordHash) return null;
  
          const isValid = await bcrypt.compare(
            password,
            user.passwordHash
          );
  
          if (!isValid) return null;
  
          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.prenom ?? ""} ${user.name ?? ""}`.trim(),
          };
        },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      // Add the user id to the session object
      if (session.user) {
        session.user.id = user.id.toString();
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // optional: your custom login page path
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(authOptions);

export { auth, GET, POST, signIn, signOut };
