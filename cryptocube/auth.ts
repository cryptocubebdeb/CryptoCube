import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Reddit from 'next-auth/providers/reddit';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

export async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`
     SELECT 
        id_utilisateur   AS id,
        email,
        mot_de_passe     AS "motDePasse",
        nom,
        prenom,
        username
      FROM Utilisateur
      WHERE email = ${email}
    `;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    Reddit({
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.motDePasse);

          if (passwordsMatch)
          {
            return {
              id: user.id.toString(),                         
              email: user.email,
              name: `${user.prenom} ${user.nom}`,          
            };
          } 
        }
        
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "reddit") {
        // Créer ou récupérer l'utilisateur OAuth dans votre base de données
        try {
          if (!user.email) {
            console.error('No email provided by OAuth provider');
            return false;
          }

          const existingUser = await sql`
            SELECT id_utilisateur FROM Utilisateur WHERE email = ${user.email}
          `;
          
          if (existingUser.length === 0) {
            // Créer un nouvel utilisateur OAuth
            const nameParts = user.name?.split(' ') || ['OAuth', 'User'];
            const username = user.email.split('@')[0];
            
            await sql`
              INSERT INTO Utilisateur (email, nom, prenom, username, mot_de_passe)
              VALUES (${user.email}, ${nameParts[1] || 'User'}, ${nameParts[0] || 'OAuth'}, ${username}, 'oauth_user')
            `;
          }
          return true;
        } catch (error) {
          console.error('Error creating OAuth user:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await getUser(session.user.email);
        if (user) {
          session.user.id = user.id.toString();
          session.user.name = `${user.prenom} ${user.nom}`;
        }
      }
      return session;
    },
  },
});