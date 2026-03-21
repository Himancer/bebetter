import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import Dashboard from './pages/Dashboard';
import WeightTracker from './pages/WeightTracker';
import WorkoutLogger from './pages/WorkoutLogger';
import DietTracker from './pages/DietTracker';
import QuestsPage from './pages/QuestsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ background: '#0a0a1a' }}>
        <Navbar />

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/weight" element={<WeightTracker />} />
            <Route path="/workout" element={<WorkoutLogger />} />
            <Route path="/diet" element={<DietTracker />} />
            <Route path="/quests" element={<QuestsPage />} />
          </Routes>
        </main>

        <ChatBot />
      </div>
    </BrowserRouter>
  );
}
