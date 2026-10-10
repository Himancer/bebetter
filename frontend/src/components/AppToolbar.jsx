import React from 'react';
import { Palette } from 'lucide-react';
import PlayerIdentity from './PlayerIdentity';

const THEMES = [
  { value: 'hunter', label: 'Hunter blue' },
  { value: 'violet', label: 'Eclipse violet' },
  { value: 'ember', label: 'Ember amber' },
];

export default function AppToolbar({ theme, onThemeChange }) {
  return <header className="app-toolbar">
    <label className="theme-picker">
      <Palette size={16} aria-hidden="true" />
      <span className="sr-only">Choose color theme</span>
      <select aria-label="Choose color theme" value={theme} onChange={event => onThemeChange(event.target.value)}>
        {THEMES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
    <PlayerIdentity compact />
  </header>;
}
