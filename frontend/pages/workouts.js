import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Flame, Clock, Zap, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'http://localhost:8000'

const exercises = [
  { name: 'Running', calsPerMin: 10 },
  { name: 'Cycling', calsPerMin: 8 },
  { name: 'Swimming', calsPerMin: 11 },
  { name: 'Weight Lifting', calsPerMin: 6 },
  { name: 'HIIT', calsPerMin: 12 },
  { name: 'Yoga', calsPerMin: 3 },
  { name: 'Basketball', calsPerMin: 9 },
  { name: 'Elliptical', calsPerMin: 7 },
]

export default function Workouts() {
  const router = useRouter()
  const [workouts, setWorkouts] = useState([])
  const [form, setForm] = useState({
    exercise: 'Running',
    duration: '',
    intensity: 'medium',
  })
  const [loading, setLoading] = useState(false)
  const [totalCalories, setTotalCalories] = useState(0)
  const [weeklyData, setWeeklyData] = useState([])

  useEffect(() => {
    fetchWorkouts()
  }, [])

  async function fetchWorkouts() {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Mock data
      const mockWorkouts = [
        { id: 1, exercise: 'Running', duration: 30, calories_burned: 300, date: '2025-02-01' },
        { id: 2, exercise: 'Weight Lifting', duration: 45, calories_burned: 270, date: '2025-02-01' },
        { id: 3, exercise: 'Cycling', duration: 60, calories_burned: 480, date: '2025-02-02' },
      ]
      setWorkouts(mockWorkouts)
      setTotalCalories(mockWorkouts.reduce((sum, w) => sum + w.calories_burned, 0))

      // Mock weekly data
      setWeeklyData([
        { day: 'Mon', calories: 300 },
        { day: 'Tue', calories: 450 },
        { day: 'Wed', calories: 380 },
        { day: 'Thu', calories: 0 },
        { day: 'Fri', calories: 520 },
        { day: 'Sat', calories: 650 },
        { day: 'Sun', calories: 300 },
      ])
    } catch (e) {
      console.error(e)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const selectedExercise = exercises.find((ex) => ex.name === form.exercise)
  const estimatedCalories = form.duration
    ? Math.round(form.duration * selectedExercise.calsPerMin * (form.intensity === 'high' ? 1.3 : form.intensity === 'low' ? 0.7 : 1))
    : 0

  async function addWorkout(e) {
    e.preventDefault()
    if (!form.duration) return

    const token = localStorage.getItem('token')
    setLoading(true)

    try {
      const newWorkout = {
        exercise: form.exercise,
        duration: parseInt(form.duration),
        calories_burned: estimatedCalories,
        date: new Date().toISOString().split('T')[0],
      }

      // Mock add (in real app, would POST to API)
      setWorkouts((ws) => [newWorkout, ...ws])
      setTotalCalories((t) => t + estimatedCalories)
      setForm({ exercise: 'Running', duration: '', intensity: 'medium' })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-2">💪 Workouts</h1>
        <p className="text-green-100">Track your fitness journey and burn calories</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Calories Burned</p>
              <p className="text-3xl font-bold mt-2">{totalCalories}</p>
              <p className="text-xs text-gray-500 mt-1">This week</p>
            </div>
            <Flame className="text-orange-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Workouts This Week</p>
              <p className="text-3xl font-bold mt-2">{workouts.length}</p>
              <p className="text-xs text-gray-500 mt-1">Sessions</p>
            </div>
            <Zap className="text-yellow-400" size={24} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Avg Duration</p>
              <p className="text-3xl font-bold mt-2">
                {workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Minutes per session</p>
            </div>
            <Clock className="text-blue-400" size={24} />
          </div>
        </div>
      </div>

      {/* Charts */}
      {weeklyData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="day" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="calories" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add Workout Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">Log New Workout</h3>
        <form onSubmit={addWorkout} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exercise Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Exercise Type</label>
              <select
                name="exercise"
                value={form.exercise}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
              >
                {exercises.map((ex) => (
                  <option key={ex.name} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="30"
                className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
              />
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Intensity</label>
              <select
                name="intensity"
                value={form.intensity}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-white/10 rounded text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Estimated Calories */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Calories</label>
              <div className="px-4 py-2 bg-gray-700 border border-white/10 rounded text-white font-semibold">
                {estimatedCalories} kcal
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !form.duration}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Log Workout
          </button>
        </form>
      </div>

      {/* Workout History */}
      <div className="bg-gray-800 rounded-lg p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">Recent Workouts</h3>
        {workouts.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No workouts logged yet. Start by logging your first workout above!</p>
        ) : (
          <div className="space-y-3">
            {workouts.map((w, i) => (
              <div key={i} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition">
                <div className="flex-1">
                  <h4 className="font-bold">{w.exercise}</h4>
                  <p className="text-sm text-gray-400">
                    {w.duration} min • {w.calories_burned} kcal
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-400">{w.calories_burned}</p>
                  <p className="text-xs text-gray-400">burned</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
            <div key={w.id} className="bg-white/5 p-4 rounded border border-white/10">
              <p className="font-semibold">{w.duration} min • {w.calories_burned} kcal</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
