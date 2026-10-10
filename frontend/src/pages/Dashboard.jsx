import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import PlayerCard from '../components/PlayerCard';
import StatCards from '../components/StatCards';
import QuestBoard from '../components/QuestBoard';
import WeightChart from '../components/WeightChart';
import XPNotification from '../components/XPNotification';
import { ArrowRight, Activity, Sparkles, Compass } from 'lucide-react';
import { api } from '../utils/api';

export default function Dashboard() {
  const { player, stats, loading, refetch } = usePlayer();
  const [xpNotif, setXpNotif] = useState(null);
  const [futureSelf, setFutureSelf] = useState(null);
  useEffect(() => { api.getFutureSelf().then(({ profile }) => setFutureSelf(profile)).catch(() => {}); }, []);
  const handleXpGain = useCallback((result) => { setXpNotif(result); refetch(); }, [refetch]);
  if (loading) return <div className="dashboard-shell" aria-live="polite"><div className="card" style={{ minHeight: 220, display: 'grid', placeItems: 'center', color: 'var(--muted)' }}><span><Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--cyan)' }} /> Loading your dashboard…</span></div></div>;
  const name = player?.name?.trim() || 'Player';
  const rank = player?.rank || 'E', level = player?.level || 1;
  const xp = Math.min(Math.max(Number(player?.xp_progress || 0), 0), 100);

  return <div className="dashboard-shell">
    {xpNotif && <XPNotification xpResult={xpNotif} onDone={() => setXpNotif(null)} />}
    <div className="dashboard-topline"><div className="eyebrow"><span className="status-dot" /> SYSTEM STATUS</div></div>
    <section className="dashboard-hero">
      <div className="hero-copy"><div className="hero-kicker">Welcome back, {name}</div><h1 className="hero-title">Your next level starts <em>today.</em></h1><p className="hero-text">Build strength, consistency, and better habits one small promise at a time. Your progress is yours to define.</p>
        <div className="hero-actions"><Link className="action-primary" to="/workout"><Activity size={15} /> Log a workout <ArrowRight size={14} /></Link><Link className="action-secondary" to="/quests">See today’s missions</Link></div>
      </div>
      <div className="hero-rank" aria-label={'Rank ' + rank + ', level ' + level}><div className="rank-orbit"><div className="rank-letter">{rank}</div><div className="rank-caption">hunter rank</div></div><div className="rank-level">LEVEL {level}</div><div className="hero-xp"><div className="hero-xp-label"><span>Next level</span><span>{xp}%</span></div><div className="xp-bar"><div className="xp-bar-fill" style={{ width: xp + '%' }} /></div></div></div>
    </section>
    <Link to="/future-self" className="future-teaser"><span className="future-teaser-icon"><Compass size={18} /></span><span className="future-teaser-copy"><small>YOUR DIRECTION</small><strong>{futureSelf?.plan?.future_self || 'Define the version of yourself you want to build toward.'}</strong></span><span className="future-teaser-action">{futureSelf?.plan?.timeline ? 'View plan' : 'Create your plan'} <ArrowRight size={14} /></span></Link>
    <section><div className="section-heading"><div><h2 className="section-title">Your growth signals</h2><p className="section-caption">A snapshot of the activity you’ve logged so far.</p></div><PlayerCard player={player} compact /></div><StatCards stats={stats} /></section>
    <div className="dashboard-columns">
      <section className="dashboard-panel"><div className="section-heading"><div><h2 className="section-title">Today’s missions</h2><p className="section-caption">Small actions that keep your momentum moving.</p></div><Link to="/quests" className="panel-link">All missions <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link></div><QuestBoard onXpGain={handleXpGain} /></section>
      <section className="dashboard-panel"><div className="section-heading"><div><h2 className="section-title">Your weight history</h2><p className="section-caption">A trend line, when you choose to track it.</p></div><Link to="/weight" className="panel-link">Open tracker <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link></div><div className="card panel-card"><WeightChart compact /></div></section>
    </div>
    <div className="dashboard-note"><Sparkles size={15} className="dashboard-note-icon" /><span><strong>Progress is personal.</strong> Your signals reflect what you log here; they aren’t a judgment of your health or worth. BeBetter is growing beyond fitness, one chapter at a time.</span></div>
  </div>;
}
