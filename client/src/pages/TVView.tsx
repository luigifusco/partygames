import { useState, useEffect } from 'react';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import { BASE_PATH } from '../config';
import Avatar from '../components/Avatar';
import './TVView.css';

interface LeaderboardEntry {
  name: string;
  elo: number;
  essence: number;
  picture: string | null;
  topPokemon: number[];
}

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
}: {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
}) {
  const icons = { 1: '👑', 2: '🥈', 3: '🥉' } as const;
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
          <span className="tv-stat-label">ELO</span>
          <span className="tv-stat-value tv-elo-value">{entry.elo}</span>
        </div>
        <div className="tv-stat">
          <span className="tv-stat-label">ESSENCE</span>
          <span className="tv-stat-value">✨ {entry.essence}</span>
        </div>
      </div>
    </div>
  );
}

function RankCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  return (
    <div className="tv-card">
      <div className="tv-card-rank">#{rank}</div>
      <Avatar name={entry.name} picture={entry.picture} className="tv-card-avatar" />
      <div className="tv-card-body">
        <div className="tv-card-name">{entry.name}</div>
        <PokemonRow ids={entry.topPokemon} size="sm" />
      </div>
      <div className="tv-card-elo">{entry.elo}</div>
    </div>
  );
}

export default function TVView() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [now, setNow] = useState(() => new Date());

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
    return () => {
      clearInterval(interval);
      clearInterval(clock);
    };
  }, []);

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

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
        <h1 className="tv-title">⚡ Pokémon Party Leaderboard ⚡</h1>
        <div className="tv-header-right">
          <span className="tv-clock">{timeStr}</span>
          <span className="tv-player-count">{leaderboard.length} trainers</span>
        </div>
      </header>

      {leaderboard.length === 0 ? (
        <div className="tv-empty">Waiting for trainers…</div>
      ) : (
        <>
          {orderedPodium.length > 0 && (
            <section className="tv-podium-row">
              {orderedPodium.map(({ entry, rank }) => (
                <PodiumCard key={entry.name} entry={entry} rank={rank} />
              ))}
            </section>
          )}

          {rest.length > 0 && (
            <section className="tv-rest-grid">
              {rest.map((entry, i) => (
                <RankCard key={entry.name} entry={entry} rank={i + 4} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
