import { NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

// Node.js runtime - bcryptjs cannot run on Edge
export const runtime = 'nodejs';

export async function POST(req: Request) {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    try {
        // Lazy-load bcryptjs at request time so it stays out of the edge bundle
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            email,
            passwordHash,
            name: email.split('@')[0]
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Registration error:", e);
        return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }
}
