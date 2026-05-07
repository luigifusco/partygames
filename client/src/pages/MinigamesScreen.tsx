import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl, withPartyBody } from '../party';
import { getEffectiveMoves, getPokemonInstanceSprite, type PokemonInstance } from '@shared/types';
import AppleCatch from '../minigames/AppleCatch';
import PettingCare from '../minigames/PettingCare';
import './MinigamesScreen.css';

interface MinigamesScreenProps {
  playerName: string;
  collection: PokemonInstance[];
}

type GameId = 'apple-catch' | 'petting-care';

interface GameDef {
  id: GameId;
  name: string;
  icon: string;
  tagline: string;
  description: string[];
}

const GAMES: GameDef[] = [
  {
    id: 'apple-catch',
    name: 'Apple Catch',
    icon: '🍎',
    tagline: 'Catch falling apples, dodge rocks.',
    description: [
      'Apples and the occasional golden star drop from the sky.',
      'Drag anywhere to move your Pokémon and catch them.',
      'Rocks cost you points — let them fall past.',
      'You have 45 seconds. Score as much as you can.',
    ],
  },
  {
    id: 'petting-care',
    name: 'Shower Brush',
    icon: '🧽',
    tagline: 'Scrub your Pokémon at the right shower speed.',
    description: [
      'Brush directly on your Pokémon with the sponge.',
      'Each mood asks for a different scrubbing speed relative to that Pokémon’s size.',
      'The mood changes at random intervals, and the intervals get shorter as the game goes on.',
      'Adapt quickly, keep the right shower rhythm, and earn Bond XP when the scrub speed is in range.',
    ],
  },
];

type Phase = 'hub' | 'explainer' | 'pick' | 'play' | 'result';

