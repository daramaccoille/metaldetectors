
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <main className="main-layout items-start justify-start">
            <div className="glass container p-8 md:p-12 text-gray-300">
                <h1 className="text-3xl font-bold mb-6 text-white">Terms of Service</h1>
                <p className="mb-4">Last Updated: January 2026</p>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">1. No Financial Advice</h2>
                        <p>MetalDetectors provides AI-generated analysis for informational purposes only. This is <strong>not financial advice</strong>. Trading commodities involves risk. You are solely responsible for your trading decisions.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">2. Subscriptions</h2>
                        <p>Services are billed monthly. You may cancel at any time. Refunds are not provided for partial months.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">3. Accuracy of Data</h2>
                        <p>While we strive for accuracy, we rely on third-party data sources and AI models which may occasionally hallucinate or provide incorrect data. Verify all signals independently.</p>
                    </section>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <Link href="/" className="text-yellow-500 hover:text-yellow-400">← Back to Home</Link>
                </div>
            </div>
        </main>
    );
}
