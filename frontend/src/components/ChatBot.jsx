import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Send, X, MessageCircle, Trash2 } from 'lucide-react';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-cyan-400 typing-dot"
          style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      api.getChatHistory().then(msgs => {
        if (msgs.length === 0) {
          // Welcome message
          setMessages([{
            id: 0,
            role: 'assistant',
            content: "Yo! Main hoon BetterMe — tera future self. 89 se 70 tak ka safar complete kar chuka hoon. Ab bata, kya poochna hai? 💪",
          }]);
        } else {
          setMessages(msgs);
        }
      }).catch(console.error);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      // Add realistic delay for typing effect
      const [result] = await Promise.all([
        api.sendMessage(text),
        new Promise(r => setTimeout(r, 800 + Math.random() * 600)),
      ]);
      setTyping(false);
      setMessages(prev => [...prev.filter(m => m.id !== userMsg.id), result.user, result.assistant]);
    } catch (e) {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Bro, connection issue. Try again.",
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = async () => {
    await api.clearChat();
    setMessages([]);
  };

  return (
    <>
      {/* Chat bubble button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center pulse-glow z-40 transition-transform hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)', boxShadow: '0 0 20px #00d4ff44' }}
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 md:w-96 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{ height: '500px', background: '#0a0a1a', border: '1px solid #00d4ff33', boxShadow: '0 0 30px #00d4ff11' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800"
            style={{ background: 'linear-gradient(135deg, #0f0f2a, #13132d)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)' }}>⚡</div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">BetterMe</div>
              <div className="text-xs text-cyan-400">Your Future Self</div>
            </div>
            <button onClick={clearChat} className="text-gray-600 hover:text-gray-400 transition-colors p-1">
              <Trash2 size={14} />
            </button>
            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)' }}>⚡</div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white rounded-tr-sm'
                    : 'text-gray-200 rounded-tl-sm'
                }`}
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #7c3aed88, #7c3aed44)', border: '1px solid #7c3aed44' }
                    : { background: '#0f0f2a', border: '1px solid #1a1a3e' }
                  }>
                  {msg.content}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start items-start">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)' }}>⚡</div>
                <div className="rounded-2xl rounded-tl-sm" style={{ background: '#0f0f2a', border: '1px solid #1a1a3e' }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-800">
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your future self..."
                rows={1}
                className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-gray-600 resize-none outline-none"
                style={{ background: '#0f0f2a', border: '1px solid #1a1a3e', maxHeight: '80px' }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !sending
                    ? 'linear-gradient(135deg, #7c3aed, #00d4ff)'
                    : '#1a1a3e',
                }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
