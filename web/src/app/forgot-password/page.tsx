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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md border border-yellow-500/20 bg-gray-900/40 rounded-xl p-8 relative overflow-hidden group">
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
          
          <button type="submit" className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-semibold py-3 rounded mt-4 hover:from-yellow-300 hover:to-yellow-500 transition-all shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 flex justify-between">
          <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">&larr; Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
