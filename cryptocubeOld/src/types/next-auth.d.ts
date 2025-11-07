import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
  }
}
