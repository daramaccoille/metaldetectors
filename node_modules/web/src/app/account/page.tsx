
import { manageSubscription } from '../actions';
import { headers } from 'next/headers';

export const runtime = 'edge';

export default async function AccountPage() {
    return (
        <main className="main-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            {/* Background Ambience from Home */}
            <div className="bg-ambience">
                <div className="orb" />
            </div>

            <div className="glass container hero-section" style={{ maxWidth: '500px' }}>
                <h1 className="hero-title hero-text" style={{ fontSize: '2rem' }}>
                    Manage Subscription
                </h1>
                <p className="hero-subtitle mb-8">
                    Enter your email to receive a secure link to manage your plan, upgrade, or cancel.
                </p>

                <form action={manageSubscription} className="subscribe-form" style={{ flexDirection: 'column', gap: '1rem' }}>
                    <input
                        name="email"
                        type="email"
                        required
                        placeholder="email@example.com"
                        className="email-input"
                        style={{ width: '100%' }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Send Management Link
                    </button>
                </form>

                <div style={{ marginTop: '20px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
                    <a href="/" style={{ color: '#ccc', textDecoration: 'underline' }}>&larr; Back to Home</a>
                </div>

            </div>
        </main>
    );
}
