import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import XPNotification from '../components/XPNotification';
import { Dumbbell, Plus, Trash2, CheckCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';

function DungeonClearBanner({ workout, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
      <div className="text-center dungeon-clear p-8 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #7c3aed22, #00d4ff22)', border: '2px solid #00d4ff', boxShadow: '0 0 60px #00d4ff33' }}>
        <div className="text-6xl mb-3">⚔️</div>
        <div className="text-3xl font-black text-white font-mono mb-1">DUNGEON CLEARED!</div>
        <div className="text-cyan-400 text-lg">{workout?.name}</div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Zap size={18} className="text-yellow-400" />
          <span className="text-yellow-400 font-bold font-mono text-xl">+{workout?.xp_earned} XP</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkoutLogger() {
  const [workouts, setWorkouts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [xpNotif, setXpNotif] = useState(null);
  const [dungeonClear, setDungeonClear] = useState(null);

  const [newWorkout, setNewWorkout] = useState({ name: '', duration_minutes: 0, notes: '', exercises: [] });
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: 10, weight_kg: 0 });

  useEffect(() => {
    loadData().catch(console.error);
    api.getTemplates().then(setTemplates).catch(console.error);
  }, []);

  const loadData = async () => {
    const data = await api.getWorkouts(20);
    setWorkouts(data);
  };

  const addExercise = () => {
    if (!newExercise.name) return;
    setNewWorkout(prev => ({ ...prev, exercises: [...prev.exercises, { ...newExercise }] }));
    setNewExercise({ name: '', sets: 3, reps: 10, weight_kg: 0 });
  };

  const removeExercise = (idx) => {
    setNewWorkout(prev => ({ ...prev, exercises: prev.exercises.filter((_, i) => i !== idx) }));
  };

  const createWorkout = async () => {
    if (!newWorkout.name) return;
    const created = await api.createWorkout(newWorkout);
    setWorkouts(prev => [created, ...prev]);
    setNewWorkout({ name: '', duration_minutes: 0, notes: '', exercises: [] });
    setShowNew(false);
  };

  const loadTemplate = (template) => {
    setNewWorkout({ name: template.name, duration_minutes: 60, notes: '', exercises: [...template.exercises] });
    setShowTemplates(false);
    setShowNew(true);
  };

  const completeWorkout = async (workout) => {
    const duration = workout.duration_minutes || parseInt(prompt('Duration (minutes)?') || '45');
    const result = await api.updateWorkout(workout.id, { completed: true, duration_minutes: duration });
    if (result.xp_result) {
      setDungeonClear({ ...result, xp_earned: result.xp_earned || result.xp_result?.xp_gained });
      setXpNotif(result.xp_result);
    }
    await loadData();
  };

  const deleteWorkout = async (id) => {
    if (!confirm('Abandon this dungeon?')) return;
    await api.deleteWorkout(id);
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {xpNotif && !dungeonClear && <XPNotification xpResult={xpNotif} onDone={() => setXpNotif(null)} />}
      {dungeonClear && (
        <DungeonClearBanner
          workout={dungeonClear}
          onDone={() => { setDungeonClear(null); setXpNotif(null); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell size={24} className="text-cyan-400" />
          <div>
            <h1 className="text-2xl font-black text-white">Dungeon Logger</h1>
            <p className="text-gray-500 text-sm">Enter. Train. Clear.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-2 rounded-lg text-sm text-gray-300 border border-gray-700 hover:border-gray-600 transition-colors">
            Templates
          </button>
          <button onClick={() => setShowNew(!showNew)}
            className="px-3 py-2 rounded-lg text-sm font-bold text-black flex items-center gap-1"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)' }}>
            <Plus size={16} /> New Dungeon
          </button>
        </div>
      </div>

      {/* Templates */}
      {showTemplates && (
        <div className="card space-y-2">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider mb-3">PRE-BUILT DUNGEONS</h3>
          {templates.map((t, i) => (
            <div key={i} onClick={() => loadTemplate(t)}
              className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-white/5 border border-gray-800 hover:border-gray-700 transition-all">
              <span className="text-white text-sm">{t.name}</span>
              <span className="text-gray-500 text-xs">{t.exercises.length} exercises</span>
            </div>
          ))}
        </div>
      )}

      {/* New workout form */}
      {showNew && (
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider">NEW DUNGEON</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Dungeon Name</label>
              <input value={newWorkout.name} onChange={e => setNewWorkout(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Push Day" className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Duration (min)</label>
              <input type="number" value={newWorkout.duration_minutes}
                onChange={e => setNewWorkout(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg text-white text-sm outline-none"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }} />
            </div>
          </div>

          {/* Exercises */}
          <div>
            <div className="text-xs text-gray-500 mb-2 tracking-wider">EXERCISES</div>
            <div className="space-y-2 mb-3">
              {newWorkout.exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg text-sm"
                  style={{ background: '#13132d', border: '1px solid #1a1a3e' }}>
                  <span className="flex-1 text-white">{ex.name}</span>
                  <span className="text-gray-500 font-mono text-xs">{ex.sets}×{ex.reps} {ex.weight_kg > 0 ? `@ ${ex.weight_kg}kg` : ''}</span>
                  <button onClick={() => removeExercise(i)} className="text-gray-700 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add exercise */}
            <div className="grid grid-cols-4 gap-2">
              <input value={newExercise.name} onChange={e => setNewExercise(p => ({ ...p, name: e.target.value }))}
                placeholder="Exercise name" onKeyDown={e => e.key === 'Enter' && addExercise()}
                className="col-span-4 md:col-span-2 px-3 py-2 rounded-lg text-white text-sm outline-none"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }} />
              <input type="number" value={newExercise.sets} onChange={e => setNewExercise(p => ({ ...p, sets: parseInt(e.target.value) || 1 }))}
                placeholder="Sets" className="px-3 py-2 rounded-lg text-white text-sm outline-none text-center"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }} />
              <input type="number" value={newExercise.reps} onChange={e => setNewExercise(p => ({ ...p, reps: parseInt(e.target.value) || 1 }))}
                placeholder="Reps" className="px-3 py-2 rounded-lg text-white text-sm outline-none text-center"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }} />
              <input type="number" step="0.5" value={newExercise.weight_kg} onChange={e => setNewExercise(p => ({ ...p, weight_kg: parseFloat(e.target.value) || 0 }))}
                placeholder="kg" className="px-3 py-2 rounded-lg text-white text-sm outline-none text-center"
                style={{ background: '#13132d', border: '1px solid #1a1a3e' }} />
              <button onClick={addExercise}
                className="px-3 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-80"
                style={{ background: '#1a1a3e', border: '1px solid #7c3aed44', color: '#a78bfa' }}>
                + Add
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={createWorkout} disabled={!newWorkout.name}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)' }}>
              ENTER DUNGEON
            </button>
            <button onClick={() => setShowNew(false)}
              className="px-4 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-800">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workout list */}
      <div className="space-y-3">
        {workouts.length === 0 && (
          <div className="card text-center py-10 text-gray-600">
            <Dumbbell size={32} className="mx-auto mb-3 opacity-30" />
            <p>No dungeons entered yet. Create your first workout.</p>
          </div>
        )}
        {workouts.map(workout => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            onComplete={completeWorkout}
            onDelete={deleteWorkout}
          />
        ))}
      </div>
    </div>
  );
}

function WorkoutCard({ workout, onComplete, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`card transition-all ${workout.completed ? 'opacity-80' : ''}`}
      style={workout.completed ? { borderColor: '#00ff8833' } : {}}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {workout.completed
            ? <CheckCircle size={22} className="text-green-400" />
            : <div className="w-5 h-5 rounded border-2 border-gray-700" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium">{workout.name}</span>
            {workout.completed && (
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: '#00ff8822', color: '#00ff88' }}>
                CLEARED
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {workout.date} · {workout.exercises.length} exercises
            {workout.duration_minutes > 0 && ` · ${workout.duration_minutes}min`}
            {workout.completed && workout.xp_earned > 0 && (
              <span className="text-yellow-500 ml-2">+{workout.xp_earned} XP</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!workout.completed && (
            <button onClick={() => onComplete(workout)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)' }}>
              CLEAR ⚔️
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} className="text-gray-600 hover:text-gray-400 p-1">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onDelete(workout.id)} className="text-gray-700 hover:text-red-400 p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && workout.exercises.length > 0 && (
        <div className="mt-3 space-y-1.5 pt-3 border-t border-gray-800">
          {workout.exercises.map(ex => (
            <div key={ex.id} className="flex items-center gap-3 text-sm px-2 py-1.5 rounded"
              style={{ background: '#13132d' }}>
              <span className="flex-1 text-gray-300">{ex.name}</span>
              <span className="text-cyan-400 font-mono text-xs">{ex.sets} × {ex.reps}</span>
              {ex.weight_kg > 0 && (
                <span className="text-purple-400 font-mono text-xs">@ {ex.weight_kg}kg</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
