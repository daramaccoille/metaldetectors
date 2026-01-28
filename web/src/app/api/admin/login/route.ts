import { NextResponse } from 'next/server';

export const runtime = 'edge';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'temporal-gold-rush-2024'; // Fallback for dev only
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'super-secret-admin-session-value';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        if (password === ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true });

            // Set a secure, HTTP-only cookie
            response.cookies.set('admin_session', ADMIN_SECRET_KEY, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24, // 24 hours
                path: '/',
            });

            return response;
        }

        return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
