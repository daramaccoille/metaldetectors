'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="main-layout flex min-h-screen flex-col items-center justify-center text-center">
            <div className="bg-ambience">
                <div className="orb" />
            </div>

            <div className="glass container p-10">
                <h1 className="hero-title text-4xl mb-4" style={{ color: '#D4AF37' }}>404</h1>
                <h2 className="text-2xl font-bold mb-6 text-white">Metal Not Detected</h2>
                <p className="text-gray-300 mb-8">
                    The page you are looking for seems to be buried too deep.
                </p>

                <Link href="/" className="btn-primary inline-block">
                    Return to Surface
                </Link>
            </div>
        </main>
    );
}
