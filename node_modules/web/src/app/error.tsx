'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="main-layout flex min-h-screen flex-col items-center justify-center text-center">
            <div className="bg-ambience">
                <div className="orb" />
            </div>

            <div className="glass container p-10">
                <h1 className="hero-title text-3xl mb-4 text-red-400">Signal Lost</h1>
                <p className="text-gray-300 mb-8">
                    Something went wrong while processing your request.
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="btn-primary"
                    >
                        Try Again
                    </button>
                    <a href="/" className="btn-secondary">
                        Go Home
                    </a>
                </div>
            </div>
        </main>
    );
}
