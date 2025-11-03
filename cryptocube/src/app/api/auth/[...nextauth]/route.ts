/*
    This file handles all the the authentication logic using NextAuth.js.
    Its a catch all : all URL starting with /api/auth/ will be handled here, instead of having
    multiple files for each endpoint (like /api/auth/signin, /api/auth/callback/google, etc).
*/

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import GoogleProvider from "next-auth/providers/google";
import RedditProvider from "next-auth/providers/reddit";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma),

    trustHost: true,

    session: {
        strategy: "database",
    },

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
                    email: profile.name ? `${profile.name}@reddit.local` : undefined, // Reddit rarely gives email
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
                    email: user.email ?? undefined,
                    name: `${user.prenom ?? ""} ${user.name ?? ""}`.trim() || undefined,
                };
            },
        }),
    ],

    callbacks: {
        async session({ session, token, user }) {
            if (session.user) {
                session.user.id = (token?.sub ?? user?.id ?? "").toString();
            }
            return session;
        },
    },

    pages: {
        signIn: "/auth/login", // optional: your custom sign in page path
    },

    secret: process.env.AUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};

const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth(authOptions);

export { auth, GET, POST, signIn, signOut };
