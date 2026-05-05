"use server"

import { db } from "@/drizzle/db"
import { users, passwordResetTokens } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { hashPassword } from "@/lib/password"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) return { error: "Email and password required" };

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (existingUser) return { error: "Email already in use" };

  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    email,
    name,
    passwordHash
  });

  return { success: "Account created successfully. You can now login." };
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email required" };

  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (!user) {
    // Return success anyway to prevent email enumeration
    return { success: "If an account exists, a reset link has been sent." };
  }

  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt
  });

  // Here you would integrate with Resend to send the actual email
  console.log(`PASSWORD RESET LINK: /reset-password?token=${token}`);

  return { success: "If an account exists, a reset link has been sent." };
}
