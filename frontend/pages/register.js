import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { UserPlus, AlertCircle } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    age: '',
    gender: 'M',
    height_cm: '',
    weight_kg: '',
    goal: 'muscle_gain',
    activity_level: 'moderately_active',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    if (form.password !== form.passwordConfirm) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          age: parseInt(form.age) || null,
          gender: form.gender,
          height_cm: parseFloat(form.height_cm) || null,
          weight_kg: parseFloat(form.weight_kg) || null,
          goal: form.goal,
          activity_level: form.activity_level,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Registration failed')
      }
      router.push('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const nextStep = () => {
    if (step === 1 && (!form.name || !form.email || !form.password || !form.passwordConfirm)) {
      setError('Please fill in all fields')
      return
    }
    if (step === 1 && form.password !== form.passwordConfirm) {
      setError('Passwords do not match')
      return
    }
    setError('')
    setStep(step + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/">
          <a className="text-center block mb-8">
            <h1 className="text-4xl font-bold">🏋️ BeBetter</h1>
            <p className="text-gray-400 mt-2">Create Your Account</p>
          </a>
        </Link>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition ${
                s <= step ? 'bg-blue-600' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-gray-800 rounded-lg border border-white/10 p-8 space-y-6">
          {error && (
            <div className="bg-red-600/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-100 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault()
            if (step === 1) {
              nextStep()
            } else {
              handleRegister(e)
            }
          }} className="space-y-4">
            {/* Step 1: Account Info */}
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold">Account Info</h2>
                  <p className="text-gray-400 text-sm mt-1">Let's create your account</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    placeholder="••••••••"
                    required
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </>
            )}

            {/* Step 2: Fitness Profile */}
            {step === 2 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold">Fitness Profile</h2>
                  <p className="text-gray-400 text-sm mt-1">Tell us about your fitness goals</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Age</label>
                    <input
                      type="number"
                      name="age"
                      placeholder="25"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="height_cm"
                      placeholder="180"
                      value={form.height_cm}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight_kg"
                      placeholder="75"
                      value={form.weight_kg}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Goal</label>
                  <select
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="weight_loss">Lose Weight</option>
                    <option value="muscle_gain">Gain Muscle</option>
                    <option value="maintenance">Maintain</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">Activity Level</label>
                  <select
                    name="activity_level"
                    value={form.activity_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extremely_active">Extremely Active</option>
                  </select>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-white/20 hover:border-white/40 rounded-lg transition"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  step === 2 ? '' : ''
                }`}
              >
                {loading ? 'Creating...' : step === 1 ? 'Next' : (
                  <>
                    <UserPlus size={20} />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-4">
            <p className="text-gray-400">Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
