import { useState, useEffect, useMemo } from 'react';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import { BASE_PATH } from '../config';
import Avatar from '../components/Avatar';
import './TVView.css';

interface LeaderboardEntry {
  name: string;
  elo: number;
  essence: number;
  picture: string | null;
  pokedexCount?: number;
  tradeCount?: number;
  battleCount?: number;
  topPokemon: number[];
}

type RankMode = 'elo' | 'pokedex' | 'battles' | 'trades';

const RANK_MODES: { key: RankMode; label: string; icon: string; unit: string; get: (e: LeaderboardEntry) => number }[] = [
  { key: 'elo',     label: 'ELO Ranking',      icon: '🏆', unit: 'ELO',     get: e => e.elo },
  { key: 'pokedex', label: 'Pokédex Progress', icon: '📕', unit: 'seen',    get: e => e.pokedexCount ?? 0 },
  { key: 'battles', label: 'Battle Count',     icon: '⚔️', unit: 'battles', get: e => e.battleCount ?? 0 },
  { key: 'trades',  label: 'Trade Count',      icon: '🔄', unit: 'trades',  get: e => e.tradeCount ?? 0 },
];

const MODE_ROTATE_MS = 15_000;

const API_BASE = BASE_PATH;

function PokemonRow({ ids, size }: { ids: number[]; size: 'xl' | 'md' | 'sm' }) {
  if (ids.length === 0) {
    return <div className={`tv-team tv-team-${size} tv-team-empty`}>—</div>;
  }
  return (
    <div className={`tv-team tv-team-${size}`}>
      {ids.map((pid, j) => {
        const pkmn = POKEMON_BY_ID[pid];
        return pkmn ? (
          <img
            key={j}
            src={pkmn.sprite}
            alt={pkmn.name}
            title={pkmn.name}
            className="tv-sprite"
          />
        ) : null;
      })}
    </div>
  );
}

function PodiumCard({
  entry,
  rank,
  mode,
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  mode: typeof RANK_MODES[number];
}) {
  const icons = { 1: '👑', 2: '🥈', 3: '🥉' } as const;
  const primary = mode.get(entry);
  return (
    <div className={`tv-podium tv-podium-${rank}`}>
      <div className="tv-podium-rank">
        <span className="tv-podium-icon">{icons[rank]}</span>
        <span className="tv-podium-num">#{rank}</span>
      </div>
      <Avatar name={entry.name} picture={entry.picture} className="tv-podium-avatar" />
      <div className="tv-podium-name">{entry.name}</div>
      <PokemonRow ids={entry.topPokemon} size="xl" />
      <div className="tv-podium-stats">
        <div className="tv-stat">
          <span className="tv-stat-label">{mode.unit.toUpperCase()}</span>
          <span className="tv-stat-value tv-elo-value">{mode.icon} {primary}</span>
        </div>
        <div className="tv-stat">
          <span className="tv-stat-label">ESSENCE</span>
          <span className="tv-stat-value">✨ {entry.essence}</span>
        </div>
      </div>
    </div>
  );
}

function RankCard({
  entry,
  rank,
  mode,
}: {
  entry: LeaderboardEntry;
  rank: number;
  mode: typeof RANK_MODES[number];
}) {
  return (
    <div className="tv-card">
      <div className="tv-card-rank">#{rank}</div>
      <Avatar name={entry.name} picture={entry.picture} className="tv-card-avatar" />
      <div className="tv-card-body">
        <div className="tv-card-name">{entry.name}</div>
        <PokemonRow ids={entry.topPokemon} size="sm" />
      </div>
      <div className="tv-card-elo">{mode.get(entry)}</div>
    </div>
  );
}

export default function TVView() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [modeIdx, setModeIdx] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/leaderboard`);
        const data = await res.json();
        setLeaderboard(data.players);
      } catch {
        // ignore
      }
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    const clock = setInterval(() => setNow(new Date()), 30_000);
    const rotate = setInterval(
      () => setModeIdx(i => (i + 1) % RANK_MODES.length),
      MODE_ROTATE_MS,
    );
    return () => {
      clearInterval(interval);
      clearInterval(clock);
      clearInterval(rotate);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setModeIdx(i => (i + 1) % RANK_MODES.length);
      } else if (e.key === 'ArrowLeft') {
        setModeIdx(i => (i - 1 + RANK_MODES.length) % RANK_MODES.length);
      } else if (e.key >= '1' && e.key <= String(RANK_MODES.length)) {
        setModeIdx(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const mode = RANK_MODES[modeIdx];

  const sorted = useMemo(() => {
    return [...leaderboard].sort((a, b) => mode.get(b) - mode.get(a));
  }, [leaderboard, mode]);

  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  // Order podium visually: 2nd | 1st | 3rd
  const orderedPodium: Array<{ entry: LeaderboardEntry; rank: 1 | 2 | 3 }> = [];
  if (podium[1]) orderedPodium.push({ entry: podium[1], rank: 2 });
  if (podium[0]) orderedPodium.push({ entry: podium[0], rank: 1 });
  if (podium[2]) orderedPodium.push({ entry: podium[2], rank: 3 });

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="tv-view">
      <header className="tv-header">
        <div className="tv-header-left">
          <span className="tv-live-dot" />
          <span className="tv-live-label">LIVE</span>
        </div>
        <h1 className="tv-title">Pokémon Party Leaderboard</h1>
        <div className="tv-header-right">
          <span className="tv-clock">{timeStr}</span>
          <span className="tv-player-count">{leaderboard.length} trainers</span>
        </div>
      </header>

      <div className="tv-mode-bar">
        {RANK_MODES.map((m, i) => (
          <button
            key={m.key}
            type="button"
            className={`tv-mode-chip${i === modeIdx ? ' tv-mode-chip-active' : ''}`}
            onClick={() => setModeIdx(i)}
            aria-pressed={i === modeIdx}
          >
            <span className="tv-mode-icon">{m.icon}</span>
            <span className="tv-mode-label">{m.label}</span>
          </button>
        ))}
      </div>

      {leaderboard.length === 0 ? (
        <div className="tv-empty">Waiting for trainers…</div>
      ) : (
        <>
          {orderedPodium.length > 0 && (
            <section className="tv-podium-row">
              {orderedPodium.map(({ entry, rank }) => (
                <PodiumCard key={entry.name} entry={entry} rank={rank} mode={mode} />
              ))}
            </section>
          )}

          {rest.length > 0 && (
            <section className="tv-rest-grid">
              {rest.map((entry, i) => (
                <RankCard key={entry.name} entry={entry} rank={i + 4} mode={mode} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
