import React, { useState } from 'react';
import { api } from '../utils/api';
import { Dumbbell, ShieldAlert, Zap } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('System Error: Required credentials missing.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.login({ username, password });
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          window.location.href = '/'; 
        }
      } else {
        await api.register({ username, password });
        setIsLogin(true);
        setError('');
        alert('Player registered! You may now enter the dungeon.');
      }
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        setError(parsed.message || parsed.error || 'Authentication failed');
      } catch {
        setError(err.message || 'Authentication failed. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0a0a1a' }}>
      <div className="card w-full max-w-md glow-blue relative overflow-hidden" style={{ border: '1px solid #00d4ff44' }}>
        
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Dumbbell size={150} />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <Zap size={40} className="text-cyan-400 drop-shadow-[0_0_10px_#00d4ff]" />
          </div>
          <h2 className="text-3xl font-black text-center mb-1 font-mono tracking-widest text-glow-blue" style={{ color: '#00d4ff' }}>
            BE BETTER
          </h2>
          <p className="text-gray-500 text-center text-xs mb-8 tracking-[0.2em] font-mono">
            {isLogin ? 'SYSTEM LOGIN' : 'PLAYER AWAKENING'}
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: '#f8717111', border: '1px solid #f8717144', color: '#f87171' }}>
              <ShieldAlert size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-cyan-400 mb-1 block font-mono tracking-wider">PLAYER_ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white font-mono outline-none transition-all"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }}
                placeholder="Enter username"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-xs text-cyan-400 mb-1 block font-mono tracking-wider">PASSCODE</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white font-mono outline-none transition-all"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-black text-sm tracking-widest mt-4 transition-all hover:scale-[1.02] flex justify-center items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)', color: 'white' }}
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'ENTER DUNGEON' : 'INITIALIZE SYSTEM')}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500 font-mono">
            {isLogin ? "NEW PLAYER? " : "SYSTEM READY? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-cyan-400 hover:text-white transition-colors tracking-wider"
              style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              {isLogin ? 'AWAKEN NOW' : 'LOG IN'}
            </button>
          </div>
          
          <div className="mt-8 text-center text-[10px] text-gray-700 font-mono tracking-widest">
            "AB NAHI TO KAB 🔥"
          </div>
        </div>
      </div>
    </div>
  );
}