export default function MinigamesScreen({ playerName, collection }: MinigamesScreenProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('hub');
  const [selectedGame, setSelectedGame] = useState<GameDef | null>(null);
  const [selectedInst, setSelectedInst] = useState<PokemonInstance | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [reward, setReward] = useState<{ delta: number; total: number; threshold: number | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pokemonSearch, setPokemonSearch] = useState('');

  const filteredCollection = useMemo(() => {
    const q = pokemonSearch.trim().toLowerCase();
    const list = [...collection].sort((a, b) => {
      const fav = Number(!!b.favorite) - Number(!!a.favorite);
      if (fav !== 0) return fav;
      return a.pokemon.id - b.pokemon.id;
    });
    if (!q) return list;
    return list.filter((inst) => {
      const fields = [
        inst.pokemon.name,
        String(inst.pokemon.id),
        inst.pokemon.tier,
        inst.nature,
        inst.ability,
        ...inst.pokemon.types,
        ...getEffectiveMoves(inst),
      ];
      return fields.some((field) => field.toLowerCase().includes(q));
    });
  }, [collection, pokemonSearch]);

  const openGame = (g: GameDef) => {
    setSelectedGame(g);
    setPhase('explainer');
  };

  const startPick = () => setPhase('pick');

  const pickPokemon = (inst: PokemonInstance) => {
    setSelectedInst(inst);
    setPhase('play');
  };

  const handleGameEnd = async (score: number) => {
    setFinalScore(score);
    if (!selectedInst || !selectedGame) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/minigame/reward'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withPartyBody({
          playerName,
          instanceId: selectedInst.instanceId,
          minigame: selectedGame.id,
          score,
        })),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? 'Failed to record reward');
      } else {
        const data = await res.json();
        if (data.award) {
          setReward({ delta: data.award.delta, total: data.award.total, threshold: data.award.threshold });
        } else {
          setReward({ delta: data.delta ?? 0, total: (selectedInst.bondXp ?? 0) + (data.delta ?? 0), threshold: null });
        }
      }
    } catch {
      setError('Network error');
    } finally {
      setSubmitting(false);
      setPhase('result');
    }
  };

  // ─── Game in progress ───
  if (phase === 'play' && selectedGame && selectedInst) {
    if (selectedGame.id === 'apple-catch') {
      return (
        <AppleCatch
          pokemonSprite={getPokemonInstanceSprite(selectedInst)}
          pokemonName={selectedInst.shiny ? `✨ ${selectedInst.pokemon.name}` : selectedInst.pokemon.name}
          onExit={() => setPhase('pick')}
          onFinish={handleGameEnd}
        />
      );
    }
    if (selectedGame.id === 'petting-care') {
      return (
        <PettingCare
          pokemonSprite={getPokemonInstanceSprite(selectedInst)}
          pokemonName={selectedInst.shiny ? `✨ ${selectedInst.pokemon.name}` : selectedInst.pokemon.name}
          onExit={() => setPhase('pick')}
          onFinish={handleGameEnd}
        />
      );
    }
  }

  // ─── Result ───
  if (phase === 'result' && selectedGame && selectedInst) {
    const progress = reward && reward.threshold
      ? Math.min(100, Math.round((reward.total / reward.threshold) * 100))
      : null;
    return (
      <div className="ds-screen">
        <div className="ds-topbar">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => { setPhase('hub'); setReward(null); }}>← Back to Minigames</button>
          <div className="ds-topbar-title">Game Over</div>
        </div>
        <div className="ds-screen-scroll minigame-result">
          <div className="minigame-result-card">
            <div className="minigame-result-icon">{selectedGame.icon}</div>
            <div className="minigame-result-title">{selectedGame.id === 'petting-care' ? 'Bond XP earned' : 'Final score'}</div>
            <div className="minigame-result-score">{finalScore}</div>
            <img src={getPokemonInstanceSprite(selectedInst)} alt={selectedInst.pokemon.name} className="minigame-result-sprite" />
            <div className="minigame-result-name">{selectedInst.shiny ? `✨ ${selectedInst.pokemon.name}` : selectedInst.pokemon.name}</div>
            {submitting && <div className="minigame-result-submitting">Sending score…</div>}
            {error && <div className="minigame-result-error">{error}</div>}
            {reward && (
              <>
                <div className="minigame-result-xp">+{reward.delta} Bond XP</div>
                {progress !== null && (
                  <div className="minigame-result-progress">
                    <div className="minigame-result-progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                )}
                <div className="minigame-result-total">
                  {reward.threshold
                    ? `${reward.total} / ${reward.threshold} to next evolution`
                    : `${reward.total} bond XP total`}
                </div>
              </>
            )}
            <div className="minigame-result-actions">
              <button className="ds-btn ds-btn-primary" onClick={() => { setPhase('play'); setReward(null); }}>
                Play Again
              </button>
              <button className="ds-btn" onClick={() => { setPhase('pick'); setReward(null); }}>
                Change Pokémon
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pokémon picker ───
  if (phase === 'pick' && selectedGame) {
    return (
      <div className="ds-screen">
        <div className="ds-topbar">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => setPhase('explainer')}>← Back</button>
          <div className="ds-topbar-title">Pick a Pokémon</div>
        </div>
        <div className="ds-screen-scroll">
          {collection.length === 0 ? (
            <div className="ds-empty">
              <div className="ds-empty-text">You don't have any Pokémon yet.</div>
            </div>
          ) : (
            <>
              <div className="minigame-pick-search-row">
                <span className="minigame-pick-search-icon" aria-hidden>🔍</span>
                <input
                  type="search"
                  className="minigame-pick-search-input"
                  placeholder="Search name, type, move, ability…"
                  value={pokemonSearch}
                  onChange={(e) => setPokemonSearch(e.target.value)}
                  aria-label="Search Pokémon"
                />
                {pokemonSearch && (
                  <button
                    type="button"
                    className="minigame-pick-search-clear"
                    onClick={() => setPokemonSearch('')}
                    aria-label="Clear Pokémon search"
                  >
                    ×
                  </button>
                )}
              </div>
              {filteredCollection.length === 0 ? (
                <div className="minigame-pick-empty">
                  <div className="minigame-pick-empty-icon">🔍</div>
                  <div className="minigame-pick-empty-title">No matches</div>
                  <div className="minigame-pick-empty-text">No Pokémon match <b>{pokemonSearch}</b>.</div>
                </div>
              ) : (
                <div className="minigame-pick-grid">
                  {filteredCollection.map(inst => (
                    <button
                      key={inst.instanceId}
                      type="button"
                      className={`minigame-pick-card ${inst.favorite ? 'is-favorite' : ''}`}
                      onClick={() => pickPokemon(inst)}
                    >
                      {inst.favorite && <span className="minigame-pick-favorite" aria-label="Favorite">★</span>}
                      <span className="minigame-pick-sprite-frame">
                        <img src={getPokemonInstanceSprite(inst)} alt={inst.pokemon.name} className="minigame-pick-sprite" />
                      </span>
                      <span className="minigame-pick-name">{inst.shiny ? `✨ ${inst.pokemon.name}` : inst.pokemon.name}</span>
                      <span className="minigame-pick-meta">
                        <span>{inst.pokemon.types.join(' / ')}</span>
                        <span>❤️ {inst.bondXp ?? 0}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Game explainer ───
  if (phase === 'explainer' && selectedGame) {
    return (
      <div className="ds-screen">
        <div className="ds-topbar">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => setPhase('hub')}>← Back</button>
          <div className="ds-topbar-title">{selectedGame.name}</div>
        </div>
        <div className="ds-screen-scroll">
          <div className="minigame-explainer">
            <div className="minigame-explainer-hero">
              <div className="minigame-explainer-icon">{selectedGame.icon}</div>
              <div className="minigame-explainer-title">{selectedGame.name}</div>
              <div className="minigame-explainer-tagline">{selectedGame.tagline}</div>
            </div>
            <ul className="minigame-explainer-list">
              {selectedGame.description.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            <div className="minigame-explainer-reward">
              <strong>Reward:</strong> your Pokémon earns Bond XP based on your score.
            </div>
            <button className="ds-btn ds-btn-primary ds-btn-lg ds-btn-block" onClick={startPick}>
              Choose a Pokémon →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Hub ───
  return (
    <div className="ds-screen">
      <div className="ds-topbar">
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => navigate('/play')}>← Back</button>
        <div className="ds-topbar-title">Minigames</div>
      </div>
      <div className="ds-screen-scroll">
        <div className="minigame-hub-intro">
          Play with your Pokémon. Your score earns them Bond XP — no battles required.
        </div>
        <div className="minigame-hub-grid">
          {GAMES.map(g => (
            <button key={g.id} type="button" className="ds-card ds-card-interactive minigame-hub-card" onClick={() => openGame(g)}>
              <div className="minigame-hub-icon">{g.icon}</div>
              <div className="minigame-hub-name">{g.name}</div>
              <div className="minigame-hub-tagline">{g.tagline}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
