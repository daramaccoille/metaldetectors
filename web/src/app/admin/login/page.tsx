'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/admin');
                router.refresh();
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-layout bg-black min-h-screen flex items-center justify-center p-4">
            <div className="bg-ambience"><div className="orb" /></div>

            <div className="glass p-8 w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6 text-white">Admin Access</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="email-input text-center"
                        autoFocus
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Verifying...' : 'Unlock'}
                    </button>
                </form>

                <div className="mt-8 text-xs text-gray-500 font-mono">
                    SECURED AREA • LOGGED ACCESS ONLY
                </div>
            </div>
        </main>
    );
}
