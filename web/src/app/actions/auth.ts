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

  // Send the actual email via Resend
  try {
    const resetUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'MetalDetectors <noreply@metaldetectors.online>',
        to: email,
        subject: 'Reset your MetalDetectors Password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h1 style="color: #eab308;">Password Reset Request</h1>
            <p>We received a request to reset your password. Click the button below to choose a new one:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      })
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend Error:", error);
    }
  } catch (e) {
    console.error("Failed to send reset email:", e);
  }

  return { success: "If an account exists, a reset link has been sent." };
}
