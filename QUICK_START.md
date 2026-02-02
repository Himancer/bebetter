# BeBetter Quick Start Card

## 🚀 5-Minute Local Run

### Terminal 1: Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python seed_db.py
uvicorn app.main:app --reload --port 8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```

**Test**: http://localhost:3000/register

---

## 📁 File Map (What Does What)

| File | Purpose |
|------|---------|
| `backend/app/nutrition.py` | Calorie & macro calculator |
| `backend/app/routers/food_scan.py` | Food detection pipeline |
| `backend/app/routers/ai_chat.py` | BetterMe coach logic |
| `backend/seed_db.py` | Populate foods table |
| `frontend/pages/dashboard.js` | Main dashboard |
| `frontend/pages/food-scan.js` | Camera + upload UI |
| `frontend/pages/ai-chat.js` | Chat with AI |

---

## 🔑 Key Concepts

### Nutrition Engine
- **Input**: Age, height, weight, gender, goal, activity level
- **Output**: Daily calories, protein, carbs, fat targets
- **Formula**: Mifflin-St Jeor (BMR) × Activity multiplier × Goal adjustment
- **File**: `backend/app/nutrition.py`

### Food Scan
- **Step 1**: Upload image
- **Step 2**: AI detects food items (rice, chicken, etc.)
- **Step 3**: User picks portion size (small/medium/large)
- **Step 4**: Backend calculates nutrition
- **File**: `backend/app/routers/food_scan.py`

### BetterMe Coach
- **Input**: User's goal, recent meals, workouts, BMI
- **Output**: Personalized fitness advice
- **Limit**: 10 messages/day per user
- **File**: `backend/app/routers/ai_chat.py`

---

## 🛠️ Common Tasks

### Add a new food
Edit `backend/app/seed_data.py` and add to `FOODS_DATA`:
```python
{"name": "salmon", "calories_100g": 206, "protein_100g": 22, ...}
```
Run: `python backend/seed_db.py`

### Change nutrition targets
Edit `backend/app/nutrition.py`:
- Protein multiplier (currently 1.6g/kg)
- Calorie deficit/surplus (currently 15% / 10%)

### Improve AI coaching
Edit `backend/app/routers/ai_chat.py`:
- Replace `rule_based_reply()` with LLM call (OpenAI)
- Add more context rules

### Integrate real food detection
Replace in `backend/app/routers/food_scan.py`:
```python
def mock_detect_foods(filename):
    # Current: filename heuristic
    # TODO: Use YOLOv8 or Google Vision API
```

---

## 🌐 Deployment in 3 Steps

1. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "Initial"
   git remote add origin https://github.com/username/bebetter.git
   git push -u origin main
   ```

2. **Deploy backend** (Render):
   - Go to render.com
   - New Web Service → select GitHub repo
   - Set DATABASE_URL and BEBETTER_SECRET
   - Deploy

3. **Deploy frontend** (Vercel):
   - Go to vercel.com
   - Import GitHub repo
   - Set NEXT_PUBLIC_API_URL = your Render URL
   - Deploy

**See**: `DEPLOYMENT.md` for full steps

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "ModuleNotFoundError" | `pip install -r backend/requirements.txt` |
| Port 8000 in use | `lsof -i :8000` then `kill -9 <PID>` |
| Frontend won't load API | Check `NEXT_PUBLIC_API_URL` env var |
| Database not found | Run `python backend/seed_db.py` |
| "Permission denied" | Use `python -m venv` not `venv` directly |

---

## 📊 Database Structure (Simplified)

```
USERS
  ├─ id, name, email, password_hash
  ├─ age, gender, height_cm, weight_kg
  └─ goal, activity_level

FOODS
  ├─ id, name
  └─ calories_100g, protein_100g, carbs_100g, fat_100g, ...

FOOD_SCAN_LOGS
  ├─ user_id → USERS
  ├─ image_url (in Cloudinary, not DB)
  └─ total_calories, protein, carbs, fat

WORKOUT_LOGS
  ├─ user_id → USERS
  └─ duration, calories_burned

AI_CHATS
  ├─ user_id → USERS
  ├─ role (user / assistant)
  └─ message
```

---

## 🎯 Success Checklist

- [ ] Backend runs at http://localhost:8000
- [ ] Frontend runs at http://localhost:3000
- [ ] Can register a user
- [ ] Can login
- [ ] Dashboard shows BMI and calorie targets
- [ ] Can upload food image and see detection
- [ ] Can chat with BetterMe
- [ ] Tests pass: `pytest backend/tests/`

---

## 📚 Further Reading

- `README.md` — Full documentation
- `SYSTEM_GUIDE.md` — Architecture & design
- `DEPLOYMENT.md` — Cloud hosting guide
- `backend/app/nutrition.py` — Algorithm details
- `backend/tests/test_nutrition.py` — Examples

---

## 💡 Pro Tips

1. **Use SQLite for dev**: `DATABASE_URL=sqlite:///./bebetter.db`
2. **Test locally before deploying**: Full register → food scan → AI chat flow
3. **Monitor logs**: `tail -f backend.log` or check Render dashboard
4. **Seed data is your friend**: Run `python seed_db.py` often
5. **Frontend API URL**: Keep it in `.env` for easy switching between local/prod

---

## 🚨 Important Notes

- ⚠️ Food detection is **estimation**, not exact (±10%)
- ⚠️ BetterMe never diagnoses diseases or prescribes medicine
- ⚠️ Images stored in **Cloudinary**, not database
- ⚠️ Change `BEBETTER_SECRET` in production
- ⚠️ Rate-limit: 10 AI messages/day per user

---

## Next Big Features

1. Real food detection (YOLOv8 + Google Vision)
2. LLM coach (OpenAI GPT-4)
3. Exercise library with videos
4. Progress charts (weight, calories, macros)
5. React Native mobile app

---

Good luck! 🎉 Reach out if stuck!
