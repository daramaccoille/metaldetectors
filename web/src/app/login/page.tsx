"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRef } from "react"

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  return (
    <main className="main-layout">
      <div className="bg-ambience"></div>
      
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 20 }}>
        <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          &larr; Back to Home
        </Link>
      </div>
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem 2rem', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="hero-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p className="hero-subtitle" style={{ fontSize: '1rem', margin: 0 }}>Sign in to access your dashboard.</p>
        </div>
        
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          await signIn("credentials", { 
            email: formData.get("email"), 
            password: formData.get("password"),
            redirectTo: "/reports" 
          });
        }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>Email</label>
            <input 
              type="email" 
              name="email" 
              ref={emailRef}
              placeholder="you@example.com" 
              className="email-input" 
              style={{ width: '100%', padding: '0.75rem 1rem' }}
              required 
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af' }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: '#eab308', textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              className="email-input" 
              style={{ width: '100%', padding: '0.75rem 1rem' }}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
            Sign In
          </button>
        </form>

        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ color: '#71717a', fontSize: '0.75rem', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <button 
          type="button" 
          className="btn-secondary" 
          style={{ width: '100%' }}
          onClick={async () => {
            if (emailRef.current?.value) {
              await signIn("resend", { email: emailRef.current.value });
            } else {
              alert("Please enter your email first");
            }
          }}
        >
          Sign in with Magic Link
        </button>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#71717a' }}>
          Don't have an account? <Link href="/register" style={{ color: '#eab308', textDecoration: 'none', marginLeft: '0.25rem' }}>Sign up</Link>
        </div>
      </div>
    </main>
  )
}
