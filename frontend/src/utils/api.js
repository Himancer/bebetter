const BASE = '/api';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  // Player
  getPlayer: () => req('GET', '/player'),
  updatePlayer: (data) => req('PUT', '/player', data),
  getStats: () => req('GET', '/player/stats'),
  updateStreak: () => req('POST', '/player/streak'),

  // Weight
  getWeightLogs: (limit = 30) => req('GET', `/weight?limit=${limit}`),
  getTodayWeight: () => req('GET', '/weight/today'),
  logWeight: (data) => req('POST', '/weight', data),
  deleteWeight: (id) => req('DELETE', `/weight/${id}`),
  getWeightMilestones: () => req('GET', '/weight/milestones'),

  // Workout
  getWorkouts: (limit = 20) => req('GET', `/workout?limit=${limit}`),
  getTodayWorkouts: () => req('GET', '/workout/today'),
  getTemplates: () => req('GET', '/workout/templates'),
  createWorkout: (data) => req('POST', '/workout', data),
  updateWorkout: (id, data) => req('PUT', `/workout/${id}`, data),
  deleteWorkout: (id) => req('DELETE', `/workout/${id}`),
  addExercise: (workoutId, data) => req('POST', `/workout/${workoutId}/exercise`, data),
  deleteExercise: (id) => req('DELETE', `/workout/exercise/${id}`),

  // Diet
  getMeals: (date) => req('GET', `/diet${date ? `?date=${date}` : ''}`),
  logMeal: (data) => req('POST', '/diet', data),
  deleteMeal: (id) => req('DELETE', `/diet/${id}`),
  getFoods: (q) => req('GET', `/diet/foods${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getDietHistory: (limit = 7) => req('GET', `/diet/history?limit=${limit}`),

  // Quests
  getQuests: () => req('GET', '/quest'),
  completeQuest: (id) => req('POST', `/quest/${id}/complete`),

  // Chat
  getChatHistory: () => req('GET', '/chat'),
  sendMessage: (message) => req('POST', '/chat', { message }),
  clearChat: () => req('DELETE', '/chat'),
};
