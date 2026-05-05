'use client';

import { useState } from 'react';

export default function PasswordSetupForm({ email }: { email: string }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        
        if (data?.error) {
            setError(data.error);
        } else if (data?.success) {
            setSuccess(true);
        }
        setLoading(false);
    }

    if (success) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8 text-center">
                <h3 className="text-xl font-bold text-green-400 mb-2">Account Secured!</h3>
                <p className="text-gray-300 mb-4">Your password has been set. You can now log in to the Intelligence Terminal.</p>
                <a href="/login" className="btn-primary inline-block">Go to Login</a>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-xl font-bold text-yellow-500 mb-2">Complete Your Account</h3>
            <p className="text-sm text-gray-400 mb-6">Create a password to access your premium reports dashboard.</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input type="email" value={email} disabled className="email-input" style={{ width: '100%', padding: '0.75rem', opacity: 0.7 }} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Set Password</label>
                    <input type="password" name="password" required minLength={6} className="email-input" style={{ width: '100%', padding: '0.75rem' }} placeholder="••••••••" />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
                    {loading ? 'Saving...' : 'Save Password & Continue'}
                </button>
            </form>
        </div>
    );
}
