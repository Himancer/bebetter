import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FutureSelfGate from './components/FutureSelfGate';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import AppToolbar from './components/AppToolbar';
import ErrorBoundary from './components/ErrorBoundary';
import './dashboard.css';
import './theme.css';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const WeightTracker = lazy(() => import('./pages/WeightTracker'));
const WorkoutLogger = lazy(() => import('./pages/WorkoutLogger'));
const DietTracker = lazy(() => import('./pages/DietTracker'));
const QuestsPage = lazy(() => import('./pages/QuestsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const FutureSelfPage = lazy(() => import('./pages/FutureSelfPage'));

function isTokenValid(token) {
  if (!token) return false;
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch { return false; }
}
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!isTokenValid(token)) { localStorage.removeItem('token'); return <Navigate to="/login" replace />; }
  return children;
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('bebetter-theme');
    return ['hunter', 'violet', 'ember'].includes(savedTheme) ? savedTheme : 'hunter';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('bebetter-theme', theme);
  }, [theme]);

  return <BrowserRouter><ErrorBoundary><Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--muted)', background: '#0b1117' }}>Loading BeBetter…</div>}>
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/*" element={<ProtectedRoute><div className="app-layout flex min-h-screen"><Navbar /><main className="app-content flex-1 p-4 md:p-6 pb-20 md:pb-6"><AppToolbar theme={theme} onThemeChange={setTheme} /><Routes>
        <Route path="/" element={<FutureSelfGate><Dashboard /></FutureSelfGate>} />
        <Route path="/future-self" element={<FutureSelfPage />} />
        <Route path="/weight" element={<FutureSelfGate><WeightTracker /></FutureSelfGate>} />
        <Route path="/workout" element={<FutureSelfGate><WorkoutLogger /></FutureSelfGate>} />
        <Route path="/diet" element={<FutureSelfGate><DietTracker /></FutureSelfGate>} />
        <Route path="/quests" element={<FutureSelfGate><QuestsPage /></FutureSelfGate>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></main><ChatBot /></div></ProtectedRoute>} />
    </Routes>
  </Suspense></ErrorBoundary></BrowserRouter>;
}
