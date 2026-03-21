import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import XPNotification from '../components/XPNotification';
import { Scroll, CheckCircle, Circle, Crown, Zap, RefreshCw } from 'lucide-react';

export default function QuestsPage() {
  const [quests, setQuests] = useState({ daily: [], boss: [], progress: {} });
  const [loading, setLoading] = useState(true);
  const [xpNotif, setXpNotif] = useState(null);
  const [completing, setCompleting] = useState(null);

  const loadQuests = async () => {
    const data = await api.getQuests();
    setQuests(data);
    setLoading(false);
  };

  useEffect(() => { loadQuests().catch(console.error); }, []);

  const complete = async (quest) => {
    if (quest.completed || completing) return;
    setCompleting(quest.id);
    try {
      const result = await api.completeQuest(quest.id);
      setXpNotif(result.xp_result);
      await loadQuests();
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(null);
    }
  };

  const { daily, boss, progress } = quests;
  const completedPct = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {xpNotif && <XPNotification xpResult={xpNotif} onDone={() => setXpNotif(null)} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scroll size={24} className="text-cyan-400" />
          <div>
            <h1 className="text-2xl font-black text-white">Quest Board</h1>
            <p className="text-gray-500 text-sm">Daily missions. Weekly bosses. Endless grind.</p>
          </div>
        </div>
        <button onClick={loadQuests} className="text-gray-600 hover:text-gray-400 p-2">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Daily progress */}
      {!loading && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-400">DAILY PROGRESS</span>
            <span className="text-sm font-mono text-cyan-400">
              {progress.completed}/{progress.total} Cleared
            </span>
          </div>
          <div className="xp-bar" style={{ height: '12px' }}>
            <div className="xp-bar-fill" style={{ width: `${completedPct}%` }} />
          </div>
          {completedPct === 100 && (
            <div className="text-center mt-3 text-green-400 font-bold text-sm level-up-flash">
              🎉 ALL DAILY QUESTS CLEARED! 🎉
            </div>
          )}
        </div>
      )}

      {/* Daily quests */}
      <div className="card space-y-2">
        <h3 className="text-sm font-bold text-gray-400 tracking-widest mb-4 flex items-center gap-2">
          ⚔️ DAILY QUESTS
        </h3>

        {loading ? (
          <div className="text-center py-6 text-gray-600 animate-pulse">Generating quests...</div>
        ) : (
          daily.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={complete}
              completing={completing === quest.id}
            />
          ))
        )}
      </div>

      {/* Boss quests */}
      {boss.length > 0 && (
        <div className="card space-y-2" style={{ borderColor: '#fbbf2422' }}>
          <h3 className="text-sm font-bold text-yellow-400 tracking-widest mb-4 flex items-center gap-2">
            <Crown size={14} /> WEEKLY BOSS QUEST
          </h3>
          {boss.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={complete}
              completing={completing === quest.id}
              isBoss
            />
          ))}
        </div>
      )}

      {/* XP explanation */}
      <div className="card text-center py-4" style={{ borderColor: '#7c3aed22' }}>
        <div className="text-gray-500 text-xs font-mono mb-2">LEVEL UP SYSTEM</div>
        <div className="text-white text-lg font-bold font-mono">100 XP = 1 Level</div>
        <div className="text-gray-500 text-sm mt-1">
          Complete quests → Earn XP → Level up → Unlock higher ranks
        </div>
        <div className="text-xs text-gray-700 mt-2 font-mono">E → D → C → B → A → S</div>
      </div>
    </div>
  );
}

function QuestCard({ quest, onComplete, completing, isBoss }) {
  return (
    <div
      onClick={() => !quest.completed && onComplete(quest)}
      className={`p-4 rounded-xl transition-all ${
        quest.completed
          ? 'opacity-60 cursor-default'
          : 'cursor-pointer hover:bg-white/5 active:scale-[0.98]'
      }`}
      style={{
        background: quest.completed ? '#00ff8808' : '#13132d',
        border: `1px solid ${quest.completed ? '#00ff8833' : isBoss ? '#fbbf2422' : '#1a1a3e'}`,
      }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {quest.completed
            ? <CheckCircle size={22} className="text-green-400" />
            : completing
            ? <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mt-0.5" />
            : <Circle size={22} className={isBoss ? 'text-yellow-600' : 'text-gray-600'} />
          }
        </div>

        <div className="text-2xl flex-shrink-0">{quest.icon}</div>

        <div className="flex-1 min-w-0">
          <div className={`font-medium ${quest.completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {quest.title}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">{quest.description}</div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="flex items-center gap-1 justify-end">
            <Zap size={12} className="text-yellow-400" />
            <span className={`font-mono font-bold text-sm ${isBoss ? 'text-yellow-400' : 'text-cyan-400'}`}>
              +{quest.xp_reward}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-0.5">XP</div>
        </div>
      </div>
    </div>
  );
}
