import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { CheckCircle, Circle, Crown, Zap } from 'lucide-react';

export default function QuestBoard({ onXpGain }) {
  const [quests, setQuests] = useState({ daily: [], boss: [], progress: {} });
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  const fetchQuests = async () => {
    try {
      const data = await api.getQuests();
      setQuests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuests(); }, []);

  const handleComplete = async (quest) => {
    if (quest.completed || completing) return;
    setCompleting(quest.id);
    try {
      const result = await api.completeQuest(quest.id);
      await fetchQuests();
      if (onXpGain) onXpGain(result.xp_result);
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) return (
    <div className="card">
      <div className="text-gray-500 text-sm text-center py-4">Loading quests...</div>
    </div>
  );

  const { daily, boss, progress } = quests;
  const completedCount = progress.completed || 0;
  const totalCount = progress.total || 0;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>📋</span> Daily Quests
        </h3>
        <span className="text-xs font-mono text-gray-400">
          {completedCount}/{totalCount} CLEARED
        </span>
      </div>

      {/* Progress bar */}
      <div className="xp-bar">
        <div className="xp-bar-fill"
          style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }} />
      </div>

      {/* Daily quests */}
      <div className="space-y-2">
        {daily.map(quest => (
          <QuestItem
            key={quest.id}
            quest={quest}
            onComplete={handleComplete}
            completing={completing === quest.id}
          />
        ))}
      </div>

      {/* Boss quest */}
      {boss.length > 0 && (
        <>
          <div className="border-t border-gray-800 pt-3">
            <h4 className="text-sm font-bold text-yellow-400 flex items-center gap-2 mb-2">
              <Crown size={14} /> Weekly Boss Quest
            </h4>
            {boss.map(quest => (
              <QuestItem key={quest.id} quest={quest} onComplete={handleComplete}
                completing={completing === quest.id} isBoss />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QuestItem({ quest, onComplete, completing, isBoss }) {
  return (
    <div
      onClick={() => onComplete(quest)}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        quest.completed
          ? 'opacity-60 cursor-default'
          : 'hover:bg-white/5 active:scale-[0.98]'
      } ${isBoss ? 'border border-yellow-400/20' : 'border border-gray-800'}`}
      style={isBoss && !quest.completed ? { borderColor: '#fbbf2422' } : {}}
    >
      <div className="flex-shrink-0">
        {quest.completed
          ? <CheckCircle size={20} className="text-green-400" />
          : completing
          ? <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          : <Circle size={20} className="text-gray-600" />
        }
      </div>

      <span className="text-xl flex-shrink-0">{quest.icon}</span>

      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${quest.completed ? 'line-through text-gray-500' : 'text-white'}`}>
          {quest.title}
        </div>
        <div className="text-xs text-gray-600 truncate">{quest.description}</div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <Zap size={10} className="text-yellow-400" />
        <span className={`text-xs font-mono font-bold ${isBoss ? 'text-yellow-400' : 'text-cyan-400'}`}>
          +{quest.xp_reward}
        </span>
      </div>
    </div>
  );
}
