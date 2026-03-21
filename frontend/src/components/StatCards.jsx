import React from 'react';

const STATS_CONFIG = [
  { key: 'STR', label: 'Strength', desc: 'Workouts completed', color: '#f87171', icon: '⚔️' },
  { key: 'VIT', label: 'Vitality', desc: 'Days diet logged', color: '#34d399', icon: '🌿' },
  { key: 'END', label: 'Endurance', desc: 'Current streak', color: '#60a5fa', icon: '🛡️' },
  { key: 'INT', label: 'Intelligence', desc: 'XP / 10', color: '#a855f7', icon: '✨' },
];

export default function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {STATS_CONFIG.map(({ key, label, desc, color, icon }) => {
        const val = stats?.[key] ?? 0;
        const barWidth = Math.min(val, 100);

        return (
          <div key={key} className="card card-hover p-4 text-center relative overflow-hidden"
            style={{ borderColor: `${color}22` }}>
            <div className="absolute inset-0 opacity-5"
              style={{ background: `radial-gradient(circle at 50% 100%, ${color}, transparent)` }} />

            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold font-mono relative" style={{ color }}>
              {val}
            </div>
            <div className="text-xs font-bold tracking-widest mt-0.5" style={{ color }}>
              {label}
            </div>
            <div className="text-xs text-gray-600 mt-0.5 mb-2">{desc}</div>

            <div className="stat-bar">
              <div className="h-full rounded-sm transition-all duration-1000"
                style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
