import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Check, Circle, Crown, Zap, ArrowRight } from 'lucide-react';

export default function QuestBoard({ onXpGain }) {
  const [quests, setQuests] = useState({ daily: [], boss: [], progress: {} });
  const [loading, setLoading] = useState(true), [completing, setCompleting] = useState(null), [error, setError] = useState('');
  const fetchQuests = async () => {
    try { setQuests(await api.getQuests() || { daily: [], boss: [], progress: {} }); setError(''); }
    catch (e) { setError('Missions are temporarily unavailable. Please try again in a moment.'); console.error(e); }
    finally { setLoading(false); }
  };
  // The helper only updates state after its async API request settles.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchQuests(); }, []);
  const complete = async q => {
    if (q.completed || completing) return;
    setCompleting(q.id); setError('');
    try { const result = await api.completeQuest(q.id); await fetchQuests(); if (onXpGain && result?.xp_result) onXpGain(result.xp_result); }
    catch (e) { setError('Could not update this mission. Please try again.'); console.error(e); }
    finally { setCompleting(null); }
  };
  if (loading) return <div className="card panel-card" aria-live="polite"><div className="mission-empty">Preparing your missions…</div></div>;
  const daily = quests.daily || [], boss = quests.boss || [], p = quests.progress || {}, done = p.completed || 0, total = p.total || 0;
  return <div className="card panel-card">
    <div className="panel-title-row"><h3 className="panel-title"><span style={{ color: 'var(--lime)' }}><Zap size={16} /></span> Daily quests</h3><span className="mission-count">{done} / {total} DONE</span></div>
    <div className="xp-bar"><div className="xp-bar-fill" style={{ width: (total ? done / total * 100 : 0) + '%' }} /></div>
    {error && <div className="mission-error" role="status" style={{ marginTop: 12 }}>{error}</div>}
    {daily.length ? <div className="mission-list" style={{ marginTop: 13 }}>{daily.map(q => <QuestItem key={q.id} quest={q} complete={complete} busy={completing === q.id} />)}</div> : <div className="mission-empty">{error ? 'Your missions will appear when the connection returns.' : 'No missions yet. Check back soon for your next small win.'}</div>}
    {boss.length > 0 && <div style={{ marginTop: 16 }}><div className="panel-title" style={{ color: 'var(--amber)', marginBottom: 9 }}><Crown size={14} /> Weekly challenge</div><div className="mission-list">{boss.map(q => <QuestItem key={q.id} quest={q} complete={complete} busy={completing === q.id} />)}</div></div>}
    <div className="mission-progress">Log a workout or weight entry to make progress toward related quests.</div>
    <Link to="/quests" className="panel-link" style={{ display: 'inline-block', marginTop: 13 }}>View quest details <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /></Link>
  </div>;
}
function QuestItem({ quest, complete, busy }) {
  const done = Boolean(quest.completed);
  return <button type="button" onClick={() => complete(quest)} disabled={done || busy} className="mission-item" aria-label={(done ? 'Completed: ' : 'Complete mission: ') + quest.title}>
    <span className={'mission-check' + (done ? ' done' : '')}>{done ? <Check size={17} /> : busy ? <span aria-label="Saving">…</span> : <Circle size={17} />}</span>
    <span className="mission-emoji" aria-hidden="true">{quest.icon || '✦'}</span>
    <span className="mission-copy"><span className="mission-name" style={{ display: 'block', textDecoration: done ? 'line-through' : 'none', opacity: done ? .66 : 1 }}>{quest.title}</span><span className="mission-description" style={{ display: 'block' }}>{quest.description}</span></span>
    <span className="mission-reward"><Zap size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> +{quest.xp_reward}</span>
  </button>;
}
