import React from 'react';
const SIGNALS = [
  { key: 'STR', label: 'Strength', desc: 'Workouts recorded', color: '#ff9a78', icon: '↗' },
  { key: 'VIT', label: 'Vitality', desc: 'Days with a meal log', color: '#b8e88b', icon: '✳' },
  { key: 'END', label: 'Consistency', desc: 'Current activity streak', color: '#72e2dc', icon: '◷' },
  { key: 'INT', label: 'Growth', desc: 'Earned XP ÷ 10', color: '#b8a2ff', icon: '✧' },
];
export default function StatCards({ stats }) {
  return <div className="signal-grid">{SIGNALS.map(({ key, label, desc, color, icon }) => {
    const value = Number(stats?.[key] ?? 0), width = Math.min(Math.max(value, 0), 100);
    return <article key={key} className="card card-hover signal-card" style={{ borderColor: color + '25' }}>
      <div className="signal-top"><span className="signal-icon" style={{ color }}>{icon}</span><span style={{ color, fontSize: 9, fontWeight: 750, letterSpacing: '.12em' }}>{key}</span></div>
      <div className="signal-value" style={{ color }}>{value}</div><div className="signal-label">{label}</div><div className="signal-desc">{desc}</div><div className="signal-bar"><span style={{ width: width + '%', background: color }} /></div>
    </article>;
  })}</div>;
}
