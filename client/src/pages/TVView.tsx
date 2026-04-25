import { useState, useEffect, useMemo } from 'react';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import type { Tournament, TournamentMatch } from '@shared/tournament-types';
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
type TvTab = RankMode | 'tournament';

const RANK_MODES: { key: RankMode; label: string; icon: string; unit: string; get: (e: LeaderboardEntry) => number }[] = [
  { key: 'elo',     label: 'ELO Ranking',      icon: '🏆', unit: 'ELO',     get: e => e.elo },
  { key: 'pokedex', label: 'Pokédex Progress', icon: '📕', unit: 'seen',    get: e => e.pokedexCount ?? 0 },
  { key: 'battles', label: 'Battle Count',     icon: '⚔️', unit: 'battles', get: e => e.battleCount ?? 0 },
  { key: 'trades',  label: 'Trade Count',      icon: '🔄', unit: 'trades',  get: e => e.tradeCount ?? 0 },
];

const TV_TABS: { key: TvTab; label: string; icon: string }[] = [
  ...RANK_MODES.map(({ key, label, icon }) => ({ key, label, icon })),
  { key: 'tournament', label: 'Latest Tournament', icon: '🏟️' },
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

function statusCopy(tournament: Tournament): { label: string; detail: string } {
  if (tournament.status === 'registration') {
    const ms = tournament.registrationEnd - Date.now();
    if (ms <= 0) return { label: 'Starting soon', detail: 'Registration closed; bracket is being prepared.' };
    const mins = Math.max(1, Math.ceil(ms / 60_000));
    return { label: 'Registration open', detail: `Registration ends in ${mins} min` };
  }
  if (tournament.status === 'active') {
    const active = tournament.bracket.filter((m) => m.status === 'active').length;
    return { label: 'Active', detail: `${active} live match${active === 1 ? '' : 'es'} in round ${tournament.currentRound}` };
  }
  if (tournament.status === 'completed') {
    return { label: 'Completed', detail: tournament.winner ? `${tournament.winner} won the tournament` : 'Tournament completed' };
  }
  return { label: 'Inactive', detail: 'Tournament was cancelled' };
}

function MatchLine({ match }: { match: TournamentMatch }) {
  const p1 = match.player1 ?? 'TBD';
  const p2 = match.player2 ?? 'TBD';
  return (
    <div className={`tv-tournament-match tv-tournament-match-${match.status}`}>
      <div className="tv-tournament-match-round">R{match.round}</div>
      <div className="tv-tournament-match-names">
        <span className={match.winner === match.player1 ? 'tv-match-winner' : ''}>{p1}</span>
        <span className="tv-match-vs">vs</span>
        <span className={match.winner === match.player2 ? 'tv-match-winner' : ''}>{p2}</span>
      </div>
      <div className="tv-tournament-match-status">{match.status}</div>
    </div>
  );
}

function TournamentTab({ tournament }: { tournament: Tournament | null }) {
  if (!tournament) {
    return <div className="tv-empty">No tournaments created yet…</div>;
  }

  const copy = statusCopy(tournament);
  const totalMatches = tournament.bracket.length;
  const completedMatches = tournament.bracket.filter((m) => m.status === 'completed' || m.status === 'forfeit').length;
  const activeMatches = tournament.bracket.filter((m) => m.status === 'active');
  const upcomingMatches = tournament.bracket.filter((m) => m.status === 'pending').slice(0, 4);
  const visibleMatches = activeMatches.length > 0 ? activeMatches.slice(0, 6) : tournament.bracket.slice().reverse().slice(0, 6).reverse();
  const progress = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  return (
    <section className="tv-tournament-panel">
      <div className="tv-tournament-hero">
        <div className="tv-tournament-kicker">Latest tournament</div>
        <h2>{tournament.name}</h2>
        <div className={`tv-tournament-status tv-tournament-status-${tournament.status}`}>
          <span className="tv-tournament-status-dot" />
          <span>{copy.label}</span>
        </div>
        <p>{copy.detail}</p>
      </div>

      <div className="tv-tournament-stats">
        <div className="tv-tournament-stat">
          <span>Players</span>
          <b>{tournament.participants.length}</b>
        </div>
        <div className="tv-tournament-stat">
          <span>Format</span>
          <b>{tournament.fieldSize}v{tournament.fieldSize}</b>
        </div>
        <div className="tv-tournament-stat">
          <span>Team size</span>
          <b>{tournament.totalPokemon}</b>
        </div>
        <div className="tv-tournament-stat">
          <span>Pick mode</span>
          <b>{tournament.pickMode}</b>
        </div>
      </div>

      <div className="tv-tournament-progress-card">
        <div className="tv-tournament-progress-head">
          <span>Bracket progress</span>
          <b>{completedMatches}/{totalMatches || 0}</b>
        </div>
        <div className="tv-tournament-progress-track">
          <div className="tv-tournament-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="tv-tournament-grid">
        <div className="tv-tournament-card">
          <h3>{activeMatches.length > 0 ? 'Live matches' : 'Recent bracket'}</h3>
          {visibleMatches.length > 0 ? (
            <div className="tv-tournament-match-list">
              {visibleMatches.map((match) => <MatchLine key={match.id} match={match} />)}
            </div>
          ) : (
            <div className="tv-tournament-muted">No bracket yet.</div>
          )}
        </div>

        <div className="tv-tournament-card">
          <h3>{tournament.status === 'completed' ? 'Result' : 'Standings'}</h3>
          {tournament.winner ? (
            <div className="tv-tournament-result">
              <div className="tv-tournament-crown">👑</div>
              <div>
                <span>Champion</span>
                <b>{tournament.winner}</b>
              </div>
              {tournament.runnerUp && (
                <div>
                  <span>Runner-up</span>
                  <b>{tournament.runnerUp}</b>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="tv-tournament-participants">
                {tournament.participants.slice(0, 12).map((name) => (
                  <span key={name}>{name}</span>
                ))}
              </div>
              {upcomingMatches.length > 0 && (
                <div className="tv-tournament-upcoming">
                  <span>Upcoming: </span>
                  {upcomingMatches.length} pending match{upcomingMatches.length === 1 ? '' : 'es'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function TVView() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [latestTournament, setLatestTournament] = useState<Tournament | null>(null);
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
    const fetchLatestTournament = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tournaments/latest`);
        const data = await res.json();
        setLatestTournament(data.tournament ?? null);
      } catch {
        // ignore
      }
    };
    fetchLeaderboard();
    fetchLatestTournament();
    const interval = setInterval(fetchLeaderboard, 5000);
    const tournamentInterval = setInterval(fetchLatestTournament, 5000);
    const clock = setInterval(() => setNow(new Date()), 30_000);
    const rotate = setInterval(
      () => setModeIdx(i => (i + 1) % TV_TABS.length),
      MODE_ROTATE_MS,
    );
    return () => {
      clearInterval(interval);
      clearInterval(tournamentInterval);
      clearInterval(clock);
      clearInterval(rotate);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setModeIdx(i => (i + 1) % TV_TABS.length);
      } else if (e.key === 'ArrowLeft') {
        setModeIdx(i => (i - 1 + TV_TABS.length) % TV_TABS.length);
      } else if (e.key >= '1' && e.key <= String(TV_TABS.length)) {
        setModeIdx(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const activeTab = TV_TABS[modeIdx];
  const mode = RANK_MODES.find((m) => m.key === activeTab.key) ?? RANK_MODES[0];
  const showingTournament = activeTab.key === 'tournament';

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
          <span className="tv-player-count">{showingTournament ? (latestTournament?.status ?? 'no tournament') : `${leaderboard.length} trainers`}</span>
        </div>
      </header>

      <div className="tv-mode-bar">
        {TV_TABS.map((m, i) => (
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

      {showingTournament ? (
        <TournamentTab tournament={latestTournament} />
      ) : leaderboard.length === 0 ? (
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
