import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./drizzle/db"
import { users } from "./drizzle/schema"
import { eq } from "drizzle-orm"
import Resend from "next-auth/providers/resend"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" }, // Required when using Credentials
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string)
        });

        if (!user || !user.passwordHash) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) return null;
        return user;
      }
    }),
    Resend({
      from: "noreply@metaldetectors.com",
    }),
  ],
})
