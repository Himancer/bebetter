import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { User, Mail, Calendar, Target, Activity, TrendingUp } from 'lucide-react'

const API = 'http://localhost:8000'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [targets, setTargets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchProfile(token)
  }, [])

  async function fetchProfile(token) {
    try {
      const userRes = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
        setFormData(userData)

        const targRes = await fetch(`${API}/nutrition/targets/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (targRes.ok) {
          setTargets(await targRes.json())
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSave(e) {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const updated = await res.json()
        setUser(updated)
        setEditing(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{user?.name}</h1>
            <p className="text-blue-100">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <User size={24} />
          Personal Information
        </h3>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height_cm"
                  value={formData.height_cm || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight_kg"
                  step="0.1"
                  value={formData.weight_kg || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fitness Goal</label>
                <select
                  name="goal"
                  value={formData.goal || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Activity Level</label>
                <select
                  name="activity_level"
                  value={formData.activity_level || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="lightly_active">Lightly Active</option>
                  <option value="moderately_active">Moderately Active</option>
                  <option value="very_active">Very Active</option>
                  <option value="extremely_active">Extremely Active</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                <Mail size={18} />
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Age</p>
              <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                <Calendar size={18} />
                {user?.age} years old
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Height & Weight</p>
              <p className="text-lg font-semibold mt-1">{user?.height_cm} cm • {user?.weight_kg} kg</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Gender</p>
              <p className="text-lg font-semibold mt-1">{user?.gender === 'M' ? '👨 Male' : user?.gender === 'F' ? '👩 Female' : '🧑 Other'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Fitness Profile */}
      {targets && (
        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Target size={24} />
            Fitness Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Goal</p>
              <p className="text-2xl font-bold mt-2 capitalize">
                {user?.goal === 'weight_loss' && '🔥 Lose Weight'}
                {user?.goal === 'muscle_gain' && '💪 Gain Muscle'}
                {user?.goal === 'maintenance' && '⚖️ Maintain'}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Activity Level</p>
              <p className="text-2xl font-bold mt-2 capitalize">{user?.activity_level.replace('_', ' ')}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">BMI</p>
              <p className="text-2xl font-bold mt-2">{targets.bmi.toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {targets.bmi < 18.5 && 'Underweight'}
                {targets.bmi >= 18.5 && targets.bmi < 25 && 'Healthy'}
                {targets.bmi >= 25 && targets.bmi < 30 && 'Overweight'}
                {targets.bmi >= 30 && 'Obese'}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Daily Calorie Target</p>
              <p className="text-2xl font-bold mt-2">{targets.daily_calories}</p>
              <p className="text-xs text-gray-400 mt-1">kcal</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Protein Target</p>
              <p className="text-2xl font-bold mt-2">{targets.protein_g}g</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 text-sm">TDEE</p>
              <p className="text-2xl font-bold mt-2">{targets.tdee.toFixed(0)}</p>
              <p className="text-xs text-gray-400 mt-1">Daily energy expenditure</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
