import Link from 'next/link';
import { Confetti } from '@/components/Confetti';

export const runtime = 'edge';

export default function SuccessPage() {
    return (
        <main className="main-layout flex flex-col items-center justify-center p-6 min-h-screen">
            <div className="bg-ambience"><div className="orb" /></div>
            <Confetti />

            <div className="glass container max-w-lg py-12 px-8 text-center relative overflow-hidden z-10">
                <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="hero-title text-3xl mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                    Welcome to the Inner Circle.
                </h1>

                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                    Your subscription is confirmed. Our AI is analyzing the markets as we speak.
                </p>

                <div className="bg-white/5 rounded-lg p-4 mb-8 border border-white/10 text-sm text-gray-400">
                    <p className="mb-2"><strong className="text-white">Next Digest:</strong> Tomorrow, 07:00 UTC</p>
                    <p>Check your inbox (and spam folder) for a confirmation email.</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link href="/archive" className="btn-primary flex items-center justify-center gap-2">
                        View Past Signals
                        <span>→</span>
                    </Link>
                    <Link href="/" className="btn-secondary">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
