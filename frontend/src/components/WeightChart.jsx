import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Scale, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

const Tip = ({ active, payload, label }) => active && payload?.length ? <div style={{ background: '#111a22', border: '1px solid rgba(114,226,220,.22)', borderRadius: 10, padding: '9px 11px', fontSize: 11 }}><p style={{ color: 'var(--muted)', margin: '0 0 4px' }}>{label}</p><p style={{ color: 'var(--cyan)', fontWeight: 700, margin: 0 }}>{payload[0].value} kg</p></div> : null;

export default function WeightChart({ compact = false }) {
  const [data, setData] = useState([]), [milestones, setMilestones] = useState(null), [failed, setFailed] = useState(false);
  useEffect(() => {
    Promise.all([api.getWeightLogs(30), api.getWeightMilestones()])
      .then(([logs, ms]) => { setData((logs || []).map(l => ({ date: l.date.slice(5), weight: l.weight }))); setMilestones(ms); })
      .catch(e => { console.error(e); setFailed(true); });
  }, []);
  if (failed) return <div className="chart-empty" role="status"><div><Scale className="chart-empty-icon" size={21} /><div className="chart-empty-title">History could not load</div><div className="chart-empty-copy">Check your connection, then open the tracker to try again.</div><Link to="/weight" className="panel-link">Open weight tracker <ArrowRight size={12} /></Link></div></div>;
  if (!data.length) return <div className="chart-empty"><div><Scale className="chart-empty-icon" size={21} /><div className="chart-empty-title">Your story starts with one entry</div><div className="chart-empty-copy">Track weight only if it supports your goals. You can also use BeBetter without it.</div><Link to="/weight" className="action-secondary" style={{ minHeight: 35, fontSize: 10 }}>Add an entry <ArrowRight size={12} /></Link></div></div>;
  const goal = milestones?.goal_weight;
  return <div className="space-y-4">
    {milestones && <div className="weight-summary">
      <div className="weight-summary-cell"><div className="weight-summary-value">{milestones.start_weight ?? '—'}{milestones.start_weight != null ? ' kg' : ''}</div><div className="weight-summary-label">First log</div></div>
      <div className="weight-summary-cell"><div className="weight-summary-value" style={{ color: 'var(--cyan)' }}>{milestones.current_weight ?? '—'}{milestones.current_weight != null ? ' kg' : ''}</div><div className="weight-summary-label">Latest</div></div>
      <div className="weight-summary-cell"><div className="weight-summary-value">{goal ?? '—'}{goal != null ? ' kg' : ''}</div><div className="weight-summary-label">Your goal</div></div>
    </div>}
    {milestones && (milestones.total_lost != null || milestones.remaining != null) && <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, color: 'var(--muted)', fontSize: 10, marginBottom: 8 }}>
      {milestones.total_lost != null && <span>{milestones.total_lost > 0 ? milestones.total_lost + ' kg down' : milestones.total_lost < 0 ? Math.abs(milestones.total_lost) + ' kg up' : 'No change yet'}</span>}
      {milestones.remaining != null && <span>{milestones.remaining} kg to your goal</span>}
    </div>}
    <div style={{ height: compact ? 160 : 220 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,169,205,.12)" />
      <XAxis dataKey="date" tick={{ fill: '#81909b', fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(190,210,226,.12)' }} />
      <YAxis tick={{ fill: '#8299ab', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
      <Tooltip content={<Tip />} />{goal != null && <ReferenceLine y={goal} stroke="#9b9de0" strokeDasharray="4 4" />}
      <Line type="monotone" dataKey="weight" stroke="#6fc5ef" strokeWidth={2} dot={{ r: 2, fill: '#6fc5ef', strokeWidth: 0 }} activeDot={{ r: 4, fill: '#6fc5ef', stroke: '#080d15', strokeWidth: 2 }} />
    </LineChart></ResponsiveContainer></div>
  </div>;
}
