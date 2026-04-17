import { useState, useEffect } from 'react';
import { BASE_PATH } from './config';

export interface OnlinePlayer {
  name: string;
  picture: string | null;
}

export function useOnlinePlayers(playerName: string) {
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${BASE_PATH}/api/players/online`);
        const data = await res.json();
        if (!cancelled) {
          const raw = data.players ?? [];
          // Back-compat: server may return string[] (legacy) or { name, picture }[]
          const normalized: OnlinePlayer[] = raw.map((p: any) =>
            typeof p === 'string' ? { name: p, picture: null } : { name: p.name, picture: p.picture ?? null }
          );
          setPlayers(normalized.filter((p) => p.name !== playerName));
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
