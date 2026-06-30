# beBetter 💪

> **1% Better Everyday** — a gamified, AI-coached fitness tracker that turns getting in shape into an RPG.

![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_LLM-F55036?style=flat&logo=groq&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite_/_Postgres-003B57?style=flat&logo=sqlite&logoColor=white)

## 🎯 What it does

beBetter reframes fitness as a role-playing game. You log your **workouts, meals, and weight**, and every action earns **XP** that levels you up and raises your **rank (E → S)**. Daily **quests** auto-generate and complete themselves as you hit your goals, and a streak system keeps you consistent. An **AI coach** — powered by Groq's Llama 3 — gives you tough-love motivation when you need a push.

> _Demo: deploying to Render — live link coming soon._

## ✨ Features

- 🎮 **RPG progression** — XP on every action, levels (`level = 1 + total_xp // 100`), and E→S ranks
- ⚔️ **Daily quests** — auto-generated each day; complete automatically when you log the matching activity
- 🔥 **Streak tracking** — IST-timezone-aware daily streaks
- 🏋️ **Workout logger** — workouts with sets/reps/weight per exercise and XP rewards
- 🥗 **Diet tracker** — searchable food database with calories and macro breakdown
- ⚖️ **Weight tracker** — log weight over time with milestone tracking and charts
- 🤖 **AI coach** — Groq Llama 3 chatbot with a tough-love motivational persona
- 🔐 **JWT auth** — register/login with hashed passwords (werkzeug) and protected API routes

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-CORS |
| Auth | PyJWT (HS256), werkzeug password hashing |
| Database | SQLite (local) · PostgreSQL (production) |
| AI | Groq API — `llama3-8b-8192` |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Recharts |
| Deploy | Render (single service via `render.yaml`), Gunicorn |

## 🏗️ Architecture

A single Flask app serves both the JSON API (`/api/*`) and the built React SPA
(`frontend/dist`). The frontend talks to the backend through a relative `/api`
base, so everything runs from one origin — simple to host and deploy.

```
frontend (React + Vite)  ──build──>  frontend/dist
                                          │  served as static by Flask
backend (Flask)  ──/api/*──>  blueprints: auth, player, weight, workout, diet, quest, chat
                                          │
                              SQLAlchemy  ──>  SQLite (dev) / PostgreSQL (prod)
```

## 🚀 Run locally

**Requirements:** Python **3.11 or 3.12** recommended, Node 18+.
> Note: `psycopg2-binary` (used for Postgres in production) has no prebuilt wheel
> for Python 3.14 yet. For a purely local SQLite run you can skip it — the app
> automatically falls back to SQLite when `DATABASE_URL` is unset.

```bash
# 1) Backend
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows  (use: source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt   # on Python 3.14, install without psycopg2-binary
python app.py                     # API + served frontend at http://localhost:5000

# 2) Frontend (separate terminal) — dev mode with hot reload
cd frontend
npm install
npm run dev                       # http://localhost:3000, proxies /api to :5000

# --- OR a single production-style server ---
cd frontend && npm install && npm run build   # outputs frontend/dist
cd ../backend && python app.py                 # Flask serves the SPA at http://localhost:5000
```

To enable the AI coach, set a free Groq key:
```bash
# PowerShell
$env:GROQ_API_KEY = "gsk_your_key_here"
```
Without it, the app runs fine — the chatbot just returns a "key missing" placeholder.

## ⚙️ Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROQ_API_KEY` | for AI chat | Groq API key — [console.groq.com/keys](https://console.groq.com/keys) |
| `SECRET_KEY` | **in production** | JWT signing secret. Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | production | PostgreSQL URL. Unset → local SQLite |

See [`backend/.env.example`](backend/.env.example).

## ☁️ Deploy (Render)

`render.yaml` is a one-shot blueprint: it provisions a free PostgreSQL database,
wires `DATABASE_URL`, auto-generates `SECRET_KEY`, and builds + serves the app.

1. Push this repo to GitHub
2. On Render → **New → Blueprint**, point it at the repo
3. Set **`GROQ_API_KEY`** in the dashboard (the only manual env var)
4. Deploy — Render builds the frontend, installs the backend, and runs Gunicorn

## 🗺️ Roadmap

- [x] Core gamification engine (XP, levels, ranks, streaks, quests)
- [x] Workout / diet / weight tracking with charts
- [x] JWT auth + AI coach (Groq Llama 3)
- [ ] Live public demo on Render
- [ ] Social features (friends, leaderboards)
- [ ] Mobile-responsive polish

## 👤 Author

**Himanshu Pandey**
- GitHub: [@Himancer](https://github.com/Himancer)
- LinkedIn: [himanshu-pandey](https://www.linkedin.com/in/himanshu-pandey-053660200)
- Portfolio: [himanshu-portfolio-website-sr22.vercel.app](https://himanshu-portfolio-website-sr22.vercel.app)
