import React, { useEffect, useState } from 'react';
import { Zap, ShieldCheck } from 'lucide-react';

export default function XPNotification({ xpResult, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 220);
    }, 2300);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!xpResult) return null;

  return <div className={`system-notification${visible ? ' is-visible' : ''}`} role="status" aria-live="polite">
    {xpResult.leveled_up ? <div className="system-levelup-card">
      <div className="system-levelup-label"><ShieldCheck size={15} /> SYSTEM UPDATE</div>
      <div className="system-levelup-title">LEVEL INCREASED</div>
      <div className="system-levelup-value">Lv. {xpResult.player?.level}</div>
      <div className="system-levelup-xp">+{xpResult.xp_gained} XP</div>
    </div> : <div className="system-xp-toast">
      <Zap size={15} />
      <span>+{xpResult.xp_gained} XP</span>
    </div>}
  </div>;
}
