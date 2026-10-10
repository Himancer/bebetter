import React, { useEffect, useId, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { api } from '../utils/api';

export default function PlayerIdentity({ compact = false }) {
  const inputId = useId();
  const [identity, setIdentity] = useState(null);
  const [editing, setEditing] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    Promise.all([api.getAccount().catch(() => null), api.getPlayer().catch(() => null)]).then(([account, player]) => {
      if (!current) return;
      const savedUsername = localStorage.getItem('username');
      const legacyUsername = player?.name?.trim()?.replace(/\s+/g, '').toLowerCase() || '';
      const profile = {
        username: account?.username || savedUsername || legacyUsername,
        player_name: account?.player_name || player?.name || 'Player',
      };
      setIdentity(profile);
      setPlayerName(profile.player_name);
    });
    return () => { current = false; };
  }, []);

  const startEditing = () => {
    setPlayerName(identity?.player_name || '');
    setError('');
    setEditing(true);
  };

  const saveName = async (event) => {
    event.preventDefault();
    const name = playerName.trim();
    if (!name) {
      setError('Enter a player name.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const player = await api.updatePlayer({ name });
      if (player) setIdentity((current) => ({ ...current, player_name: player.name }));
      setEditing(false);
    } catch {
      setError('Could not save the player name. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const shownName = identity?.player_name || 'Player';
  const initials = shownName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'P';

  return <div className={`player-identity${compact ? ' player-identity-compact' : ''}`}>
    {editing ? <form className="player-identity-edit" onSubmit={saveName}>
      <label htmlFor={inputId}>PLAYER NAME</label>
      <input id={inputId} autoFocus value={playerName} onChange={(event) => setPlayerName(event.target.value)} maxLength={100} />
      <div className="player-identity-edit-actions">
        <button type="button" onClick={() => setEditing(false)} disabled={saving}><X size={13} /> Cancel</button>
        <button type="submit" disabled={saving}><Check size={13} /> {saving ? 'Saving' : 'Save'}</button>
      </div>
      {error && <small className="player-identity-error" role="alert">{error}</small>}
    </form> : <>
      <span className="player-identity-avatar" aria-hidden="true">{initials}</span>
      <span className="player-identity-copy"><small>PLAYER</small><strong>{shownName}</strong><span>@{identity?.username || '…'}</span></span>
      <button type="button" className="player-identity-edit-button" onClick={startEditing} aria-label="Edit player name" title="Edit player name"><Pencil size={14} /></button>
    </>}
  </div>;
}
