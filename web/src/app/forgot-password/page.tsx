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
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden px-4 font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/10 via-[#050505] to-[#050505] pointer-events-none"></div>
      
      <Link className="absolute top-8 left-8 text-zinc-400 hover:text-white transition flex items-center gap-2 z-20" href="/">
        &larr; Back to Home
      </Link>
      
      <div className="w-full max-w-md p-8 glass-panel rounded-2xl bg-zinc-900/50 border border-zinc-800 z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-zinc-400">Enter your email to receive a reset link</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-6 text-sm">{message}</div>}
        
        <form action={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="you@example.com" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition backdrop-blur-sm" 
              required 
            />
          </div>
          
          <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-lg transition shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500 flex justify-center">
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400">&larr; Back to Login</Link>
        </div>
      </div>
    </main>
  )
}
