import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
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
  ], //should implement callbacks to have more data to return
});