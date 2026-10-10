import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Scale, Dumbbell, Utensils, Scroll, LogOut, Sparkles, Compass } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/future-self', label: 'Future Self', icon: Compass },
  { to: '/workout', label: 'Training', icon: Dumbbell },
  { to: '/diet', label: 'Nutrition', icon: Utensils },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/quests', label: 'Quests', icon: Scroll },
];
export default function Navbar() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const itemClass = ({ isActive }) => isActive ? 'active' : '';
  return <>
    <nav className="system-sidebar hidden md:flex flex-col">
      <div className="system-brand"><span className="brand-mark"><Sparkles size={19} /></span><div><div className="brand-title">beBetter</div><div className="brand-subtitle">Your personal growth system</div></div></div>
      <div className="system-nav">{ITEMS.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={itemClass}>{React.createElement(Icon, { size: 17 })}{label}</NavLink>)}</div>
      <div className="sidebar-bottom"><div className="sidebar-quote">Small actions. Honest progress. A stronger version of you.</div><button type="button" onClick={logout} className="logout-button"><LogOut size={15} /> Sign out</button></div>
    </nav>
    <nav className="mobile-nav md:hidden" aria-label="Main navigation"><div className="mobile-nav-inner">
      {ITEMS.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} className={itemClass} aria-label={label}>{React.createElement(Icon, { size: 19 })}<span>{label}</span></NavLink>)}
      <button type="button" onClick={logout} aria-label="Sign out"><LogOut size={18} /><span>Exit</span></button>
    </div></nav>
  </>;
}
