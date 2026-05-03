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
    <main className="main-layout selection:bg-yellow-500/30">
      <div className="bg-ambience"></div>
      
      <header className="w-full max-w-7xl z-20 p-6 flex justify-between items-center text-sm font-medium tracking-wide border-b border-white/5 bg-black/50 backdrop-blur-md absolute top-0">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
          METALDETECTORS<span style={{ color: '#eab308' }}>.</span>
        </Link>
      </header>

      <div className="w-full max-w-md border border-yellow-500/20 bg-black/60 backdrop-blur-md rounded-xl p-8 relative overflow-hidden group z-10 mt-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-700"></div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 text-transparent bg-clip-text text-center mb-2">
          Reset Password
        </h1>
        <p className="text-center text-gray-400 text-sm mb-8">Enter your email to receive a reset link</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded mb-6 text-sm">{message}</div>}
        
        <form action={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input type="email" name="email" className="w-full bg-black/50 border border-gray-800 rounded p-3 text-white focus:border-yellow-500 focus:outline-none transition-colors" required />
          </div>
          
          <button type="submit" className="btn-primary w-full mt-6 py-3">
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 flex justify-center">
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">&larr; Back to Login</Link>
        </div>
      </div>
    </main>
  )
}
