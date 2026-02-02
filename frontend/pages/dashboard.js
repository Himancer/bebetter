import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { TrendingUp, Calendar, Target, AlertCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'http://localhost:8000'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [targets, setTargets] = useState(null)
  const [todayIntake, setTodayIntake] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchDashboardData(token)
  }, [])

  async function fetchDashboardData(token) {
    try {
      const userRes = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)

        const targRes = await fetch(`${API}/nutrition/targets/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (targRes.ok) {
          const targData = await targRes.json()
          setTargets(targData)
        }

        // Mock today's intake data
        setTodayIntake({
          calories: 1240,
          protein: 85,
          carbs: 145,
          fats: 42,
          meals: 2,
        })

        // Mock stats for chart
        setStats([
          { day: 'Mon', calories: 1800, target: 2000 },
          { day: 'Tue', calories: 1950, target: 2000 },
          { day: 'Wed', calories: 1650, target: 2000 },
          { day: 'Thu', calories: 2100, target: 2000 },
          { day: 'Fri', calories: 1900, target: 2000 },
          { day: 'Sat', calories: 2200, target: 2000 },
          { day: 'Sun', calories: 1240, target: 2000 },
        ])
      }
    } catch (e) {
      console.error('Error fetching dashboard:', e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const caloriePercent = targets ? (todayIntake.calories / targets.daily_calories) * 100 : 0
  const proteinPercent = targets ? (todayIntake.protein / targets.protein_g) * 100 : 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8">
          <h1 className="text-4xl font-bold mb-2">Hey {user.name.split(' ')[0]} 👋</h1>
          <p className="text-blue-100">
            {user.goal === 'weight_loss' && "Let's burn some calories today!"}
            {user.goal === 'muscle_gain' && 'Time to build those muscles!'}
            {user.goal === 'maintenance' && 'Keep up the steady progress!'}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      {targets && todayIntake && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* BMI Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">BMI</p>
                <p className="text-3xl font-bold mt-2">{targets.bmi.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {targets.bmi < 18.5 && 'Underweight'}
                  {targets.bmi >= 18.5 && targets.bmi < 25 && 'Healthy weight'}
                  {targets.bmi >= 25 && targets.bmi < 30 && 'Overweight'}
                  {targets.bmi >= 30 && 'Obese'}
                </p>
              </div>
              <Target className="text-blue-400" size={24} />
            </div>
          </div>

          {/* Calories Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Calories Today</p>
                <p className="text-3xl font-bold mt-2">{todayIntake.calories}</p>
                <p className="text-xs text-gray-500 mt-1">Target: {targets.daily_calories}</p>
              </div>
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <div className="mt-4 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  caloriePercent <= 100 ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(caloriePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{caloriePercent.toFixed(0)}% of goal</p>
          </div>

          {/* Protein Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Protein</p>
                <p className="text-3xl font-bold mt-2">{todayIntake.protein}g</p>
                <p className="text-xs text-gray-500 mt-1">Target: {targets.protein_g}g</p>
              </div>
              <Calendar className="text-purple-400" size={24} />
            </div>
            <div className="mt-4 bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  proteinPercent <= 100 ? 'bg-purple-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(proteinPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{proteinPercent.toFixed(0)}% of goal</p>
          </div>

          {/* Meals Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Meals Logged</p>
                <p className="text-3xl font-bold mt-2">{todayIntake.meals}</p>
                <p className="text-xs text-gray-500 mt-1">Recommended: 3-4</p>
              </div>
              <AlertCircle className="text-yellow-400" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Calories */}
        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">Weekly Calorie Intake</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="day" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 4 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Macro Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">Today's Macro Breakdown</h3>
          <div className="space-y-4">
            {todayIntake && [
              { label: 'Protein', value: todayIntake.protein, color: 'bg-purple-500', icon: '🥩' },
              { label: 'Carbs', value: todayIntake.carbs, color: 'bg-blue-500', icon: '🍞' },
              { label: 'Fats', value: todayIntake.fats, color: 'bg-yellow-500', icon: '🥑' },
            ].map((macro) => (
              <div key={macro.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span>{macro.icon}</span>
                    <span className="font-medium">{macro.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{macro.value}g</span>
                </div>
                <div className="bg-gray-700 rounded-full h-2">
                  <div className={`${macro.color} h-2 rounded-full`} style={{ width: '65%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/food-scan')}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-left transition group"
        >
          <div className="text-2xl mb-2">📸</div>
          <h4 className="font-bold group-hover:text-blue-100">Scan a Meal</h4>
          <p className="text-sm text-blue-100 text-opacity-75">Log food instantly</p>
        </button>

        <button
          onClick={() => router.push('/workouts')}
          className="bg-green-600 hover:bg-green-700 rounded-lg p-6 text-left transition group"
        >
          <div className="text-2xl mb-2">💪</div>
          <h4 className="font-bold group-hover:text-green-100">Log Workout</h4>
          <p className="text-sm text-green-100 text-opacity-75">Track your exercise</p>
        </button>

        <button
          onClick={() => router.push('/ai-chat')}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg p-6 text-left transition group"
        >
          <div className="text-2xl mb-2">🤖</div>
          <h4 className="font-bold group-hover:text-purple-100">Chat with BetterMe</h4>
          <p className="text-sm text-purple-100 text-opacity-75">Get AI coaching</p>
        </button>
      </div>
    </div>
  )
}
