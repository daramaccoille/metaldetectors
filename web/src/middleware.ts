import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Protect all routes starting with /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // Allow access to the login page itself
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check for the admin session cookie
        const adminSession = request.cookies.get('admin_session');

        // Very simple check: does the cookie exist and match our secret?
        // In production, you'd want to sign/verify this JWT, but for a single password
        // matching the ENV variable is a strong baseline if the cookie is HttpOnly.
        const isValid = adminSession?.value === process.env.ADMIN_SECRET_KEY;

        if (!isValid) {
            // Redirect to login if unauthorized
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
