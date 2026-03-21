import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import XPNotification from '../components/XPNotification';
import { Utensils, Plus, Trash2, Search, Target } from 'lucide-react';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '🍱', dinner: '🌙', snack: '🍎' };

export default function DietTracker() {
  const [dietData, setDietData] = useState({ meals: [], totals: {}, goal_calories: 1800 });
  const [foods, setFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [xpNotif, setXpNotif] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [mealType, setMealType] = useState('lunch');
  const [quantity, setQuantity] = useState(1);

  const loadDiet = useCallback(async () => {
    const data = await api.getMeals();
    setDietData(data);
  }, []);

  useEffect(() => { loadDiet().catch(console.error); }, [loadDiet]);

  const searchFoods = useCallback(async (q) => {
    const results = await api.getFoods(q);
    setFoods(results);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchFoods(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery, searchFoods]);

  useEffect(() => {
    if (showAdd) searchFoods('').catch(console.error);
  }, [showAdd, searchFoods]);

  const logMeal = async () => {
    if (!selectedFood) return;
    try {
      const result = await api.logMeal({
        food_name: selectedFood.name,
        calories: Math.round(selectedFood.calories * quantity),
        protein: parseFloat((selectedFood.protein * quantity).toFixed(1)),
        carbs: parseFloat((selectedFood.carbs * quantity).toFixed(1)),
        fat: parseFloat((selectedFood.fat * quantity).toFixed(1)),
        quantity,
        unit: selectedFood.unit,
        meal_type: mealType,
      });
      if (result.xp_result) setXpNotif(result.xp_result);
      setSelectedFood(null);
      setSearchQuery('');
      setQuantity(1);
      setShowAdd(false);
      await loadDiet();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteMeal = async (id) => {
    await api.deleteMeal(id);
    await loadDiet();
  };

  const { totals, goal_calories } = dietData;
  const caloriePct = Math.min((totals.calories || 0) / goal_calories * 100, 100);
  const overGoal = (totals.calories || 0) > goal_calories;

  // Group meals by type
  const mealsByType = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = dietData.meals.filter(m => m.meal_type === type);
    return acc;
  }, {});

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {xpNotif && <XPNotification xpResult={xpNotif} onDone={() => setXpNotif(null)} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Utensils size={24} className="text-cyan-400" />
          <div>
            <h1 className="text-2xl font-black text-white">Diet Tracker</h1>
            <p className="text-gray-500 text-sm">Fuel the player. Win the game.</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-2 rounded-lg text-sm font-bold text-black flex items-center gap-1"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)' }}>
          <Plus size={16} /> Log Meal
        </button>
      </div>

      {/* Calorie dashboard */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono" style={{ color: overGoal ? '#f87171' : '#00d4ff' }}>
                {totals.calories || 0}
              </span>
              <span className="text-gray-500 text-sm">/ {goal_calories} kcal</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {overGoal
                ? <span className="text-red-400">⚠️ {(totals.calories || 0) - goal_calories} over goal</span>
                : <span className="text-green-400">✓ {goal_calories - (totals.calories || 0)} remaining</span>
              }
            </div>
          </div>
          <Target size={24} className="text-gray-600" />
        </div>

        {/* Calorie bar */}
        <div className="xp-bar mb-4" style={{ height: '12px' }}>
          <div className="h-full rounded transition-all duration-700"
            style={{
              width: `${caloriePct}%`,
              background: overGoal
                ? 'linear-gradient(90deg, #f87171, #ef4444)'
                : 'linear-gradient(90deg, #7c3aed, #00d4ff)',
            }} />
        </div>

        {/* Macros */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Protein', value: totals.protein, color: '#60a5fa', icon: '💪', goal: 150 },
            { label: 'Carbs', value: totals.carbs, color: '#fbbf24', icon: '⚡', goal: 200 },
            { label: 'Fat', value: totals.fat, color: '#f87171', icon: '🔥', goal: 60 },
          ].map(({ label, value, color, icon, goal }) => (
            <div key={label} className="text-center p-3 rounded-lg" style={{ background: '#13132d' }}>
              <div className="text-xs text-gray-500 mb-1">{icon} {label}</div>
              <div className="text-lg font-bold font-mono" style={{ color }}>{value || 0}g</div>
              <div className="mt-1 stat-bar">
                <div className="h-full rounded transition-all duration-700"
                  style={{ width: `${Math.min(((value || 0) / goal) * 100, 100)}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add meal form */}
      {showAdd && (
        <div className="card space-y-4">
          <h3 className="text-sm font-bold text-gray-400 tracking-wider">LOG A MEAL</h3>

          {/* Meal type */}
          <div className="flex gap-2">
            {MEAL_TYPES.map(type => (
              <button key={type} onClick={() => setMealType(type)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  mealType === type ? 'text-white' : 'text-gray-500 border border-gray-800'
                }`}
                style={mealType === type ? { background: 'linear-gradient(135deg, #7c3aed55, #00d4ff22)', border: '1px solid #00d4ff44' } : {}}>
                {MEAL_ICONS[type]} {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search food (dal, paneer, egg...)"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-white text-sm outline-none"
              style={{ background: '#13132d', border: '1px solid #1a1a3e' }}
            />
          </div>

          {/* Food list */}
          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg" style={{ border: '1px solid #1a1a3e' }}>
            {foods.map((food, i) => (
              <div key={i} onClick={() => setSelectedFood(food)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all text-sm ${
                  selectedFood?.name === food.name
                    ? 'bg-cyan-400/10 border-l-2 border-cyan-400'
                    : 'hover:bg-white/5'
                }`}>
                <span className={selectedFood?.name === food.name ? 'text-cyan-400' : 'text-gray-300'}>{food.name}</span>
                <span className="text-gray-600 text-xs font-mono">{food.calories} kcal</span>
              </div>
            ))}
          </div>

          {selectedFood && (
            <div className="p-3 rounded-lg space-y-3" style={{ background: '#00d4ff08', border: '1px solid #00d4ff22' }}>
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">{selectedFood.name}</span>
                <span className="text-xs text-gray-500">{selectedFood.unit}</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-500">Quantity:</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={quantity}
                  onChange={e => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-20 px-2 py-1 rounded text-white text-sm outline-none text-center"
                  style={{ background: '#13132d', border: '1px solid #1a1a3e' }}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <div className="text-cyan-400 font-mono font-bold">{Math.round(selectedFood.calories * quantity)}</div>
                  <div className="text-gray-600">kcal</div>
                </div>
                <div>
                  <div className="text-blue-400 font-mono font-bold">{(selectedFood.protein * quantity).toFixed(1)}g</div>
                  <div className="text-gray-600">protein</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-mono font-bold">{(selectedFood.carbs * quantity).toFixed(1)}g</div>
                  <div className="text-gray-600">carbs</div>
                </div>
                <div>
                  <div className="text-red-400 font-mono font-bold">{(selectedFood.fat * quantity).toFixed(1)}g</div>
                  <div className="text-gray-600">fat</div>
                </div>
              </div>

              <button onClick={logMeal}
                className="w-full py-2 rounded-lg text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #00d4ff)' }}>
                LOG MEAL +5 XP
              </button>
            </div>
          )}
        </div>
      )}

      {/* Meals by type */}
      <div className="space-y-4">
        {MEAL_TYPES.map(type => {
          const meals = mealsByType[type];
          if (meals.length === 0) return null;
          const typeTotal = meals.reduce((s, m) => s + m.calories, 0);

          return (
            <div key={type} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-300 capitalize flex items-center gap-2">
                  {MEAL_ICONS[type]} {type}
                </h3>
                <span className="text-xs text-gray-500 font-mono">{typeTotal} kcal</span>
              </div>
              <div className="space-y-1.5">
                {meals.map(meal => (
                  <div key={meal.id} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                    style={{ background: '#13132d' }}>
                    <span className="flex-1 text-gray-300">{meal.food_name}</span>
                    <div className="text-xs text-gray-600 font-mono space-x-2">
                      <span className="text-cyan-400">{meal.calories}kcal</span>
                      <span>P:{meal.protein}g</span>
                    </div>
                    <button onClick={() => deleteMeal(meal.id)} className="text-gray-700 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {dietData.meals.length === 0 && (
          <div className="card text-center py-10 text-gray-600">
            <Utensils size={32} className="mx-auto mb-3 opacity-30" />
            <p>No meals logged today. Log your first meal.</p>
          </div>
        )}
      </div>
    </div>
  );
}
