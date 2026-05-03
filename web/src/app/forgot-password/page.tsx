"use client"

import { forgotPassword } from "@/app/actions/auth"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")

  async function onSubmit(formData: FormData) {
    setMessage("")
    setError("")
    const res = await forgotPassword(formData)
    if (res.error) setError(res.error)
    if (res.success) setMessage(res.success)
  }

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
          <h1 className="hero-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Reset Password</h1>
          <p className="hero-subtitle" style={{ fontSize: '1rem', margin: 0 }}>Enter your email to receive a reset link</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#34d399', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{message}</div>}
        
        <form action={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af', marginBottom: '0.5rem' }}>Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="you@example.com" 
              className="email-input" 
              style={{ width: '100%', padding: '0.75rem 1rem' }}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
            Send Reset Link
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#71717a' }}>
          <Link href="/login" style={{ color: '#eab308', textDecoration: 'none' }}>&larr; Back to Login</Link>
        </div>
      </div>
    </main>
  )
}
