import React from 'react';
import { Shield, Flame, Zap } from 'lucide-react';
const COLORS = { E: '#94a2ae', D: '#72e2dc', C: '#b8e88b', B: '#ffbd69', A: '#ff9a78', S: '#b8a2ff' };
export default function PlayerCard({ player, compact = false }) {
  if (!player) return null;
  const color = COLORS[player.rank] || COLORS.E;
  const pct = Math.min(Math.max(Number(player.xp_progress || 0), 0), 100);
  if (compact) return <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)', fontSize: 10 }}>
    <Shield size={13} style={{ color }} /><span>LEVEL {player.level || 1}</span><span style={{ opacity: .45 }}>·</span><Flame size={13} style={{ color: 'var(--amber)' }} /><span>{player.streak || 0} day streak</span>
  </div>;
  return <section className="card neon-border"><div className="flex items-center gap-6">
    <div className="flex-shrink-0"><div className="w-20 h-20 rounded-full flex items-center justify-center relative" style={{ background: color + '15', border: '2px solid ' + color + '55' }}>
      <div className="text-4xl select-none" aria-hidden="true">✦</div><div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: color, color: '#10171f' }}>{player.rank}</div>
    </div></div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-1"><h2 className="text-xl font-bold text-white tracking-wide">{player.name}</h2><span className="text-xs px-2 py-0.5 rounded font-mono font-bold" style={{ background: color + '18', color }}>RANK {player.rank}</span></div>
      <div className="flex items-center gap-2 mb-3"><Shield size={14} style={{ color }} /><span className="text-sm font-mono" style={{ color }}>LEVEL {player.level}</span><span className="text-xs text-gray-500 ml-2">{player.total_xp} total XP</span></div>
      <div className="space-y-1"><div className="flex justify-between text-xs text-gray-500 font-mono"><span className="flex items-center gap-1"><Zap size={10} style={{ color: 'var(--lime)' }} /> XP progress</span><span>{pct}%</span></div><div className="xp-bar"><div className="xp-bar-fill" style={{ width: pct + '%' }} /></div></div>
    </div>
    <div className="flex-shrink-0 text-center"><Flame size={23} style={{ color: 'var(--amber)', margin: '0 auto 5px' }} /><div className="text-xl font-bold font-mono" style={{ color: 'var(--amber)' }}>{player.streak || 0}</div><div className="text-xs text-gray-500">day streak</div></div>
  </div></section>;
}
