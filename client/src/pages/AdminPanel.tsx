import { useState, useEffect, useCallback } from 'react';
import { BASE_PATH } from '../config';
import './AdminPanel.css';

const API = BASE_PATH;

interface PlayerRow {
  id: string;
  name: string;
  essence: number;
  elo: number;
  pokemon_count: number;
  created_at: string;
}

interface Stats {
  playerCount: number;
  pokemonCount: number;
  battleCount: number;
  itemCount: number;
}

interface RarityWeights {
  common: number;
  uncommon: number;
  rare: number;
  epic: number;
  legendary: number;
}

const RARITY_LABELS: (keyof RarityWeights)[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export default function AdminPanel() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editingEssence, setEditingEssence] = useState<Record<string, string>>({});
  const [editingElo, setEditingElo] = useState<Record<string, string>>({});
  const [rarityWeights, setRarityWeights] = useState<RarityWeights>({
    common: 50, uncommon: 30, rare: 13, epic: 5, legendary: 2,
  });
  const [weightsDirty, setWeightsDirty] = useState(false);
  const [tmShopEnabled, setTmShopEnabled] = useState(false);
  const [aiBattleEnabled, setAiBattleEnabled] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(false);

  const refresh = useCallback(async () => {
    const [pRes, sRes, wRes] = await Promise.all([
      fetch(`${API}/api/admin/players`),
      fetch(`${API}/api/admin/stats`),
      fetch(`${API}/api/admin/settings`),
    ]);
    setPlayers((await pRes.json()).players);
    setStats(await sRes.json());
    const settings = await wRes.json();
    if (settings.rarity_weights) {
      setRarityWeights(settings.rarity_weights);
    }
    setTmShopEnabled(settings.tm_shop_enabled ?? false);
    setAiBattleEnabled(settings.ai_battle_enabled ?? false);
    setLoginDisabled(settings.login_disabled ?? false);
    setWeightsDirty(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setEssence = async (id: string) => {
    const val = parseInt(editingEssence[id] ?? '', 10);
    if (isNaN(val)) return;
    await fetch(`${API}/api/admin/player/${id}/set-essence`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essence: val }),
    });
    refresh();
  };

  const setElo = async (id: string) => {
    const val = parseInt(editingElo[id] ?? '', 10);
    if (isNaN(val)) return;
    await fetch(`${API}/api/admin/player/${id}/set-elo`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elo: val }),
    });
    refresh();
  };

  const wipePokemon = async (id: string, name: string) => {
    if (!confirm(`Wipe all pokemon for ${name}?`)) return;
    await fetch(`${API}/api/admin/player/${id}/wipe-pokemon`, { method: 'POST' });
    refresh();
  };

  const deletePlayer = async (id: string, name: string) => {
    if (!confirm(`DELETE player ${name}? This cannot be undone.`)) return;
    await fetch(`${API}/api/admin/player/${id}/delete`, { method: 'POST' });
    refresh();
  };

  const resetPlayer = async (id: string, name: string) => {
    if (!confirm(`Reset ${name} to fresh state? This wipes all pokemon, items, story progress, and resets essence/elo.`)) return;
    await fetch(`${API}/api/admin/player/${id}/reset`, { method: 'POST' });
    refresh();
  };

  const wipeAllPokemon = async () => {
    if (!confirm('Wipe ALL pokemon from ALL players?')) return;
    await fetch(`${API}/api/admin/wipe-all-pokemon`, { method: 'POST' });
    refresh();
  };

  const [tournamentName, setTournamentName] = useState('Tournament');
  const [tournamentFieldSize, setTournamentFieldSize] = useState(1);
  const [tournamentPokemon, setTournamentPokemon] = useState(3);
  const [tournamentRegMinutes, setTournamentRegMinutes] = useState(10);
  const [tournamentMatchTime, setTournamentMatchTime] = useState(300);
  const [tournamentFixedTeam, setTournamentFixedTeam] = useState(false);
  const [tournamentPublicTeams, setTournamentPublicTeams] = useState(false);
  const [tournamentPrizes, setTournamentPrizes] = useState([
    { essence: 2000, pack: 'legendary', pokemonIds: '' },
    { essence: 1000, pack: 'rare', pokemonIds: '' },
    { essence: 200, pack: '', pokemonIds: '' },
  ]);
  const [showCreateTournament, setShowCreateTournament] = useState(false);

  const addPrizeTier = () => {
    // Insert before the last entry (participation)
    setTournamentPrizes(prev => {
      const next = [...prev];
      next.splice(next.length - 1, 0, { essence: 500, pack: '', pokemonIds: '' });
      return next;
    });
  };

  const removePrizeTier = (i: number) => {
    if (tournamentPrizes.length <= 2) return;
    setTournamentPrizes(prev => prev.filter((_, idx) => idx !== i));
  };

  const updatePrize = (i: number, field: string, value: any) => {
    setTournamentPrizes(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const createTournament = async () => {
    const prizes = tournamentPrizes.map(p => ({
      essence: p.essence,
      pack: p.pack || undefined,
      pokemonIds: p.pokemonIds ? p.pokemonIds.split(',').map(Number).filter(Boolean) : undefined,
    }));
    await fetch(`${API}/api/admin/tournament/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: tournamentName,
        fieldSize: tournamentFieldSize,
        totalPokemon: tournamentPokemon,
        registrationMinutes: tournamentRegMinutes,
        matchTimeLimit: tournamentMatchTime,
        fixedTeam: tournamentFixedTeam,
        publicTeams: tournamentPublicTeams,
        prizes,
      }),
    });
    setShowCreateTournament(false);
    alert('Tournament created!');
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🔧 Admin Panel</h2>
        <button className="admin-refresh" onClick={refresh}>↻ Refresh</button>
      </div>

      {stats && (
        <div className="admin-stats">
          <div className="admin-stat"><span>{stats.playerCount}</span>Players</div>
          <div className="admin-stat"><span>{stats.pokemonCount}</span>Pokémon</div>
          <div className="admin-stat"><span>{stats.battleCount}</span>Battles</div>
          <div className="admin-stat"><span>{stats.itemCount}</span>Items</div>
        </div>
      )}

      <div className="admin-actions">
        <button className="admin-danger-btn" onClick={wipeAllPokemon}>🗑️ Wipe All Pokémon</button>
        <button className="admin-save-btn" onClick={() => setShowCreateTournament(true)}>🏆 Create Tournament</button>
      </div>

      {showCreateTournament && (
        <div className="admin-overlay" onClick={e => e.target === e.currentTarget && setShowCreateTournament(false)}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>🏆 Create Tournament</h3>
              <button onClick={() => setShowCreateTournament(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-weight-row">
                <label className="admin-weight-label">Name</label>
                <input type="text" value={tournamentName} onChange={e => setTournamentName(e.target.value)} style={{ flex: 1 }} />
              </div>
              <div className="admin-weight-row">
                <label className="admin-weight-label">Format</label>
                <select value={tournamentFieldSize} onChange={e => setTournamentFieldSize(Number(e.target.value))}>
                  <option value={1}>1v1</option>
                  <option value={2}>2v2</option>
                  <option value={3}>3v3</option>
                </select>
              </div>
              <div className="admin-weight-row">
                <label className="admin-weight-label">Team Size</label>
                <input type="number" min={1} max={6} value={tournamentPokemon} onChange={e => setTournamentPokemon(Number(e.target.value))} />
              </div>
              <div className="admin-weight-row">
                <label className="admin-weight-label">Reg (min)</label>
                <input type="number" min={1} value={tournamentRegMinutes} onChange={e => setTournamentRegMinutes(Number(e.target.value))} />
              </div>
              <div className="admin-weight-row">
                <label className="admin-weight-label">Match (sec)</label>
                <input type="number" min={30} value={tournamentMatchTime} onChange={e => setTournamentMatchTime(Number(e.target.value))} />
              </div>
              <div className="admin-weight-row">
                <label className="admin-weight-label">Fixed Team</label>
                <label className="admin-toggle">
                  <input type="checkbox" checked={tournamentFixedTeam} onChange={e => setTournamentFixedTeam(e.target.checked)} />
                  <span className="admin-toggle-slider" />
                </label>
              </div>
              <div className="admin-weight-row">
                <label className="admin-weight-label">Public Teams</label>
                <label className="admin-toggle">
                  <input type="checkbox" checked={tournamentPublicTeams} onChange={e => setTournamentPublicTeams(e.target.checked)} />
                  <span className="admin-toggle-slider" />
                </label>
              </div>

              <p className="admin-hint" style={{ marginTop: 12, marginBottom: 4 }}>Prizes (top → bottom = 1st → participation)</p>
              {tournamentPrizes.map((p, i) => {
                const isLast = i === tournamentPrizes.length - 1;
                const label = isLast ? '🏅 Participation' : i === 0 ? '🥇 1st' : i === 1 ? '🥈 2nd' : i === 2 ? '🥉 3rd' : `#${i + 1}`;
                return (
                  <div key={i} className="admin-prize-row">
                    <span className="admin-prize-label">{label}</span>
                    <input type="number" min={0} value={p.essence} onChange={e => updatePrize(i, 'essence', Number(e.target.value))} placeholder="✦" title="Essence" />
                    <select value={p.pack} onChange={e => updatePrize(i, 'pack', e.target.value)} title="Pack">
                      <option value="">—</option>
                      <option value="common">C</option>
                      <option value="uncommon">UC</option>
                      <option value="rare">R</option>
                      <option value="epic">E</option>
                      <option value="legendary">L</option>
                    </select>
                    <input type="text" value={p.pokemonIds} onChange={e => updatePrize(i, 'pokemonIds', e.target.value)} placeholder="PKM IDs" title="Pokemon IDs (comma-separated)" style={{ width: 70 }} />
                    {!isLast && i >= 2 && <button className="admin-prize-remove" onClick={() => removePrizeTier(i)}>✕</button>}
                  </div>
                );
              })}
              <button className="admin-prize-add" onClick={addPrizeTier}>+ Add Prize Tier</button>

              <button className="admin-save-btn" style={{ marginTop: 12, width: '100%' }} onClick={createTournament}>🏆 Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-section">
        <h3>📦 Pack Rarity Weights</h3>
        <p className="admin-hint">Controls the probability of pulling each rarity from packs. Values are relative weights (don't need to sum to 100).</p>
        <div className="admin-weights">
          {RARITY_LABELS.map((rarity) => (
            <div key={rarity} className="admin-weight-row">
              <label className={`admin-weight-label tier-${rarity}`}>{rarity}</label>
              <input
                type="number"
                min={0}
                value={rarityWeights[rarity]}
                onChange={(e) => {
                  setRarityWeights({ ...rarityWeights, [rarity]: Number(e.target.value) });
                  setWeightsDirty(true);
                }}
              />
            </div>
          ))}
          <button
            className="admin-save-btn"
            disabled={!weightsDirty}
            onClick={async () => {
              await fetch(`${API}/api/admin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'rarity_weights', value: rarityWeights }),
              });
              setWeightsDirty(false);
            }}
          >
            {weightsDirty ? '💾 Save Weights' : '✓ Saved'}
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h3>🔧 Feature Toggles</h3>
        <div className="admin-weight-row">
          <label className="admin-weight-label">TM Shop</label>
          <label className="admin-toggle">
            <input type="checkbox" checked={tmShopEnabled} onChange={async (e) => {
              const next = e.target.checked;
              await fetch(`${API}/api/admin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'tm_shop_enabled', value: next }),
              });
              setTmShopEnabled(next);
            }} />
            <span className="admin-toggle-slider" />
          </label>
        </div>
        <div className="admin-weight-row">
          <label className="admin-weight-label">AI Battle</label>
          <label className="admin-toggle">
            <input type="checkbox" checked={aiBattleEnabled} onChange={async (e) => {
              const next = e.target.checked;
              await fetch(`${API}/api/admin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'ai_battle_enabled', value: next }),
              });
              setAiBattleEnabled(next);
            }} />
            <span className="admin-toggle-slider" />
          </label>
        </div>
        <div className="admin-weight-row">
          <label className="admin-weight-label">Disable Login</label>
          <label className="admin-toggle">
            <input type="checkbox" checked={loginDisabled} onChange={async (e) => {
              const next = e.target.checked;
              await fetch(`${API}/api/admin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'login_disabled', value: next }),
              });
              setLoginDisabled(next);
            }} />
            <span className="admin-toggle-slider" />
          </label>
        </div>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Essence</th>
              <th>Elo</th>
              <th>Pokémon</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id}>
                <td className="admin-player-name">{p.name}</td>
                <td>
                  <div className="admin-edit-cell">
                    <span>{p.essence.toLocaleString()}</span>
                    <input
                      type="number"
                      placeholder={String(p.essence)}
                      value={editingEssence[p.id] ?? ''}
                      onChange={(e) => setEditingEssence({ ...editingEssence, [p.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && setEssence(p.id)}
                    />
                    <button onClick={() => setEssence(p.id)}>Set</button>
                  </div>
                </td>
                <td>
                  <div className="admin-edit-cell">
                    <span>{p.elo}</span>
                    <input
                      type="number"
                      placeholder={String(p.elo)}
                      value={editingElo[p.id] ?? ''}
                      onChange={(e) => setEditingElo({ ...editingElo, [p.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && setElo(p.id)}
                    />
                    <button onClick={() => setElo(p.id)}>Set</button>
                  </div>
                </td>
                <td>{p.pokemon_count}</td>
                <td className="admin-actions-cell">
                  <button className="admin-warn-btn" onClick={() => wipePokemon(p.id, p.name)}>Wipe PKM</button>
                  <button className="admin-warn-btn" onClick={() => resetPlayer(p.id, p.name)}>Reset</button>
                  <button className="admin-danger-btn" onClick={() => deletePlayer(p.id, p.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
