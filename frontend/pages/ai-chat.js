import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Send, Loader, Zap } from 'lucide-react'

const API = 'http://localhost:8000'

const suggestedQuestions = [
  'What should I eat for lunch?',
  'How many calories did I burn today?',
  'Give me protein-rich meal ideas',
  'Am I on track with my goals?',
  'What exercises should I do?',
  'How can I improve my nutrition?',
]

export default function AiChat() {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchUser(token)

    // Welcome message
    setMessages([
      {
        role: 'assistant',
        content: 'Hey! I\'m BetterMe, your personal AI fitness coach. Ask me anything about your nutrition, workouts, or fitness goals!',
      },
    ])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchUser(token) {
    try {
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUser(await res.json())
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || messageCount >= 10) return

    const token = localStorage.getItem('token')
    const userMessage = { role: 'user', content: input }
    setMessages((m) => [...m, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((m) => [...m, { role: 'assistant', content: data.reply || 'Got it! Keep pushing!' }])
        setMessageCount((c) => c + 1)
      }
    } catch (e) {
      console.error(e)
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Try again!' }])
    } finally {
      setLoading(false)
    }
  }

  function handleSuggestion(question) {
    setInput(question)
  }

  const remainingMessages = 10 - messageCount

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🤖 BetterMe AI Coach</h1>
            <p className="text-purple-100 mt-1">Your personal fitness coach powered by AI</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{remainingMessages}</div>
            <div className="text-sm text-purple-100">messages left today</div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-6 space-y-4 mb-6 border border-white/10">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xl px-6 py-3 rounded-lg ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-100 rounded-bl-none'
              }`}
            >
              <p className="leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 px-6 py-3 rounded-lg rounded-bl-none flex items-center space-x-2">
              <Loader className="animate-spin" size={18} />
              <span>BetterMe is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && remainingMessages > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedQuestions.slice(0, 4).map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(q)}
                className="p-3 text-left bg-gray-800 hover:bg-gray-700 rounded-lg border border-white/10 transition text-sm"
              >
                <Zap className="inline mr-2 text-yellow-400" size={14} />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Limit Warning */}
      {remainingMessages === 0 && (
        <div className="mb-6 p-4 bg-red-600/20 border border-red-500 rounded-lg text-red-100">
          <p>You've reached your daily message limit. Come back tomorrow!</p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={remainingMessages > 0 ? 'Ask BetterMe anything...' : 'Daily limit reached'}
          disabled={remainingMessages <= 0 || loading}
          className="flex-1 px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={remainingMessages <= 0 || loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center gap-2"
        >
          {loading ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
          Send
        </button>
      </form>
    </div>
  )
}
