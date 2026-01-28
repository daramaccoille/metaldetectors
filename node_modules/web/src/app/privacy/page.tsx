
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <main className="main-layout items-start justify-start">
            <div className="glass container p-8 md:p-12 text-gray-300">
                <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
                <p className="mb-4">Last Updated: January 2026</p>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2>
                        <p>We collect your email address when you subscribe. We use Stripe for payments and do not store your credit card information directly.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h2>
                        <p>We use your email solely to send you the daily MetalDetectors digest. We do not sell your data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-2">3. Data Deletion</h2>
                        <p>You can unsubscribe at any time via the link in our emails, which will stop all communications. To request full deletion of your data, contact privacy@metaldetectors.info.</p>
                    </section>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <Link href="/" className="text-yellow-500 hover:text-yellow-400">← Back to Home</Link>
                </div>
            </div>
        </main>
    );
}
