import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../utils/api';
import XPNotification from '../components/XPNotification';
import { ArrowRight, Check, Circle, Crown, RefreshCw, Scroll, Sparkles, Zap } from 'lucide-react';

export default function QuestsPage() {
  const [quests, setQuests] = useState({ daily: [], boss: [], progress: { completed: 0, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [xpNotif, setXpNotif] = useState(null);
  const [completing, setCompleting] = useState(null);

  const loadQuests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setQuests(await api.getQuests());
    } catch {
      setError('Your quests could not load. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // This async helper updates state after its API request settles.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadQuests(); }, [loadQuests]);

  const complete = async quest => {
    if (quest.completed || completing) return;
    setCompleting(quest.id);
    setError('');
    try {
      const result = await api.completeQuest(quest.id);
      if (result?.xp_result) setXpNotif(result.xp_result);
      await loadQuests();
    } catch {
      setError('That quest could not be updated. Please try again.');
    } finally {
      setCompleting(null);
    }
  };

  const daily = quests.daily || [];
  const boss = quests.boss || [];
  const progress = quests.progress || { completed: 0, total: daily.length + boss.length };
  const completedPct = progress.total > 0 ? Math.min(100, (progress.completed / progress.total) * 100) : 0;

  return <div className="quest-page">
    {xpNotif && <XPNotification xpResult={xpNotif} onDone={() => setXpNotif(null)} />}
    <header className="quest-header">
      <div><div className="future-eyebrow"><span className="status-dot" /> TODAY’S MOMENTUM</div><h1>Quest board<span>.</span></h1><p>Small, personal actions that keep the week moving. A lighter version still counts.</p></div>
      <button type="button" className="quest-refresh" onClick={loadQuests} disabled={loading} aria-label="Refresh quests"><RefreshCw size={16} className={loading ? 'quest-spinning' : ''} /> Refresh</button>
    </header>

    <section className="quest-progress-card" aria-label="Daily quest progress">
      <div className="quest-progress-head"><div><span>YOUR DAILY PROGRESS</span><strong>{progress.completed} <small>/ {progress.total} cleared</small></strong></div><div className="quest-progress-emblem"><Scroll size={19} /></div></div>
      <div className="xp-bar quest-progress-bar"><div className="xp-bar-fill" style={{ width: `${completedPct}%` }} /></div>
      <div className="quest-progress-foot">{completedPct === 100 && progress.total > 0 ? 'All today’s quests are cleared. Take the win.' : 'One useful step at a time.'}<span>{Math.round(completedPct)}%</span></div>
    </section>

    {error && <div className="quest-error" role="alert">{error}<button type="button" onClick={loadQuests}>Try again</button></div>}

    <section className="quest-list-panel">
      <div className="quest-section-heading"><div className="quest-section-icon"><Sparkles size={16} /></div><div><h2>Today’s quests</h2><p>These are tailored to the focus areas in your Future Self plan.</p></div><span className="quest-section-count">{daily.length} ACTIVE</span></div>
      {loading ? <div className="quest-loading" role="status">Preparing your quests…</div> : daily.length ? <div className="quest-list">{daily.map(quest => <QuestCard key={quest.id} quest={quest} onComplete={complete} busy={completing === quest.id} />)}</div> : <div className="quest-loading">No quests yet. Refresh to check for today’s missions.</div>}
    </section>

    {boss.length > 0 && <section className="quest-list-panel quest-boss-panel"><div className="quest-section-heading"><div className="quest-section-icon boss"><Crown size={16} /></div><div><h2>Weekly challenge</h2><p>A longer challenge to work on when it fits.</p></div></div><div className="quest-list">{boss.map(quest => <QuestCard key={quest.id} quest={quest} onComplete={complete} busy={completing === quest.id} boss />)}</div></section>}

    <section className="quest-xp-note"><div className="quest-section-icon"><Zap size={16} /></div><div><strong>XP tracks app activity</strong><p>Quests help you keep a rhythm. They don’t measure your health, worth, or how far you can go.</p></div><div className="quest-rank-path">E <ArrowRight size={11} /> D <ArrowRight size={11} /> C <ArrowRight size={11} /> B <ArrowRight size={11} /> A <ArrowRight size={11} /> S</div></section>
  </div>;
}

function QuestCard({ quest, onComplete, busy, boss = false }) {
  const done = Boolean(quest.completed);
  return <button type="button" onClick={() => onComplete(quest)} disabled={done || busy} className={`quest-item${done ? ' is-done' : ''}${boss ? ' is-boss' : ''}`} aria-label={`${done ? 'Completed' : 'Complete'} quest: ${quest.title}`}>
    <span className={`quest-check${done ? ' is-done' : ''}`} aria-hidden="true">{done ? <Check size={15} /> : busy ? <span className="quest-loader" /> : <Circle size={18} />}</span>
    <span className="quest-item-icon" aria-hidden="true">{quest.icon || '🌱'}</span>
    <span className="quest-item-copy"><strong>{quest.title}</strong><small>{quest.description}</small></span>
    <span className="quest-reward"><Zap size={11} /> +{quest.xp_reward}<small>XP</small></span>
  </button>;
}
