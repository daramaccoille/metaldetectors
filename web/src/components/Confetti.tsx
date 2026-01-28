'use client';

import { useEffect, useState } from 'react';

export function Confetti() {
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        // Simple CSS-based confetti or canvas implementation
        // For simplicity and lightness, we'll use a few timed blasts or just a nice CSS animation
        const timer = setTimeout(() => setIsActive(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-float-down"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                        background: ['#FFD700', '#C0C0C0', '#B87333'][Math.floor(Math.random() * 3)],
                        width: '8px',
                        height: '16px',
                        transform: `rotate(${Math.random() * 360}deg)`
                    }}
                />
            ))}
        </div>
    );
}
