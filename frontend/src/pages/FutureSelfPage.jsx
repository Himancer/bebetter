import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Clock3, Compass, RefreshCw, ShieldCheck, Sparkles, Target, UserRound, WandSparkles } from 'lucide-react';
import { api } from '../utils/api';

const AREAS = [
  'Health & energy', 'Career & learning', 'Time & focus', 'Confidence',
  'Relationships', 'Creativity', 'Money habits', 'Mental wellbeing',
];
const EMPTY = {
  vision: '', inspiration: '', focus_areas: [], weekly_hours: 3,
  current_routine: '', constraints: '', coaching_style: 'calm',
  ai_personalization_consent: false,
};
const needsReview = profile => Boolean(profile?.plan_updated_at && Date.now() - Date.parse(profile.plan_updated_at) >= 14 * 86400000);

function errorMessage(error) {
  try { const parsed = JSON.parse(error.message); return parsed.error || parsed.message || error.message; }
  catch { return error.message || 'Something went wrong. Please try again.'; }
}

function PlanView({ profile, notice, reviewDue, onEdit, onRegenerate, generating }) {
  const plan = profile?.plan;
  if (!plan) return <div className="future-panel"><div className="future-empty"><div className="future-icon"><WandSparkles size={22} /></div><h2>Your profile is saved.</h2><p>Generate a plan from your answers and the time you have available.</p><button className="future-primary" onClick={onRegenerate} disabled={generating}>{generating ? 'Building your plan…' : 'Build my plan'} <ArrowRight size={15} /></button></div></div>;

  return <>
    {reviewDue && <div className="future-review-checkin"><div><span className="future-eyebrow"><span className="status-dot" /> TWO-WEEK CHECK-IN</span><h2>Does this plan still fit your real week?</h2><p>Keep the parts that helped, shrink what felt too heavy, and update anything that changed.</p></div><div className="future-plan-actions"><button className="future-secondary" onClick={onEdit}><UserRound size={14} /> Adjust my answers</button><button className="future-secondary" onClick={onRegenerate} disabled={generating}><RefreshCw size={14} /> {generating ? 'Updating…' : 'Review progress'}</button></div></div>}
    <div className="future-plan-hero">
      <div className="future-plan-label"><span className="status-dot" /> {plan.plan_kind === 'ai' ? 'PERSONALIZED PLAN' : 'STARTER PLAN'}</div>
      <h2>The person you’re building toward</h2>
      <p>{plan.future_self}</p>
      <div className="future-timebox"><Clock3 size={16} /><div><span>Realistic planning window</span><strong>{plan.timeline}</strong></div></div>
      {notice && <div className="future-notice" role="status">{notice}</div>}
      <div className="future-plan-actions"><button className="future-secondary" onClick={onEdit}><UserRound size={14} /> Edit your answers</button><button className="future-secondary" onClick={onRegenerate} disabled={generating}><RefreshCw size={14} /> {generating ? 'Updating…' : 'Refresh plan'}</button></div>
    </div>

    <div className="future-plan-grid">
      <section className="future-panel future-wide">
        <div className="future-section-title"><Target size={16} /><div><h3>Milestones to review</h3><p>Signals to look for, not deadlines you have to hit.</p></div></div>
        <div className="future-milestones">{(plan.milestones || []).map((item, index) => <article className="future-milestone" key={`${item.title}-${index}`}><span className="future-step-index">0{index + 1}</span><div><div className="future-milestone-top"><h4>{item.title}</h4><span>{item.timeframe}</span></div><p>{item.evidence}</p><div className="future-first-step"><strong>First step</strong>{item.first_step}</div></div></article>)}</div>
      </section>
      <section className="future-panel">
        <div className="future-section-title"><Compass size={16} /><div><h3>This week</h3><p>Scaled to the time you said you have.</p></div></div>
        <div className="future-rhythm">{(plan.weekly_rhythm || []).map((item, index) => <div className="future-rhythm-row" key={`${item.practice}-${index}`}><span>{item.practice}</span><small>{item.frequency} · {item.minutes} min</small></div>)}</div>
      </section>
      <section className="future-panel">
        <div className="future-section-title"><Sparkles size={16} /><div><h3>When the week gets hard</h3><p>Practical responses for common setbacks.</p></div></div>
        <div className="future-stuck-list">{(plan.when_stuck || []).map((item, index) => <div className="future-stuck" key={`${item.obstacle}-${index}`}><strong>{item.obstacle}</strong><span>{item.response}</span></div>)}</div>
      </section>
      <section className="future-panel future-wide future-quests-panel">
        <div className="future-section-title"><Check size={16} /><div><h3>Your personalized daily quests</h3><p>Small actions based on your focus areas. Complete them from the Quests page.</p></div><Link className="future-quest-link" to="/quests">Open quests <ArrowRight size={13} /></Link></div>
        <div className="future-quest-grid">{(plan.daily_quests || []).map((quest, index) => <div className="future-quest" key={`${quest.title}-${index}`}><span>{quest.icon || '🌱'}</span><div><strong>{quest.title}</strong><small>{quest.description}</small></div><b>+{quest.xp_reward || 20} XP</b></div>)}</div>
      </section>
      <section className="future-assumptions"><ShieldCheck size={15} /><div><strong>How to read this plan</strong><p>{(plan.assumptions || []).join(' ') || 'This is an estimate based on what you shared. It is not a promise or a prediction. Update your profile as your circumstances change.'}</p></div></section>
    </div>
  </>;
}

