import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Scale, Dumbbell, Utensils, Scroll, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Hub', icon: LayoutDashboard },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/workout', label: 'Dungeon', icon: Dumbbell },
  { to: '/diet', label: 'Diet', icon: Utensils },
  { to: '/quests', label: 'Quests', icon: Scroll },
];

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 min-h-screen border-r border-gray-900 py-6 px-3"
        style={{ background: '#080815' }}>
        <div className="mb-8 px-3">
          <h1 className="text-xl font-black tracking-wider text-glow-blue font-mono" style={{ color: '#00d4ff' }}>
            beBetter
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">Solo Leveling System</p>
        </div>

        <div className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} style={{ color: isActive ? '#00d4ff' : undefined }} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto px-3 space-y-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all text-red-500 hover:text-white hover:bg-red-500/20 font-mono tracking-wider"
            style={{ border: '1px solid #ef444444' }}
          >
            <LogOut size={16} />
            EXIT SYSTEM
          </button>
          <div className="text-xs text-gray-700 font-mono pt-4 border-t border-gray-900">
            <div>1.01^365 = 37.78x</div>
            <div className="text-gray-800">1% daily = 37x better</div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-gray-900 px-2 pb-safe"
        style={{ background: '#080815' }}>
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isActive ? 'text-cyan-400' : 'text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} style={{ color: isActive ? '#00d4ff' : undefined }} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-all text-red-500/70 hover:text-red-500"
          >
            <LogOut size={20} />
            <span>Exit</span>
          </button>
        </div>
      </nav>
    </>
  );
}
