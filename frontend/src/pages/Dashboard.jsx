import React, { useState, useCallback } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import PlayerCard from '../components/PlayerCard';
import StatCards from '../components/StatCards';
import QuestBoard from '../components/QuestBoard';
import WeightChart from '../components/WeightChart';
import XPNotification from '../components/XPNotification';
import { TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { player, stats, loading, refetch } = usePlayer();
  const [xpNotif, setXpNotif] = useState(null);

  const handleXpGain = useCallback((xpResult) => {
    setXpNotif(xpResult);
    refetch();
  }, [refetch]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-cyan-400 font-mono animate-pulse">Loading System...</div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {xpNotif && (
        <XPNotification xpResult={xpNotif} onDone={() => setXpNotif(null)} />
      )}

      {/* Player Card */}
      <PlayerCard player={player} />

      {/* Stats */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 tracking-widest mb-3 font-mono">PLAYER STATS</h3>
        <StatCards stats={stats} />
      </div>

      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Quest Board */}
        <QuestBoard onXpGain={handleXpGain} />

        {/* Weight Progress */}
        <div className="card">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-cyan-400" />
            Weight Progress
          </h3>
          <WeightChart compact />
        </div>
      </div>

      {/* Compound growth formula */}
      <div className="card border-purple-900/50 text-center py-4">
        <div className="text-gray-500 text-xs mb-2 font-mono">THE FORMULA</div>
        <div className="text-3xl font-black font-mono text-glow-purple" style={{ color: '#a855f7' }}>
          1.01<sup className="text-lg">365</sup> = 37.78
        </div>
        <div className="text-gray-400 text-sm mt-1">
          1% better every day = <span style={{ color: '#00d4ff' }}>37× better</span> by year end
        </div>
        <div className="text-gray-600 text-xs mt-2">
          "Ab Nahi To Kab 🔥"
        </div>
      </div>
    </div>
  );
}
