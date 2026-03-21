#!/bin/bash
# Build script for Render deployment

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Install backend deps
cd backend
pip install -r requirements.txt
pip install gunicorn
