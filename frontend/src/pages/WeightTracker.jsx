import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import WeightChart from '../components/WeightChart';
import XPNotification from '../components/XPNotification';
import { Scale, Trophy, Plus } from 'lucide-react';

export default function WeightTracker() {
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [todayLog, setTodayLog] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [xpNotif, setXpNotif] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    const [today, ms] = await Promise.all([api.getTodayWeight(), api.getWeightMilestones()]);
    setTodayLog(today);
    setMilestones(ms);
    if (today) setWeight(today.weight.toString());
  };

  useEffect(() => { loadData().catch(console.error); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weight || submitting) return;
    setSubmitting(true);
    try {
      const result = await api.logWeight({ weight: parseFloat(weight), note });
      if (result.xp_result) setXpNotif(result.xp_result);
      setSuccess(true);
      await loadData();
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {xpNotif && <XPNotification xpResult={xpNotif} onDone={() => setXpNotif(null)} />}

      <div className="flex items-center gap-3">
        <Scale size={24} className="text-cyan-400" />
        <div>
          <h1 className="text-2xl font-black text-white">Weight Tracker</h1>
          <p className="text-gray-500 text-sm">Track the boss battle: 89kg → 70kg</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Log weight */}
        <div className="card md:col-span-1">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-4">LOG TODAY'S WEIGHT</h3>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="e.g. 87.5"
                className="w-full px-3 py-2.5 rounded-lg text-white text-lg font-mono outline-none"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="How are you feeling?"
                className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }}
              />
            </div>

            <button type="submit" disabled={submitting || !weight}
              className="w-full py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: success
                  ? 'linear-gradient(135deg, #00ff8822, #00ff8844)'
                  : 'linear-gradient(135deg, #7c3aed, #00d4ff)',
                border: success ? '1px solid #00ff88' : 'none',
                color: 'white',
              }}>
              {success ? '✓ LOGGED!' : submitting ? 'Logging...' : (
                <><Plus size={16} /> LOG WEIGHT +10 XP</>
              )}
            </button>
          </form>

          {todayLog && (
            <div className="mt-4 p-3 rounded-lg text-center"
              style={{ background: '#00d4ff0a', border: '1px solid #00d4ff22' }}>
              <div className="text-xs text-gray-500 mb-1">Today's Log</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">{todayLog.weight} kg</div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="card md:col-span-2">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-4">PROGRESS GRAPH</h3>
          <WeightChart />
        </div>
      </div>

      {/* Milestones */}
      {milestones && milestones.milestones && (
        <div className="card">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-4 flex items-center gap-2">
            <Trophy size={14} className="text-yellow-400" />
            BOSS MILESTONE ACHIEVEMENTS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {milestones.milestones.map(m => (
              <div key={m.percentage}
                className={`p-3 rounded-lg text-center transition-all ${
                  m.achieved ? 'opacity-100' : 'opacity-40'
                }`}
                style={{
                  background: m.achieved ? '#fbbf2411' : '#1a1a3e22',
                  border: `1px solid ${m.achieved ? '#fbbf2444' : '#1a1a3e'}`,
                }}>
                <div className="text-2xl mb-1">{m.achieved ? '🏆' : '🔒'}</div>
                <div className={`text-sm font-bold font-mono ${m.achieved ? 'text-yellow-400' : 'text-gray-600'}`}>
                  -{m.kg_lost}kg
                </div>
                <div className={`text-xs mt-0.5 ${m.achieved ? 'text-gray-400' : 'text-gray-700'}`}>
                  {m.percentage}% done
                </div>
                <div className={`text-xs mt-0.5 font-mono ${m.achieved ? 'text-gray-500' : 'text-gray-800'}`}>
                  {m.target_weight}kg target
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
