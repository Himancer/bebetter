import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Sparkles, ShieldAlert, ArrowRight, Check } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true), [username, setUsername] = useState(''), [playerName, setPlayerName] = useState(''), [password, setPassword] = useState('');
  const [error, setError] = useState(''), [success, setSuccess] = useState(''), [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!username.trim() || !password || (!isLogin && !playerName.trim())) { setError(isLogin ? 'Enter both a username and password to continue.' : 'Enter a player name, username, and password to continue.'); return; }
    if (!isLogin && password.length < 8) { setError('Choose a password with at least 8 characters.'); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.login({ username: username.trim(), password });
        if (res?.token) { localStorage.setItem('token', res.token); localStorage.setItem('username', res.username || username.trim()); navigate('/'); }
        else setError('We could not sign you in. Please try again.');
      } else {
        const account = await api.register({ username: username.trim(), player_name: playerName.trim(), password });
        localStorage.setItem('username', account?.username || username.trim());
        setIsLogin(true); setSuccess('Your account is ready. Sign in with the details you just created.');
      }
    } catch (err) {
      try { const parsed = JSON.parse(err.message); setError(parsed.message || parsed.error || 'We could not complete that request.'); }
      catch { setError(err.message || 'We could not reach the server. Check your connection and try again.'); }
    } finally { setLoading(false); }
  };

  return <main className="auth-page">
    <section className="auth-story">
      <div className="auth-brand"><span className="brand-mark"><Sparkles size={19} /></span><span>beBetter</span></div>
      <div className="auth-message">
        <div className="auth-eyebrow"><span className="status-dot" /> Your personal growth system</div>
        <h1 className="auth-title">Become your own <em>next level.</em></h1>
        <p className="auth-description">Turn the small things you do for yourself into visible progress. Train, build consistency, and make room for the person you’re becoming.</p>
        <div className="auth-pill-row"><span className="auth-pill">Training</span><span className="auth-pill">Nutrition</span><span className="auth-pill">Daily missions</span><span className="auth-pill">Personal progress</span></div>
      </div>
      <div className="auth-footer">A work in progress, built around one idea: keep showing up for yourself.</div>
    </section>
    <section className="auth-form-side"><div className="auth-card">
      <div className="auth-card-kicker">{isLogin ? 'Welcome back' : 'Start your journey'}</div>
      <h2>{isLogin ? 'Sign in to BeBetter' : 'Create your account'}</h2>
      <p className="auth-card-subtitle">{isLogin ? 'Pick up where you left off.' : 'Your first step is simply showing up.'}</p>
      {error && <div className="auth-error" role="alert"><ShieldAlert size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 7 }} />{error}</div>}
      {success && <div className="auth-success" role="status"><Check size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 7 }} />{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="auth-field"><label htmlFor="username">Username</label><input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" autoComplete="username" maxLength={40} required /></div>
        {!isLogin && <div className="auth-field"><label htmlFor="player-name">Player name</label><input id="player-name" type="text" value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="What should we call you?" autoComplete="name" maxLength={100} required /></div>}
        <div className="auth-field"><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isLogin ? 'Your password' : 'At least 8 characters'} autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={isLogin ? undefined : 8} required /></div>
        <button type="submit" disabled={loading} className="auth-submit">{loading ? 'Please wait…' : isLogin ? <>Sign in <ArrowRight size={15} /></> : <>Create account <ArrowRight size={15} /></>}</button>
      </form>
      <div className="auth-switch">{isLogin ? 'New to BeBetter? ' : 'Already have an account? '}<button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}>{isLogin ? 'Create an account' : 'Sign in'}</button></div>
      <div className="auth-privacy">Use a password you don’t use elsewhere. This early version is a personal progress demo; avoid adding sensitive health information.</div>
    </div></section>
  </main>;
}
