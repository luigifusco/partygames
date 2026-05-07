import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BattleScene from '../components/BattleScene';
import PokemonIcon from '../components/PokemonIcon';
import TeamSelectGrid from '../components/TeamSelectGrid';
import { apiUrl } from '../party';
import { BATTLE_TOWER_FORMATS, BATTLE_TOWER_RUN_LENGTH, type BattleTowerFormat } from '@shared/battle-tower';
import { getHeldItemName, getHeldItemSprite } from '@shared/held-item-data';
import type { BattleSnapshot } from '@shared/battle-types';
import type { OwnedItem, PokemonInstance } from '@shared/types';
import { CHARACTER_UNLOCK_CHAPTER } from '@shared/story-data';
import { useStoryChapters } from '../hooks/useStoryChapters';
import './BattleTowerScreen.css';

interface TowerFormatStatus {
  id: BattleTowerFormat;
  label: string;
  description: string;
  fieldSize: 1 | 2;
  teamSize: 3 | 4;
  entryCost: number;
  rewardEssence: number;
  level: number;
  difficultyLabel: string;
  finalDifficultyLabel?: string;
  progress: {
    currentStreak: number;
    bestStreak: number;
    totalClears: number;
    totalAttempts: number;
  };
}

interface TowerOpponent {
  name: string;
  title: string;
  sprite: string;
  line: string;
  difficultyLabel?: string;
  themeName?: string;
  themeDescription?: string;
  team: { pokemonId: number; heldItem: string; moves?: [string, string] }[];
}

interface TowerRun {
  id: string;
  format: BattleTowerFormat;
  fieldSize: number;
  teamSize: number;
  entryCost: number;
  rewardEssence: number;
  towerLevel: number;
  status: string;
  currentBattleIndex: number;
  opponents: TowerOpponent[];
  currentOpponent: TowerOpponent | null;
  pendingSnapshot?: BattleSnapshot | null;
}

interface TowerStatus {
  essence: number;
  formats: Record<BattleTowerFormat, TowerFormatStatus>;
  activeRun: TowerRun | null;
}

interface BattleTowerScreenProps {
  playerId: string;
  collection: PokemonInstance[];
  items: OwnedItem[];
  essence: number;
  onUpdateEssence: (essence: number) => void;
  recentPokemonIds?: number[];
  onUpdateRecentPokemonIds?: (ids: number[]) => void;
}

type Phase = 'loading' | 'choose' | 'team' | 'run' | 'battle' | 'result';

