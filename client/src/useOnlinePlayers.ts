import { useState, useEffect } from 'react';
import { BASE_PATH } from './config';

export function useOnlinePlayers(playerName: string) {
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/players/online`);
        const data = await res.json();
        if (!cancelled) {
          setPlayers((data.players ?? []).filter((n: string) => n !== playerName));
        }
      } catch {
        // ignore
      }
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [playerName]);

  return players;
}
