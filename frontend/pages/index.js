import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowRight, Zap, Apple, Dumbbell, MessageCircle, TrendingUp, Shield } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🏋️ BeBetter</h1>
        <div className="flex gap-4">
          <Link href="/login" className="px-6 py-2 text-gray-300 hover:text-white transition">Login</Link>
          <Link href="/register" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Your AI-Powered Fitness <span className="text-blue-400">Coach</span>
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Track your nutrition, log workouts, and get real-time coaching from BetterMe. Achieve your fitness goals smarter, not harder.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2 transition">
            Start Free <ArrowRight size={20} />
          </Link>
          <button className="px-8 py-3 border border-white/20 hover:border-white/40 rounded-lg transition">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Powerful Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Apple,
                title: 'Smart Food Scanning',
                desc: 'Take photos of your meals and let AI estimate nutrition instantly',
              },
              {
                icon: Dumbbell,
                title: 'Workout Tracking',
                desc: 'Log exercises and track calories burned with precise calculations',
              },
              {
                icon: MessageCircle,
                title: 'AI Coaching',
                desc: 'Chat with BetterMe for personalized fitness advice and motivation',
              },
              {
                icon: TrendingUp,
                title: 'Progress Analytics',
                desc: 'Beautiful charts and insights to track your fitness journey',
              },
              {
                icon: Shield,
                title: 'Privacy First',
                desc: 'Your data is private, secure, and never shared',
              },
              {
                icon: Zap,
                title: 'Real-Time Goals',
                desc: 'Personalized daily targets based on your profile and goals',
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-gray-800 p-6 rounded-lg border border-white/10 hover:border-white/20 transition">
                  <Icon className="text-blue-400 mb-4" size={32} />
                  <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { num: 1, title: 'Sign Up', desc: 'Create your account with your fitness profile' },
            { num: 2, title: 'Log Meals', desc: 'Scan food images or search the database' },
            { num: 3, title: 'Track Workouts', desc: 'Log your exercises and intensity' },
            { num: 4, title: 'Get Coached', desc: 'Chat with BetterMe for personalized tips' },
          ].map((step) => (
            <div key={step.num} className="text-center">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {step.num}
              </div>
              <h4 className="font-bold text-lg mb-2">{step.title}</h4>
              <p className="text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20 rounded-lg mx-6 mb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Fitness?</h3>
          <p className="text-lg text-blue-100 mb-8">Join thousands of users on their fitness journey with BeBetter</p>
          <Link href="/register" className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-gray-400">
        <p>© 2025 BeBetter. All rights reserved. | Made with ❤️ for fitness</p>
      </footer>
    </div>
  )
}
