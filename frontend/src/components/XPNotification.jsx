import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export default function XPNotification({ xpResult, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!xpResult) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      {xpResult.leveled_up ? (
        <div className="rounded-xl p-4 text-center level-up-flash"
          style={{ background: 'linear-gradient(135deg, #7c3aed22, #00d4ff22)', border: '2px solid #7c3aed', boxShadow: '0 0 30px #7c3aed66' }}>
          <div className="text-3xl mb-1">🎊</div>
          <div className="text-yellow-400 font-bold text-lg font-mono">LEVEL UP!</div>
          <div className="text-white font-bold">Level {xpResult.player?.level}</div>
          <div className="text-cyan-400 font-mono text-sm">+{xpResult.xp_gained} XP</div>
        </div>
      ) : (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2"
          style={{ background: '#0f0f2a', border: '1px solid #00d4ff44', boxShadow: '0 0 15px #00d4ff22' }}>
          <Zap size={16} className="text-yellow-400" />
          <span className="text-cyan-400 font-mono font-bold">+{xpResult.xp_gained} XP</span>
        </div>
      )}
    </div>
  );
}
