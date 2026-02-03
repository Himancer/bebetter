# BeBetter - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Servers Status
✅ **Frontend**: Running on http://localhost:3000
✅ **Backend**: Running on http://localhost:8000

### Demo Credentials
```
Email: demo@bebetter.com
Password: password123
```

---

## 📱 Testing Flow

### Step 1: Home Page (http://localhost:3000)
- See the landing page with app features
- Click "Get Started" or "Login" button

### Step 2: Login (http://localhost:3000/login)
1. Enter email: `demo@bebetter.com`
2. Enter password: `password123`
3. Click "Sign In"
4. You'll be redirected to dashboard

### Step 3: Dashboard (http://localhost:3000/dashboard)
**You should see:**
- ✅ Welcome message with your name
- ✅ 4 stat cards (BMI, Calorie Goal, Protein Target, Workouts)
- ✅ Weekly Calorie Chart (LineChart)
- ✅ Weekly Workout Chart (BarChart)
- ✅ Macro Breakdown (PieChart)
- ✅ Recent Workouts (3 entries)
- ✅ Quick action buttons (Log Meal, Log Workout, Chat)

**Demo Data Shown:**
- BMI: 25.3
- Daily Goal: 2000 kcal
- Protein: 150g/day
- Workouts: 3/week
- Weekly calorie range: 1900-2400 kcal
- Workouts: Chest, Back, Legs with calories burned

### Step 4: Chat with BetterMe AI (http://localhost:3000/ai-chat)
Try asking questions like:
- "How much protein should I eat daily?"
- "What's a good beginner workout routine?"
- "Tips for recovery after workouts?"
- "How to lose weight safely?"
- "What exercises for bigger arms?"
- "Best foods for muscle gain?"

**Expected Response:**
- Fitness-backed answer from BetterMe AI
- Research-based recommendations
- Specific numbers and guidelines

### Step 5: Log Activities
- **Log Meal**: Click button to add food items
- **Log Workout**: Click button to log exercises
- Data syncs with dashboard

---

## 🧪 Testing Checklist

### Authentication ✅
- [ ] Register new account (try it!)
- [ ] Login with demo@bebetter.com
- [ ] Logout and verify redirect to login
- [ ] Refresh page - still logged in (localStorage)

### Dashboard ✅
- [ ] All charts display correctly
- [ ] Data is readable and formatted
- [ ] Stat cards show demo metrics
- [ ] Responsive on mobile view

### BetterMe AI ✅
- [ ] Send message succeeds
- [ ] Get fitness-backed response
- [ ] Message count works (10/day limit)
- [ ] Chat history persists

### Navigation ✅
- [ ] All buttons link to correct pages
- [ ] Back buttons work
- [ ] Nav menu is accessible
- [ ] Links are styled correctly

---

## 📊 Sample Data Included

### Exercises (35 total)
- Bench Press, Dumbbell Press, Incline Press (Chest)
- Barbell Row, Lat Pulldown, Deadlift (Back)
- Squats, Leg Press, Leg Curls (Legs)
- Shoulder Press, Lateral Raises (Shoulders)
- Barbell Curl, Tricep Dips (Arms)
- Treadmill, Cycling, Jump Rope (Cardio)

### Foods (33 total)
- Chicken Breast: 165 cal, 31g protein, 0g carbs, 3.6g fat
- Brown Rice: 111 cal, 3g protein, 23g carbs, 0.9g fat
- Salmon: 208 cal, 20g protein, 0g carbs, 13g fat
- Broccoli: 34 cal, 3g protein, 7g carbs, 0.4g fat
- Eggs: 155 cal, 13g protein, 1g carbs, 11g fat
- ... and 28 more

### Demo User History (7 Days)
**Workouts:**
- Monday: Chest & Triceps - 60 min - 380 kcal
- Wednesday: Back & Biceps - 75 min - 420 kcal
- Friday: Legs - 70 min - 400 kcal

**Daily Calories:**
- Monday: 2100 kcal (100 over goal)
- Tuesday: 1950 kcal
- Wednesday: 2300 kcal
- Thursday: 1850 kcal
- Friday: 2050 kcal
- Saturday: 2400 kcal
- Sunday: 1900 kcal

**Macros Breakdown:**
- Protein: 155g (620 kcal)
- Carbs: 250g (1000 kcal)
- Fat: 70g (630 kcal)
- **Total: 2250 kcal**

---

## 🔧 Troubleshooting

### "Cannot GET /dashboard"
**Fix**: Make sure you're logged in. Login first at http://localhost:3000/login

### Charts not showing
**Fix**: Hard refresh (Ctrl+Shift+R) or clear cache
```javascript
localStorage.clear()
```

### BetterMe not responding
**Fix**: Check backend is running
```bash
# In terminal, navigate to backend
cd backend
python -m uvicorn app.main:app --reload
```

### Page keeps redirecting to login
**Fix**: Check localStorage has token
```javascript
// In browser console:
console.log(localStorage.getItem('token'))
console.log(localStorage.getItem('user'))
```

---

## 📈 API Testing (Optional)

### Test Login via API
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@bebetter.com",
    "password": "password123"
  }'
```

### Get User Profile
```bash
# First get token from login response, then:
curl -X GET "http://localhost:8000/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Send Message to BetterMe
```bash
curl -X POST "http://localhost:8000/ai-chat/message" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "USER_ID",
    "message": "How much protein should I eat?"
  }'
```

### View API Documentation
- Visit: http://localhost:8000/docs
- Interactive Swagger UI with all endpoints
- Try endpoints directly in browser

---

## 🎓 Features Explained

### Daily Message Limit (BetterMe)
- Limit: 10 messages per day per user
- Reset: Every 24 hours
- Reason: Prevent spam/abuse

### Calorie Goal
- Default: 2000 kcal/day
- Customizable per user goal (weight loss/gain/maintenance)
- Dashboard shows consumption vs goal

### Macro Targets
- Protein: 1.8 g/kg body weight
- Carbs: 50-60% of total calories
- Fat: 20-35% of total calories
- Calculated based on user profile

### AI Coach (BetterMe)
- Not connected to internet (runs locally)
- Rule-based responses from knowledge base
- Can be upgraded to use local LLM (Ollama/Llama2)
- 6 knowledge categories:
  1. Workout routines
  2. Nutrition strategies
  3. Recovery optimization
  4. Goal programming
  5. Motivation
  6. General fitness

---

## 🎬 Demo Scenarios

### Scenario 1: New User Journey
1. Go to homepage
2. Click "Get Started"
3. Fill registration form (new credentials)
4. System creates account with default goals
5. Redirect to dashboard
6. Dashboard empty initially
7. Log first meal and workout
8. Dashboard updates with data

### Scenario 2: Existing User
1. Login with demo@bebetter.com
2. See populated dashboard with 7 days history
3. View personalized stats
4. Chat with AI about specific goals
5. Log new meal/workout
6. Data syncs in real-time

### Scenario 3: AI Coaching
1. Go to AI Chat page
2. Ask: "I want to lose weight, what should I do?"
3. BetterMe responds with:
   - Caloric deficit recommendation
   - Protein intake target
   - Workout frequency
   - Food suggestions
4. Ask: "Best exercises for beginners?"
5. Get customized routine based on fitness level

---

## 📞 Need Help?

Check the API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Database**: bebetter.db (SQLite)

---

## 🚀 Ready? Let's Go!

1. Open http://localhost:3000
2. Click "Login"
3. Enter demo credentials
4. Explore the dashboard!
5. Chat with BetterMe AI
6. Try logging activities

**Enjoy your fitness journey with BeBetter! 💪**
