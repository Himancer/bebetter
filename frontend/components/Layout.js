import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Menu, X, LogOut, Home, Apple, Dumbbell, MessageCircle, Settings } from 'lucide-react'

export default function Layout({ children }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const isActive = (path) => {
    return router.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
  }

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Apple, label: 'Food Scan', path: '/food-scan' },
    { icon: Dumbbell, label: 'Workouts', path: '/workouts' },
    { icon: MessageCircle, label: 'BetterMe AI', path: '/ai-chat' },
    { icon: Settings, label: 'Profile', path: '/profile' },
  ]

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static w-64 h-screen bg-gray-900 border-r border-white/10 z-50 transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <Link href="/dashboard" className="text-2xl font-bold mb-8 block hover:text-blue-400 transition">
            🏋️ BeBetter
          </Link>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map(({ icon: Icon, label, path }) => (
              <Link key={path} href={path} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${isActive(path)}`} onClick={() => setSidebarOpen(false)}>
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gray-900 border-b border-white/10 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="hidden sm:block text-xl font-semibold">
            {router.pathname === '/dashboard' && 'Dashboard'}
            {router.pathname === '/food-scan' && 'Food Scanner'}
            {router.pathname === '/workouts' && 'Workouts'}
            {router.pathname === '/ai-chat' && 'BetterMe AI Coach'}
            {router.pathname === '/profile' && 'Profile'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
