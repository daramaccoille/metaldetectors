'use client';

import { useState, useRef } from 'react';
import { startCheckoutSession } from '@/app/actions';

interface SubscribeFormProps {
    currencySymbol: string;
    price: string;
    basicPrice: string;
}

export default function SubscribeForm({ currencySymbol, price, basicPrice }: SubscribeFormProps) {
    const [loading, setLoading] = useState(false);
    const emailRef = useRef<HTMLInputElement>(null);

    const handleSubscribe = async (plan: 'basic' | 'pro', event: React.FormEvent) => {
        event.preventDefault();

        const email = emailRef.current?.value;

        if (!email || !email.includes('@')) {
            alert("Please enter a valid email address at the top of the page first.");
            emailRef.current?.focus();
            emailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        // TODO: Add loading state
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('plan', plan);

            const result = await startCheckoutSession(formData);

            if (result?.url) {
                console.log("Redirecting to:", result.url);
                window.location.href = result.url;
            } else if (result?.error) {
                alert(`Error: ${result.error}`);
                setLoading(false);
            } else {
                alert("Something went wrong. Please try again.");
                setLoading(false);
            }
        } catch (error: any) {
            console.error("Subscription Error:", error);
            alert("An unexpected error occurred. Please contact support if this persists.");
            setLoading(false);
        }
    };

    return (
        <>
            <div className="subscribe-form">
                <input
                    ref={emailRef}
                    name="email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    className="email-input"
                    disabled={loading}
                />
                <div style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Enter your email, then select a plan to subscribe.
                </div>
            </div>

            <div className="pricing-grid">
                {/* BASIC PLAN */}
                <div className="pricing-card basic">
                    <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '8px 8px 0 0', marginBottom: '16px' }}>
                        <img src="/basic.png" alt="Basic Plan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 className="card-title">Basic (nominal fee)</h3>
                    <div className="price">{currencySymbol}{basicPrice} <span className="price-period">/ month</span></div>
                    <ul className="features-list">
                        <li className="feature">✓ XAU Only</li>
                        <li className="feature">✓ Weekly Digest</li>
                        <li className="feature">✓ Brief Predictions</li>
                    </ul>

                    <form onSubmit={(e) => handleSubscribe('basic', e)} style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                        <button type="submit" className="btn-secondary w-full" disabled={loading}>
                            {loading ? 'Processing...' : 'Select Basic'}
                        </button>
                    </form>
                </div>

                {/* PRO PLAN */}
                <div className="pricing-card pro">
                    <div className="badge">RECOMMENDED</div>
                    <div style={{ width: '100%', height: '140px', overflow: 'hidden', borderRadius: '8px 8px 0 0', marginBottom: '16px' }}>
                        <img src="/pro.png" alt="Pro Plan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 className="card-title" style={{ color: 'white' }}>Pro Analyst</h3>
                    <div className="price">{currencySymbol}{price} <span className="price-period">/ month</span></div>
                    <ul className="features-list">
                        <li className="feature"><span className="check">✓</span> All 5 Metals</li>
                        <li className="feature"><span className="check">✓</span> Best daily predictions</li>
                        <li className="feature"><span className="check">✓</span> Deep learning &quot;Buy/Sell&quot; Signals</li>
                    </ul>

                    <form onSubmit={(e) => handleSubscribe('pro', e)} style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                        <button type="submit" className="btn-primary w-full" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                            {loading ? 'Processing...' : 'Select Pro'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
