import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { BASE_PATH } from '../config';
import BattleScene from '../components/BattleScene';
import TeamSelectGrid from '../components/TeamSelectGrid';
import Avatar from '../components/Avatar';
import type { BattleSnapshot } from '@shared/battle-types';
import type { PokemonInstance } from '@shared/types';
import type { Tournament, TournamentSummary, TournamentMatch, FrozenPokemon } from '@shared/tournament-types';
import { CHARACTER_UNLOCK_CHAPTER } from '@shared/story-data';
import { useStoryChapters } from '../hooks/useStoryChapters';
import './TournamentScreen.css';

const API = BASE_PATH;

interface TournamentScreenProps {
  playerName: string;
  collection: PokemonInstance[];
  playerId?: string;
}

type Phase = 'list' | 'detail' | 'lockTeam' | 'teamSelect' | 'blindOrder' | 'draft' | 'waitingOpponent' | 'battle';

export default function TournamentScreen({ playerName, collection, playerId }: TournamentScreenProps) {
  const navigate = useNavigate();
  const chapters = useStoryChapters(playerId);
  const characterPickUnlocked = chapters.has(CHARACTER_UNLOCK_CHAPTER);
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [phase, setPhase] = useState<Phase>('list');
  const [teamLocked, setTeamLocked] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<(string | null)[]>([]);
  const [snapshot, setSnapshot] = useState<BattleSnapshot | null>(null);
  const [battleFinished, setBattleFinished] = useState(false);
  const [viewingTeamOf, setViewingTeamOf] = useState<string | null>(null);
  const [playerPictures, setPlayerPictures] = useState<Record<string, string | null>>({});
  // Per-match ordering state (blind pick): indices into the frozen team in chosen order.
  const [pickOrder, setPickOrder] = useState<number[]>([]);
  // Draft state (updated by server).
  const [draftState, setDraftState] = useState<any>(null);
  // Tick once a second so all deadline countdowns re-render live.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Pull name→picture for every registered player (leaderboard is the only
    // endpoint that returns the full roster, not just online users).
    fetch(API + '/api/leaderboard')
      .then(r => r.json())
      .then((data: any) => {
        const rows: any[] = data?.players ?? [];
        const map: Record<string, string | null> = {};
        for (const r of rows) map[r.name] = r.picture ?? null;
        setPlayerPictures(map);
      })
      .catch(() => {});
  }, []);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch(API + '/api/tournaments');
      const data = await res.json();
      setTournaments(data.tournaments ?? []);
    } catch {}
  }, []);

  const fetchDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(API + '/api/tournament/' + id);
      const data = await res.json();
      setActiveTournament(data);
    } catch {}
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    const onUpdated = (summary: TournamentSummary) => {
      setTournaments(prev => {
        const idx = prev.findIndex(t => t.id === summary.id);
        if (idx >= 0) { const next = [...prev]; next[idx] = summary; return next; }
        return [summary, ...prev];
      });
      if (activeTournament?.id === summary.id) fetchDetail(summary.id);
    };

    const onMatchReady = ({ tournamentId, matchId, opponent }: any) => {
      fetchDetail(tournamentId);
      setActiveMatchId(matchId);
      if (phase === 'detail' || phase === 'list') {
        // Stay on detail — user will see match ready
      }
    };

    const onBattleStart = ({ tournamentId, matchId, snapshot: snap }: any) => {
      setSnapshot(snap);
      setBattleFinished(false);
      setPhase('battle');
    };

    const onWaiting = () => setPhase('waitingOpponent');
    const onTeamLocked = () => setTeamLocked(true);
    const onDraftState = (state: any) => setDraftState(state);

    socket.on('tournament:updated', onUpdated);
    socket.on('tournament:matchReady', onMatchReady);
    socket.on('tournament:battleStart', onBattleStart);
    socket.on('tournament:waitingOpponent', onWaiting);
    socket.on('tournament:teamLocked', onTeamLocked);
    socket.on('tournament:draftState', onDraftState);

    return () => {
      socket.off('tournament:updated', onUpdated);
      socket.off('tournament:matchReady', onMatchReady);
      socket.off('tournament:battleStart', onBattleStart);
      socket.off('tournament:waitingOpponent', onWaiting);
      socket.off('tournament:teamLocked', onTeamLocked);
      socket.off('tournament:draftState', onDraftState);
    };
  }, [activeTournament, phase, fetchDetail]);

  const joinTournament = (id: string) => {
    socket.emit('tournament:join', id);
  };

  const leaveTournament = (id: string) => {
    socket.emit('tournament:leave', id);
  };

  const openDetail = (id: string) => {
    fetchDetail(id);
    setPhase('detail');
  };

  const findMyMatch = (): TournamentMatch | null => {
    if (!activeTournament) return null;
    return activeTournament.bracket.find(m =>
      m.status === 'active' && (m.player1 === playerName || m.player2 === playerName)
    ) ?? null;
  };

  const startTeamSelect = (matchId: string) => {
    setActiveMatchId(matchId);
    setSelected([]);
    setSelectedCharacters([]);
    setPickOrder([]);
    setDraftState(null);
    // Fixed-team tournaments: enter the per-match ordering phase (blind or draft).
    if (activeTournament?.fixedTeam) {
      if (activeTournament.pickMode === 'draft') {
        socket.emit('tournament:draftJoin', { tournamentId: activeTournament.id, matchId });
        setPhase('draft');
      } else {
        setPhase('blindOrder');
      }
      return;
    }
    setPhase('teamSelect');
  };

  const submitBlindOrder = () => {
    if (!activeTournament || !activeMatchId) return;
    const frozen = activeTournament.frozenTeams[playerName];
    if (!frozen || pickOrder.length !== frozen.length) return;
    socket.emit('tournament:selectTeam', {
      tournamentId: activeTournament.id,
      matchId: activeMatchId,
      slotOrder: pickOrder,
      // legacy fields for older servers; server will rebuild from frozen team using slotOrder
      team: pickOrder.map(i => frozen[i].pokemonId),
      heldItems: pickOrder.map(i => frozen[i].heldItem),
      moves: pickOrder.map(i => frozen[i].moves),
      abilities: pickOrder.map(i => frozen[i].ability),
      characters: pickOrder.map(i => frozen[i].character ?? null),
    });
  };

  const draftPick = (slotIndex: number) => {
    if (!activeTournament || !activeMatchId) return;
    socket.emit('tournament:draftPick', {
      tournamentId: activeTournament.id,
      matchId: activeMatchId,
      slotIndex,
    });
  };

  const submitTeam = () => {
    if (!activeTournament || !activeMatchId) return;
    socket.emit('tournament:selectTeam', {
      tournamentId: activeTournament.id,
      matchId: activeMatchId,
      team: selected.map(idx => collection[idx].pokemon.id),
      instanceIds: selected.map(idx => collection[idx].instanceId),
      heldItems: selected.map(idx => collection[idx].heldItem ?? null),
      moves: selected.map(idx => collection[idx].learnedMoves ?? null),
      abilities: selected.map(idx => collection[idx].ability ?? null),
      characters: selected.map((idx, i) => selectedCharacters[i] ?? collection[idx].character ?? null),
    });
  };

  const submitLockedTeam = () => {
    if (!activeTournament) return;
    const frozen: FrozenPokemon[] = selected.map((idx, i) => {
      const inst = collection[idx];
      return {
        pokemonId: inst.pokemon.id,
        name: inst.pokemon.name,
        sprite: inst.pokemon.sprite,
        heldItem: inst.heldItem ?? null,
        moves: inst.learnedMoves ?? inst.pokemon.moves as [string, string],
        ability: inst.ability ?? null,
        character: selectedCharacters[i] ?? inst.character ?? null,
      };
    });
    socket.emit('tournament:lockTeam', { tournamentId: activeTournament.id, team: frozen });
    setPhase('detail');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const timeLeft = (ts: number) => {
    const diff = ts - now;
    if (diff <= 0) return 'Expired';
    const totalSec = Math.floor(diff / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min >= 60) {
      const hr = Math.floor(min / 60);
      const m = min % 60;
      return `${hr}h ${m}m`;
    }
    if (min > 0) return `${min}m ${String(sec).padStart(2, '0')}s`;
    return `${sec}s`;
  };

  const urgencyClass = (ts: number) => {
    const diff = ts - now;
    if (diff <= 0) return 'expired';
    if (diff <= 30_000) return 'critical';
    if (diff <= 120_000) return 'warning';
    return '';
  };

  // ─── Battle View ───
  if (phase === 'battle' && snapshot) {
    return (
      <div style={{ position: 'relative', height: '100dvh' }}>
        <BattleScene
          snapshot={snapshot}
          turnDelayMs={1500}
          onFinished={() => setBattleFinished(true)}
          onContinue={battleFinished ? () => {
            setSnapshot(null);
            setPhase('detail');
            if (activeTournament) fetchDetail(activeTournament.id);
          } : undefined}
          continueLabel={snapshot.winner === 'left' ? 'You advance!' : 'Eliminated'}
        />
      </div>
    );
  }

  // ─── Waiting for Opponent ───
  if (phase === 'waitingOpponent') {
    const myMatch = findMyMatch();
    return (
      <div className="ds-screen">
        <div className="ds-topbar">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => setPhase('detail')}>← Back</button>
          <div className="ds-topbar-title">⏳ Waiting for opponent…</div>
        </div>
        <div className="tournament-waiting">
          Your team is locked in. Waiting for your opponent to submit their team.
          {myMatch?.deadline && (
            <div className={`tournament-countdown tournament-countdown-block ${urgencyClass(myMatch.deadline)}`}>
              <span className="tournament-countdown-icon">⏱️</span>
              Match deadline in <strong>{timeLeft(myMatch.deadline)}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Lock Team (fixed-team tournament registration) ───
  if (phase === 'lockTeam' && activeTournament) {
    const teamSize = activeTournament.totalPokemon;
    const toggleSelect = (idx: number, character?: string | null) => {
      const i = selected.indexOf(idx);
      if (i !== -1) {
        setSelected(selected.filter((_, k) => k !== i));
        setSelectedCharacters(selectedCharacters.filter((_, k) => k !== i));
      } else if (selected.length < teamSize) {
        setSelected([...selected, idx]);
        setSelectedCharacters([...selectedCharacters, character ?? null]);
      }
    };
    return (
      <TeamSelectGrid
        instances={collection}
        selected={selected}
        onToggle={toggleSelect}
        teamSize={teamSize}
        onSubmit={selected.length === teamSize ? submitLockedTeam : undefined}
        submitLabel="Lock Team"
        enableCharacterPick={characterPickUnlocked}
        selectedCharacters={selectedCharacters}
        disallowLegendaries={activeTournament.allowLegendaries === false}
        onBack={() => setPhase('detail')}
        title="Lock Tournament Team"
        subtitle={activeTournament.registrationEnd ? (
          <span className={`tournament-countdown tournament-countdown-inline ${urgencyClass(activeTournament.registrationEnd)}`}>
            <span className="tournament-countdown-icon">⏱️</span>
            Registration closes in {timeLeft(activeTournament.registrationEnd)}
          </span>
        ) : undefined}
      />
    );
  }

  // ─── Blind Order (fixed-team, blind pick mode) ───
  if (phase === 'blindOrder' && activeTournament) {
    const frozen = activeTournament.frozenTeams[playerName] ?? [];
    const myMatch = findMyMatch();
    const togglePick = (idx: number) => {
      setPickOrder(prev => {
        const pos = prev.indexOf(idx);
        if (pos !== -1) return prev.filter(x => x !== idx);
        if (prev.length >= frozen.length) return prev;
        return [...prev, idx];
      });
    };
    const canSubmit = pickOrder.length === frozen.length;
    return (
      <div className="ds-screen">
        <div className="ds-topbar">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => setPhase('detail')}>← Back</button>
          <div className="ds-topbar-title">Order Your Team</div>
        </div>
        <div className="ds-screen-scroll">
          <div className="tournament-pick-help">
            Click your Pokémon in the order you want them to battle. Your order is hidden from your opponent.
            {myMatch?.deadline && (
              <span className={`tournament-countdown tournament-countdown-inline ${urgencyClass(myMatch.deadline)}`}>
                <span className="tournament-countdown-icon">⏱️</span>
                {timeLeft(myMatch.deadline)} left
              </span>
            )}
          </div>
          <div className="tournament-pick-grid">
            {frozen.map((f, i) => {
              const pos = pickOrder.indexOf(i);
              return (
                <button
                  key={i}
                  type="button"
                  className={'tournament-pick-card' + (pos >= 0 ? ' picked' : '')}
                  onClick={() => togglePick(i)}
                >
                  {pos >= 0 && <div className="tournament-pick-badge">#{pos + 1}</div>}
                  <img src={f.sprite} alt={f.name} className="tournament-pick-sprite" />
                  <div className="tournament-pick-name">{f.name}</div>
                  {f.ability && <div className="tournament-pick-detail">{f.ability}</div>}
                  {f.moves && <div className="tournament-pick-detail">{f.moves[0]} / {f.moves[1]}</div>}
                  {f.heldItem && <div className="tournament-pick-detail">@ {f.heldItem}</div>}
                </button>
              );
            })}
          </div>
          <button
            className="ds-btn ds-btn-primary ds-btn-block ds-btn-lg"
            onClick={submitBlindOrder}
            disabled={!canSubmit}
          >
            {canSubmit ? 'Lock In Order' : `Pick ${frozen.length - pickOrder.length} more…`}
          </button>
        </div>
      </div>
    );
  }

  // ─── Draft Pick (fixed-team, draft mode) ───
  if (phase === 'draft' && activeTournament) {
    const t = activeTournament;
    const d = draftState;
    const myMatch = findMyMatch();
    const oppName = myMatch ? (myMatch.player1 === playerName ? myMatch.player2 : myMatch.player1) : null;
    const myFrozen = t.frozenTeams[playerName] ?? [];
    const oppFrozen = oppName ? (t.frozenTeams[oppName] ?? []) : [];
    const isP1 = d ? d.player1 === playerName : true;
    const myOrder: number[] = d ? (isP1 ? d.p1Order : d.p2Order) : [];
    const oppOrder: number[] = d ? (isP1 ? d.p2Order : d.p1Order) : [];
    const myTurn = d && ((isP1 && d.currentPicker === 'p1') || (!isP1 && d.currentPicker === 'p2'));
    const myPickedSet = new Set(myOrder);
    return (
      <div className="ds-screen">
        <div className="ds-topbar">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => setPhase('detail')}>← Back</button>
          <div className="ds-topbar-title">Draft Pick</div>
        </div>
        <div className="ds-screen-scroll">
          <div className="tournament-pick-help">
            {myTurn
              ? 'Your turn — click which Pokémon to send out next.'
              : d?.currentPicker === null
                ? 'Draft complete. Battle starting…'
                : `Waiting for ${oppName} to pick…`}
            {myMatch?.deadline && (
              <span className={`tournament-countdown tournament-countdown-inline ${urgencyClass(myMatch.deadline)}`}>
                <span className="tournament-countdown-icon">⏱️</span>
                {timeLeft(myMatch.deadline)} left
              </span>
            )}
          </div>

          {/* Opponent's revealed picks */}
          <div className="ds-section-title">{oppName ?? 'Opponent'}</div>
          <div className="tournament-draft-row">
            {oppOrder.map((slotIdx, pos) => {
              const f = oppFrozen[slotIdx];
              if (!f) return null;
              return (
                <div key={pos} className="tournament-pick-card picked opponent-pick">
                  <div className="tournament-pick-badge">#{pos + 1}</div>
                  <img src={f.sprite} alt={f.name} className="tournament-pick-sprite" />
                  <div className="tournament-pick-name">{f.name}</div>
                </div>
              );
            })}
            {Array.from({ length: t.totalPokemon - oppOrder.length }).map((_, i) => (
              <div key={'q' + i} className="tournament-pick-card hidden-pick">
                <div className="tournament-pick-badge">#{oppOrder.length + i + 1}</div>
                <div className="tournament-pick-hidden">?</div>
              </div>
            ))}
          </div>

          {/* Your roster */}
          <div className="ds-section-title">Your roster</div>
          <div className="tournament-pick-grid">
            {myFrozen.map((f, i) => {
              const pos = myOrder.indexOf(i);
              const picked = pos >= 0;
              return (
                <button
                  key={i}
                  type="button"
                  className={'tournament-pick-card' + (picked ? ' picked' : '') + (!myTurn || myPickedSet.has(i) ? ' disabled' : '')}
                  onClick={() => myTurn && !picked && draftPick(i)}
                  disabled={!myTurn || picked}
                >
                  {picked && <div className="tournament-pick-badge">#{pos + 1}</div>}
                  <img src={f.sprite} alt={f.name} className="tournament-pick-sprite" />
                  <div className="tournament-pick-name">{f.name}</div>
                  {f.ability && <div className="tournament-pick-detail">{f.ability}</div>}
                  {f.moves && <div className="tournament-pick-detail">{f.moves[0]} / {f.moves[1]}</div>}
                  {f.heldItem && <div className="tournament-pick-detail">@ {f.heldItem}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Team Select ───
  if (phase === 'teamSelect' && activeTournament) {
    const teamSize = activeTournament.totalPokemon;
    const myMatch = findMyMatch();
    const toggleSelect = (idx: number, character?: string | null) => {
      const i = selected.indexOf(idx);
      if (i !== -1) {
        setSelected(selected.filter((_, k) => k !== i));
        setSelectedCharacters(selectedCharacters.filter((_, k) => k !== i));
      } else if (selected.length < teamSize) {
        setSelected([...selected, idx]);
        setSelectedCharacters([...selectedCharacters, character ?? null]);
      }
    };
    return (
      <TeamSelectGrid
        instances={collection}
        selected={selected}
        onToggle={toggleSelect}
        teamSize={teamSize}
        onSubmit={selected.length === teamSize ? submitTeam : undefined}
        submitLabel="Lock In!"
        enableCharacterPick={characterPickUnlocked}
        selectedCharacters={selectedCharacters}
        disallowLegendaries={activeTournament.allowLegendaries === false}
        onBack={() => setPhase('detail')}
        title="Tournament Match"
        subtitle={myMatch?.deadline ? (
          <span className={`tournament-countdown tournament-countdown-inline ${urgencyClass(myMatch.deadline)}`}>
            <span className="tournament-countdown-icon">⏱️</span>
            Match deadline in {timeLeft(myMatch.deadline)}
          </span>
        ) : undefined}
      />
    );
  }

  // ─── Tournament Detail ───
  if (phase === 'detail' && activeTournament) {
    const t = activeTournament;
    const isParticipant = t.participants.includes(playerName);
    const myMatch = findMyMatch();
    const maxRound = Math.max(...t.bracket.map(m => m.round), 0);

    return (
      <div className="ds-screen">
        <div className="ds-topbar">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => { setPhase('list'); setActiveTournament(null); }}>← Back</button>
          <div className="ds-topbar-title">{t.name}</div>
        </div>

        <div className="ds-screen-scroll">
          <div className="tournament-info-bar">
            <span className={'tournament-status-badge status-' + t.status}>{t.status}</span>
            <span>{t.fieldSize}v{t.fieldSize} · {t.totalPokemon} pkm</span>
            <span>{t.participants.length} players</span>
            {t.fixedTeam && <span className="ds-badge ds-badge-gold">Fixed Team</span>}
            <span className={'ds-badge ' + (t.pickMode === 'draft' ? 'ds-badge-accent' : '')}>
              {t.pickMode === 'draft' ? 'Draft Pick' : 'Blind Pick'}
            </span>
            {t.publicTeams && <span className="ds-badge ds-badge-accent">Public Teams</span>}
            {t.allowLegendaries === false && <span className="ds-badge ds-badge-gold">No Legendaries</span>}
          </div>

          {t.prizes && Array.isArray(t.prizes) && t.prizes.length > 0 && (
            <div className="tournament-prizes-bar">
              {t.prizes.map((p, i) => {
                const isLast = i === t.prizes.length - 1;
                const icon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : isLast ? '🏅' : '#' + (i + 1);
                const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
                return (
                  <span key={i} className={'tournament-prize-chip ' + rankClass}>
                    {icon} {p.essence}✦{p.pack ? ' + ' + p.pack : ''}{p.pokemonIds?.length ? ' + ' + p.pokemonIds.length + 'pkm' : ''}
                  </span>
                );
              })}
            </div>
          )}

          {t.status === 'registration' && (
            <div className="tournament-reg-info">
              <div className={`tournament-reg-deadline tournament-countdown ${urgencyClass(t.registrationEnd)}`}>
                <span className="tournament-countdown-icon">⏱️</span>
                Registration closes at <strong>{formatTime(t.registrationEnd)}</strong>
                <span className="tournament-countdown-value">{timeLeft(t.registrationEnd)}</span>
              </div>
              {!isParticipant ? (
                <button className="ds-btn ds-btn-primary ds-btn-block" onClick={() => joinTournament(t.id)}>
                  Join Tournament
                </button>
              ) : (
                <>
                  {t.fixedTeam && !t.frozenTeams[playerName] && (
                    <button className="ds-btn ds-btn-gold ds-btn-block" onClick={() => { setSelected([]); setSelectedCharacters([]); setPhase('lockTeam'); }}>
                      Lock Your Team
                    </button>
                  )}
                  {t.fixedTeam && t.frozenTeams[playerName] && (
                    <div className="tournament-team-locked">
                      Team locked: {t.frozenTeams[playerName].map(f => f.name).join(', ')}
                    </div>
                  )}
                  <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => leaveTournament(t.id)}>Leave</button>
                </>
              )}
              <div className="ds-section-title">Participants</div>
              <div className="tournament-participants">
                {t.participants.map(p => {
                  const ready = t.fixedTeam && !!t.frozenTeams[p];
                  const canViewTeam = t.publicTeams && !!t.frozenTeams[p];
                  return (
                    <div key={p} className={'tournament-participant-card' + (ready ? ' team-ready' : '') + (p === playerName ? ' is-me' : '')}>
                      <Avatar name={p} picture={playerPictures[p] ?? null} size="md" className="tournament-participant-avatar" />
                      <div className="tournament-participant-info">
                        <div className="tournament-participant-name">{p}{p === playerName ? ' (you)' : ''}</div>
                        <div className="tournament-participant-status">
                          {t.fixedTeam && (ready ? <span className="tournament-participant-badge ready">✓ Team ready</span> : <span className="tournament-participant-badge waiting">Team pending</span>)}
                          {canViewTeam && (
                            <button className="tournament-view-team-sm" onClick={() => setViewingTeamOf(p)}>View team</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {myMatch && (
            <div className="tournament-my-match">
              <div className="tournament-my-match-title">Your Match</div>
              <div className="tournament-my-match-info">
                vs <strong>{myMatch.player1 === playerName ? myMatch.player2 : myMatch.player1}</strong>
                {myMatch.deadline && (
                  <span className={`tournament-deadline tournament-countdown-inline ${urgencyClass(myMatch.deadline)}`}>
                    <span className="tournament-countdown-icon">⏱️</span>
                    {timeLeft(myMatch.deadline)} left
                  </span>
                )}
                {t.publicTeams && (() => {
                  const opp = myMatch.player1 === playerName ? myMatch.player2 : myMatch.player1;
                  return opp && t.frozenTeams[opp] ? (
                    <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => setViewingTeamOf(opp)}>View Team</button>
                  ) : null;
                })()}
              </div>
              <button className="ds-btn ds-btn-primary ds-btn-block" onClick={() => startTeamSelect(myMatch.id)}>
                Choose Team & Fight!
              </button>
            </div>
          )}

          {t.winner && (
            <div className="tournament-winner-banner">Winner: {t.winner}</div>
          )}

          {t.bracket.length > 0 && (
            <>
              <div className="ds-section-title">Bracket</div>
              <div className="tournament-bracket">
                {Array.from({ length: maxRound }, (_, i) => i + 1).map(round => (
                  <div key={round} className="tournament-round">
                    <div className="tournament-round-title">
                      {round === maxRound ? 'Final' : round === maxRound - 1 ? 'Semifinal' : 'Round ' + round}
                    </div>
                    {t.bracket.filter(m => m.round === round).map(match => (
                      <div key={match.id} className={'tournament-match-card status-' + match.status}>
                        <div className={'tournament-match-player' + (match.winner === match.player1 ? ' winner' : '')}>
                          {match.player1
                            ? <Avatar name={match.player1} picture={playerPictures[match.player1] ?? null} size="sm" className="tournament-match-avatar" />
                            : <div className="tournament-match-avatar tournament-match-avatar-tbd">?</div>}
                          <span className="tournament-match-player-name">{match.player1 ?? 'TBD'}</span>
                        </div>
                        <div className="tournament-match-vs">vs</div>
                        <div className={'tournament-match-player' + (match.winner === match.player2 ? ' winner' : '')}>
                          {match.player2
                            ? <Avatar name={match.player2} picture={playerPictures[match.player2] ?? null} size="sm" className="tournament-match-avatar" />
                            : <div className="tournament-match-avatar tournament-match-avatar-tbd">?</div>}
                          <span className="tournament-match-player-name">{match.player2 ?? 'TBD'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {viewingTeamOf && t.frozenTeams[viewingTeamOf] && (
          <div className="ds-overlay" onClick={(e) => e.target === e.currentTarget && setViewingTeamOf(null)}>
            <div className="ds-modal">
              <div className="tournament-team-modal-header">
                <span className="tournament-team-modal-header-title">{viewingTeamOf}'s Team</span>
                <button className="tournament-team-modal-close" onClick={() => setViewingTeamOf(null)}>✕</button>
              </div>
              <div className="tournament-team-modal-list">
                {t.frozenTeams[viewingTeamOf].map((fp, i) => (
                  <div key={i} className="tournament-team-pokemon">
                    <img src={fp.sprite} alt={fp.name} className="tournament-team-sprite" />
                    <div className="tournament-team-pokemon-info">
                      <div className="tournament-team-pokemon-name">{fp.name}</div>
                      {fp.ability && <div className="tournament-team-pokemon-detail">{fp.ability}</div>}
                      {fp.moves && <div className="tournament-team-pokemon-detail">{fp.moves[0]} / {fp.moves[1]}</div>}
                      {fp.heldItem && <div className="tournament-team-pokemon-detail">{fp.heldItem}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Tournament List ───
  return (
    <div className="ds-screen">
      <div className="ds-topbar">
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => navigate('/play')}>← Back</button>
        <div className="ds-topbar-title">Tournaments</div>
      </div>
      <div className="ds-screen-scroll">
        {tournaments.length === 0 ? (
          <div className="ds-empty">
            <div className="ds-empty-text">No tournaments right now.<br />Check back later!</div>
          </div>
        ) : (
          <div className="tournament-list">
            {tournaments.map(t => {
              const isRegistered = (t.participants ?? []).includes(playerName);
              return (
                <div key={t.id} className={'ds-card ds-card-interactive tournament-card' + (isRegistered ? ' is-registered' : '')} onClick={() => openDetail(t.id)}>
                  {isRegistered && <div className="tournament-registered-ribbon">✓ Registered</div>}
                  <div className="tournament-card-name">{t.name}</div>
                  <div className="tournament-card-meta">
                    <span className={'tournament-status-badge status-' + t.status}>{t.status}</span>
                    <span>{t.fieldSize}v{t.fieldSize} · {t.totalPokemon} pkm</span>
                    <span>· {t.participantCount} players</span>
                    {t.fixedTeam && <span className="ds-badge ds-badge-gold">Fixed</span>}
                    {t.pickMode === 'draft' && <span className="ds-badge ds-badge-accent">Draft</span>}
                  </div>
                  {t.status === 'registration' && t.registrationEnd && (
                    <div className={`tournament-card-countdown ${urgencyClass(t.registrationEnd)}`}>
                      <span className="tournament-countdown-icon">⏱️</span>
                      Reg closes in <strong>{timeLeft(t.registrationEnd)}</strong>
                    </div>
                  )}
                  {t.winner && <div className="tournament-card-winner">Winner: {t.winner}</div>}
                  {t.prizes && Array.isArray(t.prizes) && t.prizes[0] && (
                    <div className="tournament-card-prize">1st: {t.prizes[0].essence}✦{t.prizes[0].pack ? ' + ' + t.prizes[0].pack : ''}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
