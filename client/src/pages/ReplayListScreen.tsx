import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_PATH } from '../config';
import './ReplayListScreen.css';

interface BattleRow {
  id: string;
  created_at: string;
  field_size: number;
  total_pokemon: number;
  opponent_type: 'pvp' | 'ai' | 'story' | string;
  rounds: number;
  tournament_id: string | null;
  winner_id: string | null;
  loser_id: string | null;
  winner_name: string | null;
  loser_name: string | null;
  winner_elo_delta: number;
  loser_elo_delta: number;
}

function formatWhen(s: string): string {
  try {
    // SQLite CURRENT_TIMESTAMP values are UTC. Append 'Z' if missing.
    const iso = s.includes('T') ? s : s.replace(' ', 'T');
    const z = /[zZ]|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + 'Z';
    const d = new Date(z);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return s; }
}

function modeLabel(b: BattleRow): string {
  const fs = b.field_size || 1;
  const kind = fs === 1 ? 'Singles' : fs === 2 ? 'Doubles' : 'Triples';
  const tp = b.total_pokemon || fs;
  const type = b.opponent_type === 'pvp' ? 'PvP' : b.opponent_type === 'ai' ? 'AI' : b.opponent_type === 'story' ? 'Story' : b.opponent_type;
  return `${type} · ${kind} · ${tp}v${tp}`;
}

export default function ReplayListScreen() {
  const navigate = useNavigate();
  const [battles, setBattles] = useState<BattleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${BASE_PATH}/api/replay/list?limit=100`)
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data) => { if (alive) { setBattles(data.battles || []); setLoading(false); } })
      .catch((e) => { if (alive) { setError(e.message || 'failed'); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  return (
    <div className="replay-screen">
      <div className="replay-header">
        <button className="replay-back" onClick={() => navigate('/play')}>← Back</button>
        <h2>Replays</h2>
      </div>
      {loading && <div className="replay-empty">Loading…</div>}
      {error && <div className="replay-empty replay-error">Couldn't load replays: {error}</div>}
      {!loading && !error && battles.length === 0 && (
        <div className="replay-empty">No battles have been recorded yet.</div>
      )}
      <div className="replay-list">
        {battles.map((b) => (
          <button key={b.id} className="replay-row" onClick={() => navigate(`/replay/${b.id}`)}>
            <div className="replay-row-top">
              <span className="replay-row-when">{formatWhen(b.created_at)}</span>
              <span className="replay-row-mode">{modeLabel(b)}</span>
            </div>
            <div className="replay-row-mid">
              <span className="replay-row-winner">🏆 {b.winner_name ?? 'Unknown'}</span>
              <span className="replay-row-vs">vs</span>
              <span className="replay-row-loser">{b.loser_name ?? 'Unknown'}</span>
            </div>
            <div className="replay-row-bot">
              <span className="replay-row-rounds">{b.rounds || 0} turn{b.rounds === 1 ? '' : 's'}</span>
              {b.winner_elo_delta !== 0 && (
                <span className="replay-row-elo">
                  +{b.winner_elo_delta} / {b.loser_elo_delta}
                </span>
              )}
              {b.tournament_id && <span className="replay-row-tag">Tournament</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
