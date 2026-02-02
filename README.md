# BeBetter — AI Fitness & Nutrition Tracker

An AI-powered fitness and nutrition tracking app with smart food scanning, personalized targets, and an AI fitness coach.

## ✨ Features

- 📸 **Smart Food Scanning** — Detect food from photos, estimate macros instantly
- 📊 **Nutrition Tracking** — Real-time calorie & macro tracking vs personalized targets
- 💪 **Workout Logging** — Log exercises with automatic calorie burn estimation
- 🤖 **AI Coach (BetterMe)** — Chat for personalized fitness advice (10 msgs/day)
- 📈 **Analytics Dashboard** — Beautiful charts showing weekly progress
- 🔐 **Secure Authentication** — JWT + bcrypt password hashing

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
**API:** http://localhost:8000 | **Docs:** http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
**App:** http://localhost:3000

## 📝 Demo Login
- **Email:** test@example.com
- **Password:** password123

## 🏗️ Tech Stack

| Component | Tech |
|-----------|------|
| Backend | FastAPI, SQLAlchemy, SQLite/PostgreSQL |
| Frontend | Next.js 13, React 18, Tailwind CSS |
| Auth | JWT + bcrypt |
| Database | 9 normalized tables |

## 📂 Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app
│   ├── models.py        # ORM models (9 tables)
│   ├── nutrition.py     # Mifflin-St Jeor algorithm
│   └── routers/         # API endpoints
└── seed_db.py

frontend/
├── pages/               # All pages
├── components/Layout.js # Sidebar navigation
└── styles/globals.css
```

## 💾 Database Schema

- **users** — Accounts with fitness profiles
- **foods** — 30+ nutrition database
- **food_portions** — Portion standards
- **food_scan_logs** — Scan history
- **workout_logs** — Exercise sessions
- **workout_log_items** — Exercise details
- **bmi_logs** — Historical BMI
- **ai_chats** — Chat history
- **exercises** — Exercise database

## 📡 API Endpoints

```
POST /users/register, /users/login
GET  /users/me
GET  /nutrition/targets/{user_id}
GET  /foods, POST /food-scan/upload, /food-scan/estimate
POST /workouts, GET /workouts/{user_id}
POST /ai/chat
```

## 🧮 Nutrition Algorithm

Uses **Mifflin-St Jeor** BMR equation:
- BMR = (10 × weight) + (6.25 × height) - (5 × age) ± 5
- TDEE = BMR × activity_level (1.2–1.9)
- Goal-adjusted: ±500 kcal for loss/gain, maintenance else
- Protein: 1.8–2.2g/kg | Carbs/Fats: balanced ratio

## 🔧 Environment

Create `.env`:
```
DATABASE_URL=sqlite:///./bebetter.db
JWT_SECRET=your-secret-key
```

## 📦 Deployment

**Backend:** Heroku, Railway, AWS
**Frontend:** Vercel, Netlify
**Database:** PostgreSQL (production)

## 🚧 Future Ideas

- Real food detection (YOLO/Vision API)
- LLM BetterMe (GPT-4 integration)
- Mobile app (React Native)
- Meal planning & social features

---

Built for realistic, honest AI practices. No false precision. 🎯
