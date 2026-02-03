import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { LogIn, AlertCircle } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Login failed')
      }
      const { access_token } = await res.json()
      localStorage.setItem('token', access_token)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/">
          <a className="text-center block mb-8">
            <h1 className="text-4xl font-bold">🏋️ BeBetter</h1>
            <p className="text-gray-400 mt-2">AI Fitness Coach</p>
          </a>
        </Link>

        {/* Form Container */}
        <div className="bg-gray-800 rounded-lg border border-white/10 p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to your BeBetter account</p>
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-gray-700/50 rounded-lg p-4 text-sm">
            <p className="text-gray-300 font-medium mb-2">Demo Credentials:</p>
            <p className="text-gray-400">Email: <span className="text-white">test@example.com</span></p>
            <p className="text-gray-400">Password: <span className="text-white">password123</span></p>
          </div>

          <div className="text-center">
            <p className="text-gray-400">Don't have an account? <Link href="/register" className="text-blue-400 hover:text-blue-300">Sign up</Link></p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <Link href="/" className="hover:text-gray-400">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
