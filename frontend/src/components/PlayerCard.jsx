import React from 'react';
import { Zap, Flame, Shield } from 'lucide-react';

const RANK_COLORS = {
  E: '#9ca3af', D: '#60a5fa', C: '#34d399', B: '#fbbf24', A: '#f87171', S: '#a855f7'
};

export default function PlayerCard({ player }) {
  if (!player) return null;
  const xpPct = player.xp_progress || 0;
  const rankColor = RANK_COLORS[player.rank] || '#9ca3af';

  return (
    <div className="card neon-border relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 opacity-5" style={{
        background: `radial-gradient(circle at 30% 50%, ${rankColor} 0%, transparent 70%)`
      }} />

      <div className="relative flex items-center gap-6">
        {/* Avatar silhouette */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${rankColor}22, ${rankColor}11)`, border: `2px solid ${rankColor}66` }}>
            <div className="text-4xl select-none">🧑‍💻</div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: rankColor, color: '#0a0a1a' }}>
              {player.rank}
            </div>
          </div>
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-white tracking-wide">{player.name}</h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold"
              style={{ background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}44` }}>
              RANK {player.rank}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} style={{ color: rankColor }} />
            <span className="text-sm font-mono" style={{ color: rankColor }}>
              LEVEL {player.level}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {player.total_xp} total XP
            </span>
          </div>

          {/* XP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500 font-mono">
              <span className="flex items-center gap-1">
                <Zap size={10} className="text-yellow-400" />
                XP Progress
              </span>
              <span>{xpPct} / 100</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex-shrink-0 text-center">
          <div className="text-3xl fire-flicker">🔥</div>
          <div className="text-2xl font-bold text-orange-400 font-mono">{player.streak}</div>
          <div className="text-xs text-gray-500">streak</div>
        </div>
      </div>
    </div>
  );
}
