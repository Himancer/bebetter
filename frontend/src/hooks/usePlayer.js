import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export function usePlayer() {
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState({ STR: 0, VIT: 0, END: 0, INT: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPlayer = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([api.getPlayer(), api.getStats()]);
      setPlayer(p);
      setStats(s);
    } catch (e) {
      console.error('Failed to fetch player', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayer();
    api.updateStreak().catch(() => {});
  }, [fetchPlayer]);

  return { player, stats, loading, refetch: fetchPlayer };
}
