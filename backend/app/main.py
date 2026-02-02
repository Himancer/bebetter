from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine
from . import models
from .routers import users, foods, food_scan, ai_chat, nutrition, workouts

app = FastAPI(title='BeBetter API')

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # restrict in production
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# create DB tables (dev convenience)
models.Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(foods.router)
app.include_router(food_scan.router)
app.include_router(ai_chat.router)
app.include_router(nutrition.router)
app.include_router(workouts.router)

@app.get('/')
def root():
    return {'service': 'BeBetter', 'status': 'ok'}
