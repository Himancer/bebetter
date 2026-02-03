import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { TrendingUp, Calendar, Target, AlertCircle, Activity, Apple, Flame, CheckCircle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'http://localhost:8000'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Weekly nutrition data
  const weeklyCalories = [
    { day: 'Mon', consumed: 2100, goal: 2000 },
    { day: 'Tue', consumed: 1950, goal: 2000 },
    { day: 'Wed', consumed: 2300, goal: 2000 },
    { day: 'Thu', consumed: 1850, goal: 2000 },
    { day: 'Fri', consumed: 2050, goal: 2000 },
    { day: 'Sat', consumed: 2400, goal: 2000 },
    { day: 'Sun', consumed: 1900, goal: 2000 },
  ]
  
  const workoutData = [
    { day: 'Mon', calories: 380, duration: 60 },
    { day: 'Tue', calories: 0, duration: 0 },
    { day: 'Wed', calories: 420, duration: 75 },
    { day: 'Thu', calories: 0, duration: 0 },
    { day: 'Fri', calories: 400, duration: 70 },
    { day: 'Sat', calories: 0, duration: 0 },
    { day: 'Sun', calories: 0, duration: 0 },
  ]
  
  const macrosData = [
    { name: 'Protein', value: 155, color: '#3b82f6' },
    { name: 'Carbs', value: 250, color: '#8b5cf6' },
    { name: 'Fat', value: 70, color: '#ec4899' },
  ]
  
  const stats = [
    { label: 'BMI', value: '25.3', subtitle: 'Normal Range', icon: Target, color: 'bg-blue-500' },
    { label: 'Daily Calorie Goal', value: '2000 kcal', subtitle: 'Moderate deficit', icon: Flame, color: 'bg-orange-500' },
    { label: 'Protein Target', value: '150g/day', subtitle: '1.8g per kg', icon: Apple, color: 'bg-green-500' },
    { label: 'Workouts', value: '3/week', subtitle: '1200 kcal burned', icon: Activity, color: 'bg-red-500' },
  ]
  
  const recentWorkouts = [
    { date: 'Today', exercises: 'Chest & Triceps', duration: '60 min', calories: '380 kcal' },
    { date: 'Yesterday', exercises: 'Back & Biceps', duration: '70 min', calories: '400 kcal' },
    { date: '2 days ago', exercises: 'Legs', duration: '75 min', calories: '420 kcal' },
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // Load user data from localStorage (set during login)
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    setUser(userData)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Dashboard...</h2>
          <p className="text-gray-400">Fetching your fitness data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Champ'}! 💪</h1>
        <p className="text-gray-400">Track your progress and stay motivated</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-blue-500 transition">
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-gray-500 text-xs">{stat.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Weekly Calories Chart */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            Weekly Calorie Intake
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyCalories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="consumed" stroke="#3b82f6" strokeWidth={2} name="Consumed" />
              <Line type="monotone" dataKey="goal" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" name="Goal" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Workouts */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-red-500" />
            Weekly Workouts
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="calories" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Macro Breakdown & Recent Workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Macros Pie Chart */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target size={20} className="text-green-500" />
            Today's Macros
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={macrosData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}g`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {macrosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}g`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Workouts */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-blue-500" />
            Recent Workouts
          </h3>
          <div className="space-y-4">
            {recentWorkouts.map((workout, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                <div className="flex-1">
                  <p className="font-semibold">{workout.exercises}</p>
                  <p className="text-sm text-gray-400">{workout.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-400">{workout.duration}</p>
                  <p className="text-sm text-orange-400">{workout.calories}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/food-scan" className="bg-blue-700 hover:bg-blue-800 p-4 rounded-lg transition">
            <p className="font-semibold mb-1">🍎 Log Meal</p>
            <p className="text-sm text-blue-100">Scan food and track nutrition</p>
          </a>
          <a href="/workouts" className="bg-blue-700 hover:bg-blue-800 p-4 rounded-lg transition">
            <p className="font-semibold mb-1">💪 Log Workout</p>
            <p className="text-sm text-blue-100">Track your exercise performance</p>
          </a>
          <a href="/ai-chat" className="bg-blue-700 hover:bg-blue-800 p-4 rounded-lg transition">
            <p className="font-semibold mb-1">🤖 Chat with BetterMe</p>
            <p className="text-sm text-blue-100">Get personalized coaching advice</p>
          </a>
        </div>
      </div>
    </div>
  )
}