export default function FutureSelfPage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reviewDue, setReviewDue] = useState(false);

  useEffect(() => {
    api.getFutureSelf().then(({ profile: saved }) => {
      setProfile(saved);
      setReviewDue(needsReview(saved));
      if (saved) setForm({ ...EMPTY, ...saved });
      else setEditing(true);
    }).catch(err => { setError(errorMessage(err)); setEditing(true); }).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const toggleArea = area => update('focus_areas', form.focus_areas.includes(area)
    ? form.focus_areas.filter(item => item !== area)
    : [...form.focus_areas, area]);

  const buildPlan = async () => {
    setError(''); setNotice(''); setGenerating(true);
    try {
      const result = await api.generateFutureSelfPlan();
      setProfile(result.profile);
      setReviewDue(false);
      setForm(current => ({ ...current, ...result.profile }));
      setNotice(result.notice || '');
      setEditing(false);
    } catch (err) { setError(errorMessage(err)); }
    finally { setGenerating(false); }
  };

  const save = async () => {
    setError(''); setNotice(''); setSaving(true);
    try {
      const result = await api.saveFutureSelf(form);
      setProfile(result.profile);
      setForm(current => ({ ...current, ...result.profile }));
      setSaving(false);
      await buildPlan();
    } catch (err) { setError(errorMessage(err)); setSaving(false); }
  };

  if (loading) return <div className="future-self-loading">Preparing your personal growth space…</div>;

  return <div className="future-shell">
    <div className="future-topline"><Link to="/" className="future-back"><ArrowLeft size={14} /> Overview</Link><span className="future-private-note"><ShieldCheck size={13} /> Your profile stays in BeBetter unless you opt in to AI personalization.</span></div>
    <header className="future-header"><div className="future-eyebrow"><span className="status-dot" /> YOUR PERSONAL GROWTH MAP</div><h1>Build toward your <em>next self.</em></h1><p>Describe what better looks like in your life. BeBetter will turn your direction, available time, and real-world constraints into small steps you can review and adjust.</p></header>

    {editing ? <section className="future-form-wrap">
      <div className="future-form-heading"><div className="future-form-progress"><span className={step === 1 ? 'current' : 'complete'}>01</span><i /><span className={step === 2 ? 'current' : ''}>02</span></div><div><h2>{step === 1 ? 'What do you want to grow into?' : 'What is realistic in your life right now?'}</h2><p>{step === 1 ? 'Your description is the direction for your plan, not a promise of who you must become.' : 'The plan should fit the week you actually have, not an imaginary perfect routine.'}</p></div></div>
      {error && <div className="future-error" role="alert">{error}</div>}
      {step === 1 ? <div className="future-panel future-form-panel">
        <label className="future-field"><span>Describe the person you want to become <b>Required</b></span><small>What does a better ordinary Tuesday look like? Include habits, qualities, work, or relationships that matter to you.</small><textarea value={form.vision} onChange={e => update('vision', e.target.value)} placeholder="I want to become someone who…" maxLength={1500} rows={5} /><em>{form.vision.length}/1,500</em></label>
        <label className="future-field"><span>Person or character who inspires you <b>Optional</b></span><small>We’ll use broad traits you admire, not pretend to be an exact replica.</small><input value={form.inspiration} onChange={e => update('inspiration', e.target.value)} placeholder="e.g. a calm, strategic, resilient leader" maxLength={200} /></label>
        <div className="future-field"><span>Where would you like to focus first? <b>Choose up to 5</b></span><div className="future-area-grid">{AREAS.map(area => <button type="button" key={area} onClick={() => toggleArea(area)} className={`future-area-chip ${form.focus_areas.includes(area) ? 'selected' : ''}`}>{form.focus_areas.includes(area) && <Check size={13} />}{area}</button>)}</div></div>
        <div className="future-form-actions"><span>{form.focus_areas.length} selected</span><button className="future-primary" disabled={form.vision.trim().length < 20 || form.focus_areas.length === 0} onClick={() => { setStep(2); setError(''); }}>Continue <ArrowRight size={15} /></button></div>
      </div> : <div className="future-panel future-form-panel">
        <label className="future-field"><span>How much time can you actually set aside each week?</span><div className="future-hours"><input type="range" min="0.5" max="20" step="0.5" value={form.weekly_hours} onChange={e => update('weekly_hours', Number(e.target.value))} /><strong>{form.weekly_hours} hrs / week</strong></div><small>We’ll scale the first steps to this amount. You can change it later.</small></label>
        <label className="future-field"><span>What does your current routine look like? <b>Optional</b></span><small>Share a few details about work, study, sleep, or habits that shape your week.</small><textarea value={form.current_routine} onChange={e => update('current_routine', e.target.value)} placeholder="A normal weekday for me looks like…" maxLength={1000} rows={3} /></label>
        <label className="future-field"><span>What tends to get in the way? <b>Optional</b></span><small>Time, energy, money, access, family commitments, confidence — include only what you’re comfortable sharing.</small><textarea value={form.constraints} onChange={e => update('constraints', e.target.value)} placeholder="Things I need the plan to account for…" maxLength={1000} rows={3} /></label>
        <label className="future-field"><span>How should your coach sound?</span><div className="future-tone-row">{[['calm', 'Calm & thoughtful'], ['direct', 'Direct & clear'], ['warm', 'Warm & encouraging']].map(([value, label]) => <button type="button" key={value} className={`future-tone ${form.coaching_style === value ? 'selected' : ''}`} onClick={() => update('coaching_style', value)}>{label}</button>)}</div></label>
        <label className="future-consent"><input type="checkbox" checked={form.ai_personalization_consent} onChange={e => update('ai_personalization_consent', e.target.checked)} /><span><strong>Allow AI personalization with Groq</strong><small>If selected, BeBetter sends your vision, inspiration, focus areas, routine, constraints, and a limited activity summary to Groq to generate your plan and tailor coach replies. If left unchecked, the app creates a local starter plan and does not send this profile context. You can change this choice by editing your profile.</small></span></label>
        <div className="future-form-actions"><button className="future-secondary" onClick={() => { setStep(1); setError(''); }}><ArrowLeft size={14} /> Back</button><button className="future-primary" disabled={saving || generating} onClick={save}>{saving || generating ? 'Building your plan…' : 'Create my plan'} <Sparkles size={15} /></button></div>
      </div>}
    </section> : <PlanView profile={profile} notice={notice} reviewDue={reviewDue} onEdit={() => { setEditing(true); setStep(1); setError(''); }} onRegenerate={buildPlan} generating={generating} />}
    <div className="future-footnote">Your timeline is an estimate to review, not a guarantee. Completing quests earns in-app XP; life progress depends on many things the app cannot measure.</div>
  </div>;
}
