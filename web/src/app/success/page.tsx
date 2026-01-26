
import Link from 'next/link';

export default function SuccessPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="glass container max-w-lg py-16 px-8 text-center relative overflow-hidden">
                <h1 className="text-4xl font-bold mb-4 text-green-400">Welcome Aboard.</h1>
                <p className="text-xl text-gray-300 mb-8">Your subscription is active. The first digest will arrive at 07:00 UTC tomorrow.</p>
                <Link href="/" className="text-yellow-500 hover:underline">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}