export default function BattleTowerScreen({ playerId, collection, items, essence, onUpdateEssence, recentPokemonIds, onUpdateRecentPokemonIds }: BattleTowerScreenProps) {
  const navigate = useNavigate();
  const chapters = useStoryChapters(playerId);
  const characterPickUnlocked = chapters.has(CHARACTER_UNLOCK_CHAPTER);
  const [phase, setPhase] = useState<Phase>('loading');
  const [status, setStatus] = useState<TowerStatus | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<BattleTowerFormat | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<(string | null)[]>([]);
  const [selectedHeldItems, setSelectedHeldItems] = useState<(string | null)[]>([]);
  const [snapshot, setSnapshot] = useState<BattleSnapshot | null>(null);
  const [bondAwards, setBondAwards] = useState<any[]>([]);
  const [battleFinished, setBattleFinished] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadStatus = async () => {
    const res = await fetch(apiUrl(`/api/battle-tower/status?playerId=${encodeURIComponent(playerId)}`));
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to load Battle Tower');
    setStatus(data);
    onUpdateEssence(data.essence);
    if (data.activeRun?.pendingSnapshot) {
      setSnapshot(data.activeRun.pendingSnapshot);
      setBattleFinished(false);
      setPhase('battle');
    } else {
      setPhase(data.activeRun ? 'run' : 'choose');
    }
  };

  useEffect(() => {
    loadStatus().catch((error) => {
      setMessage(error.message);
      setPhase('choose');
    });
  }, [playerId]);

  const activeRun = status?.activeRun ?? null;
  const currentOpponent = activeRun?.currentOpponent ?? null;
  const formatStatus = selectedFormat ? status?.formats[selectedFormat] : null;
  const selectedDef = selectedFormat ? BATTLE_TOWER_FORMATS[selectedFormat] : null;

  const resetSelection = (format: BattleTowerFormat) => {
    setSelectedFormat(format);
    setSelected([]);
    setSelectedCharacters([]);
    setSelectedHeldItems([]);
    setMessage(null);
    setPhase('team');
  };

  const togglePokemon = (idx: number, character?: string | null) => {
    if (!selectedDef) return;
    const i = selected.indexOf(idx);
    if (i !== -1) {
      setSelected(selected.filter((_, k) => k !== i));
      setSelectedCharacters(selectedCharacters.filter((_, k) => k !== i));
      setSelectedHeldItems(selectedHeldItems.filter((_, k) => k !== i));
    } else if (selected.length < selectedDef.teamSize) {
      setSelected([...selected, idx]);
      setSelectedCharacters([...selectedCharacters, character ?? 'balanced']);
      setSelectedHeldItems([...selectedHeldItems, collection[idx].heldItem ?? null]);
    }
  };

  const updateSelectedCharacter = (idx: number, character: string) => {
    const i = selected.indexOf(idx);
    if (i === -1) return;
    setSelectedCharacters(selectedCharacters.map((ch, k) => k === i ? character : ch));
  };

  const updateSelectedHeldItem = (idx: number, itemId: string | null) => {
    const i = selected.indexOf(idx);
    if (i === -1) return;
    setSelectedHeldItems(selectedHeldItems.map((held, k) => k === i ? itemId : held));
  };

  const startRun = async () => {
    if (!selectedFormat || !selectedDef) return;
    setLoadingAction(true);
    setMessage(null);
    try {
      const teamPokemonIds = selected.map((idx) => collection[idx].pokemon.id);
      const res = await fetch(apiUrl('/api/battle-tower/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          format: selectedFormat,
          instanceIds: selected.map((idx) => collection[idx].instanceId),
          heldItems: selected.map((idx, i) => i < selectedHeldItems.length ? selectedHeldItems[i] ?? null : collection[idx].heldItem ?? null),
          moves: selected.map((idx) => collection[idx].learnedMoves ?? null),
          abilities: selected.map((idx) => collection[idx].ability ?? null),
          characters: selected.map((_, i) => selectedCharacters[i] ?? 'balanced'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not enter Battle Tower');
      setStatus(data);
      onUpdateEssence(data.essence);
      onUpdateRecentPokemonIds?.(teamPokemonIds);
      setPhase('run');
    } catch (error: any) {
      setMessage(error.message ?? 'Could not enter Battle Tower');
    } finally {
      setLoadingAction(false);
    }
  };

  const startBattle = async () => {
    if (!activeRun) return;
    setLoadingAction(true);
    setMessage(null);
    try {
      const res = await fetch(apiUrl('/api/battle-tower/battle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, runId: activeRun.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Battle failed');
      setSnapshot(data.snapshot);
      setBondAwards(data.bondAwards ?? []);
      setBattleFinished(false);
      setPhase('battle');
    } catch (error: any) {
      setMessage(error.message ?? 'Battle failed');
    } finally {
      setLoadingAction(false);
    }
  };

  const advanceRun = async () => {
    if (!activeRun) return;
    setLoadingAction(true);
    try {
      const res = await fetch(apiUrl('/api/battle-tower/advance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, runId: activeRun.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not advance Battle Tower');
      setStatus(data);
      onUpdateEssence(data.essence);
      setSnapshot(null);
      setBondAwards([]);
      setBattleFinished(false);
      if (data.result === 'advanced') setPhase('run');
      else {
        setMessage(data.result === 'completed' ? `Tower cleared! You earned ${data.rewardEssence} essence.` : 'The Tower run ended. Your streak resets.');
        setPhase('result');
      }
    } catch (error: any) {
      setMessage(error.message ?? 'Could not advance Battle Tower');
      setPhase('result');
    } finally {
      setLoadingAction(false);
    }
  };

  const abandonRun = async () => {
    if (!activeRun) return;
    await fetch(apiUrl('/api/battle-tower/cancel'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, runId: activeRun.id }),
    });
    await loadStatus();
  };

  if (phase === 'battle' && snapshot) {
    return (
      <div className="battle-tower-battle">
        <BattleScene
          snapshot={snapshot}
          turnDelayMs={1500}
          bondAwards={bondAwards}
          onFinished={() => setBattleFinished(true)}
          onContinue={battleFinished ? advanceRun : undefined}
          continueLabel={snapshot.winner === 'left' ? (activeRun?.currentBattleIndex === BATTLE_TOWER_RUN_LENGTH - 1 ? 'Claim Tower Reward' : 'Next Floor') : 'Leave Tower'}
        />
      </div>
    );
  }

  if (phase === 'team' && selectedDef && formatStatus) {
    return (
      <TeamSelectGrid
        instances={collection}
        selected={selected}
        onToggle={togglePokemon}
        onUpdateCharacter={updateSelectedCharacter}
        onUpdateHeldItem={updateSelectedHeldItem}
        teamSize={selectedDef.teamSize}
        onSubmit={selected.length === selectedDef.teamSize ? startRun : undefined}
        submitLabel={loadingAction ? 'Entering...' : `Pay ${formatStatus.entryCost} Essence`}
        enableCharacterPick={characterPickUnlocked}
        selectedCharacters={selectedCharacters}
        selectedHeldItems={selectedHeldItems}
        ownedItems={items}
        recentPokemonIds={recentPokemonIds}
        disallowLegendaries
        onBack={() => setPhase('choose')}
        title={`Battle Tower ${selectedDef.label}`}
        subtitle={`${formatStatus.difficultyLabel} · Final ${formatStatus.finalDifficultyLabel ?? 'next bracket'} · Reward ${formatStatus.rewardEssence} essence`}
      />
    );
  }

  return (
    <div className="battle-tower-screen">
      <header className="battle-tower-header">
        <button className="battle-tower-back" onClick={() => navigate('/play')}>← Back</button>
        <div>
          <h2>Battle Tower</h2>
          <p>Lock one team, climb three floors, and take the essence prize.</p>
        </div>
      </header>

      <main className="battle-tower-scroll">
        {message && <div className="battle-tower-message">{message}</div>}
        {phase === 'loading' && <div className="battle-tower-card">Loading tower records…</div>}

        {activeRun && phase === 'run' && (
          <section className="battle-tower-card battle-tower-run-card">
            <div className="battle-tower-kicker">
              Floor {activeRun.currentBattleIndex + 1}/{BATTLE_TOWER_RUN_LENGTH}
              {currentOpponent?.difficultyLabel ? ` · ${currentOpponent.difficultyLabel}` : ''}
            </div>
            {currentOpponent && (
              <>
                <img className="battle-tower-trainer" src={currentOpponent.sprite} alt={currentOpponent.name} />
                <h3>{currentOpponent.name}</h3>
                <div className="battle-tower-title">{currentOpponent.title}</div>
                {currentOpponent.themeName && (
                  <div className="battle-tower-theme">
                    <strong>{currentOpponent.themeName}</strong>
                    {currentOpponent.themeDescription && <span>{currentOpponent.themeDescription}</span>}
                  </div>
                )}
                <blockquote>{currentOpponent.line}</blockquote>
                <div className="battle-tower-team-preview">
                  {currentOpponent.team.map((entry, i) => (
                    <span key={`${entry.pokemonId}-${i}`} className="battle-tower-team-slot">
                      <PokemonIcon pokemonId={entry.pokemonId} size={34} />
                      <img src={getHeldItemSprite(entry.heldItem)} alt="" title={getHeldItemName(entry.heldItem)} />
                    </span>
                  ))}
                </div>
              </>
            )}
            <button className="battle-tower-primary" onClick={startBattle} disabled={loadingAction}>
              {loadingAction ? 'Preparing battle…' : 'Begin Battle'}
            </button>
            <button className="battle-tower-secondary" onClick={abandonRun}>Abandon run</button>
          </section>
        )}

        {phase === 'result' && (
          <section className="battle-tower-card">
            <h3>{message}</h3>
            <button className="battle-tower-primary" onClick={() => { setMessage(null); setPhase('choose'); loadStatus(); }}>
              Back to Battle Tower
            </button>
          </section>
        )}

        {phase === 'choose' && status && (
          <>
            <div className="battle-tower-essence">Essence: {essence}</div>
            <div className="battle-tower-format-grid">
              {(['single', 'double'] as BattleTowerFormat[]).map((format) => {
                const info = status.formats[format];
                return (
                  <button key={format} className="battle-tower-format-card" onClick={() => resetSelection(format)}>
                    <span className="battle-tower-format-label">{info.label}</span>
                    <span className="battle-tower-format-desc">{info.description}</span>
                    <span>Entry: <b>{info.entryCost}</b></span>
                    <span>Reward: <b>{info.rewardEssence}</b></span>
                    <span>Difficulty: <b>{info.difficultyLabel}</b> · Final: <b>{info.finalDifficultyLabel ?? 'next bracket'}</b></span>
                    <span>Streak: <b>{info.progress.currentStreak}</b> · Best: <b>{info.progress.bestStreak}</b></span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
