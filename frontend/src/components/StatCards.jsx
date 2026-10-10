import React from 'react';
import { Activity, HeartPulse, Shield, Compass } from 'lucide-react';

const SIGNALS = [
  { key: 'STR', label: 'Strength', desc: 'Workouts recorded', color: '#78bce0', icon: Activity },
  { key: 'VIT', label: 'Vitality', desc: 'Days with a meal log', color: '#76c9b2', icon: HeartPulse },
  { key: 'END', label: 'Consistency', desc: 'Current activity streak', color: '#9b9de0', icon: Shield },
  { key: 'INT', label: 'Growth', desc: 'Earned XP ÷ 10', color: '#c6aa74', icon: Compass },
];

export default function StatCards({ stats }) {
  return <div className="signal-grid">{SIGNALS.map(({ key, label, desc, color, icon: Icon }) => {
    const value = Number(stats?.[key] ?? 0), width = Math.min(Math.max(value, 0), 100);
    return <article key={key} className="card card-hover signal-card" style={{ borderColor: color + '25' }}>
      <div className="signal-top"><span className="signal-icon" style={{ color }}>{React.createElement(Icon, { size: 15, strokeWidth: 1.8 })}</span><span style={{ color, fontSize: 9, fontWeight: 750, letterSpacing: '.12em' }}>{key}</span></div>
      <div className="signal-value" style={{ color }}>{value}</div><div className="signal-label">{label}</div><div className="signal-desc">{desc}</div><div className="signal-bar"><span style={{ width: width + '%', background: color }} /></div>
    </article>;
  })}</div>;
}
