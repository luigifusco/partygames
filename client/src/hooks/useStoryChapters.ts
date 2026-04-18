import { useEffect, useState } from 'react';
import { BASE_PATH } from '../config';

/**
 * Fetches the set of completed story chapter ids for a player.
 * Used to gate features behind story-mode milestones (e.g. battle-style picker).
 */
export function useStoryChapters(playerId: string | null | undefined): Set<string> {
  return useStoryChaptersStatus(playerId).chapters;
}

/**
 * Like {@link useStoryChapters} but also exposes whether the initial fetch
 * has completed, so callers can avoid flashing "story not complete" UI
 * while the request is still in flight.
 */
export function useStoryChaptersStatus(playerId: string | null | undefined): { chapters: Set<string>; loaded: boolean } {
  const [chapters, setChapters] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!playerId) { setLoaded(true); return; }
    let alive = true;
    setLoaded(false);
    fetch(BASE_PATH + '/api/player/' + playerId + '/story')
      .then(r => r.json())
      .then(data => {
        if (!alive) return;
        setChapters(new Set((data.completed ?? []).map(String)));
        setLoaded(true);
      })
      .catch(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, [playerId]);
  return { chapters, loaded };
}
