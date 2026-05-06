import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_SHOP_TMS, getTMPrice } from '@shared/shop-data';
import { getMoveType, getTMSprite, STAT_MOVES, getMoveAccuracy } from '@shared/move-data';
import { getMoveInfo } from '@shared/move-info';
import { HELD_ITEMS } from '@shared/held-item-data';
import type { HeldItemDef } from '@shared/held-item-data';
import { BOOST_ITEMS, getBoostPrice, getBoostSprite, MAX_IV } from '@shared/boost-data';
import type { BoostItem } from '@shared/boost-data';
import { STAT_LABELS } from '@shared/natures';
import type { PokemonType } from '@shared/types';
import './ShopScreen.css';

const TYPE_COLORS: Partial<Record<PokemonType, string>> = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', electric: '#f8d030',
  grass: '#78c850', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};

interface ShopScreenProps {
  essence: number;
  onSpendEssence: (amount: number) => void;
  onAddItems: (items: { itemType: string; itemData: string }[]) => void;
}

type SortMode = 'name' | 'price-asc' | 'price-desc' | 'type';
type FilterType = 'all' | PokemonType | 'stat';

export default function ShopScreen({ essence, onSpendEssence, onAddItems }: ShopScreenProps) {
  const navigate = useNavigate();
  const [bought, setBought] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedHeldItem, setSelectedHeldItem] = useState<HeldItemDef | null>(null);
  const [selectedBoost, setSelectedBoost] = useState<BoostItem | null>(null);
  const [tab, setTab] = useState<'tms' | 'boosts' | 'held'>('tms');
  const [sort, setSort] = useState<SortMode>('type');
  const [filter, setFilter] = useState<FilterType>('all');
  const [tmSearch, setTmSearch] = useState('');
  const [boostSearch, setBoostSearch] = useState('');
  const [heldSearch, setHeldSearch] = useState('');

  const allTypes = useMemo(() => {
    const types = new Set<PokemonType>();
    for (const tm of ALL_SHOP_TMS) types.add(getMoveType(tm));
    return Array.from(types).sort();
  }, []);

  const sortedTMs = useMemo(() => {
    const q = tmSearch.trim().toLowerCase();
    let list = [...ALL_SHOP_TMS];

    if (filter === 'stat') {
      list = list.filter((m) => STAT_MOVES[m]);
    } else if (filter !== 'all') {
      list = list.filter((m) => getMoveType(m) === filter);
    }

    if (q) {
      list = list.filter((m) => {
        const info = getMoveInfo(m);
        const type = getMoveType(m);
        return [
          m,
          type,
          info.category,
          info.description,
          STAT_MOVES[m] ? 'stat boost setup status' : '',
        ].some((field) => String(field).toLowerCase().includes(q));
      });
    }

    if (sort === 'name') list.sort();
    else if (sort === 'price-asc') list.sort((a, b) => getTMPrice(a) - getTMPrice(b));
    else if (sort === 'price-desc') list.sort((a, b) => getTMPrice(b) - getTMPrice(a));
    else if (sort === 'type') list.sort((a, b) => getMoveType(a).localeCompare(getMoveType(b)) || a.localeCompare(b));

    return list;
  }, [sort, filter, tmSearch]);

  const filteredHeldItems = useMemo(() => {
    const q = heldSearch.trim().toLowerCase();
    if (!q) return HELD_ITEMS;
    return HELD_ITEMS.filter((item) =>
      [item.name, item.id, item.description].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [heldSearch]);

  const filteredBoosts = useMemo(() => {
    const q = boostSearch.trim().toLowerCase();
    if (!q) return BOOST_ITEMS;
    return BOOST_ITEMS.filter((boost) =>
      [
        boost.name,
        boost.stat,
        STAT_LABELS[boost.stat],
        boost.description,
        'iv vitamin boost',
      ].some((field) => String(field).toLowerCase().includes(q))
    );
  }, [boostSearch]);

  const handleBuy = (moveName: string) => {
    const price = getTMPrice(moveName);
    if (essence < price) return;
    onSpendEssence(price);
    onAddItems([{ itemType: 'tm', itemData: moveName }]);
    setSelected(null);
    setBought(moveName);
    setTimeout(() => setBought(null), 1500);
  };

  const handleBuyHeldItem = (item: HeldItemDef) => {
    if (essence < item.price) return;
    onSpendEssence(item.price);
    onAddItems([{ itemType: 'held_item', itemData: item.id }]);
    setSelectedHeldItem(null);
    setBought(item.name);
    setTimeout(() => setBought(null), 1500);
  };

  const handleBuyBoost = (boost: BoostItem) => {
    const price = getBoostPrice(boost.stat);
    if (essence < price) return;
    onSpendEssence(price);
    onAddItems([{ itemType: 'boost', itemData: boost.stat }]);
    setSelectedBoost(null);
    setBought(boost.name);
    setTimeout(() => setBought(null), 1500);
  };

  return (
    <div className="shop-screen">
      <div className="ds-topbar">
        <button className="ds-btn ds-btn-ghost ds-btn-sm" onClick={() => navigate('/play')}>← Back</button>
        <div className="ds-topbar-title">Shop</div>
        <div className="ds-stat ds-stat-essence"><span className="ds-stat-icon">✦</span>{essence}</div>
      </div>

      <div className="shop-tabs-wrap">
        <div className="ds-tabs" role="tablist">
          <button
            className={`ds-tab ${tab === 'tms' ? 'ds-tab-active' : ''}`}
            onClick={() => setTab('tms')}
          >TMs</button>
          <button
            className={`ds-tab ${tab === 'boosts' ? 'ds-tab-active' : ''}`}
            onClick={() => setTab('boosts')}
          >Boosts</button>
          <button
            className={`ds-tab ${tab === 'held' ? 'ds-tab-active' : ''}`}
            onClick={() => setTab('held')}
          >Held Items</button>
        </div>
      </div>

      {tab === 'tms' && (
        <>
          <div className="shop-search-row">
            <span className="shop-search-icon" aria-hidden>🔍</span>
            <input
              className="shop-search-input"
              type="search"
              placeholder="Search TMs by name, type, effect…"
              value={tmSearch}
              onChange={(e) => setTmSearch(e.target.value)}
              aria-label="Search TMs"
            />
            {tmSearch && (
              <button className="shop-search-clear" onClick={() => setTmSearch('')} aria-label="Clear TM search">×</button>
            )}
          </div>
          <div className="shop-controls">
            <div className="shop-sort">
              <span>Sort:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
                <option value="type">Type</option>
                <option value="name">Name</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
              </select>
            </div>
            <div className="shop-filter">
              <span>Filter:</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}>
                <option value="all">All</option>
                <option value="stat">Stat Moves</option>
                {allTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="shop-grid">
            {sortedTMs.length === 0 && (
              <div className="shop-empty">No TMs match your search.</div>
            )}
            {sortedTMs.map((moveName) => {
              const price = getTMPrice(moveName);
              const type = getMoveType(moveName);
              const canAfford = essence >= price;
              const isStat = !!STAT_MOVES[moveName];
              const accuracy = getMoveAccuracy(moveName);
              const accLabel = accuracy === Infinity ? '∞' : `${accuracy}%`;

              return (
                <div
                  key={moveName}
                  className={`shop-tm-card ${bought === moveName ? 'just-bought' : ''}`}
                  onClick={() => setSelected(moveName)}
                >
                  <img src={getTMSprite(moveName)} alt={moveName} className="shop-tm-img" />
                  <div className="shop-tm-info">
                    <div className="shop-tm-name">{moveName}</div>
                    <div className="shop-tm-meta">
                      <span className="shop-tm-type" style={{ background: TYPE_COLORS[type] ?? '#888' }}>{type}</span>
                      {isStat && <span className="shop-tm-badge stat">STAT</span>}
                      <span className="shop-tm-acc">Acc: {accLabel}</span>
                    </div>
                  </div>
                  <div className="shop-tm-price">✦ {price}</div>
                </div>
              );
            })}
          </div>

          {selected && (() => {
        const moveName = selected;
        const price = getTMPrice(moveName);
        const type = getMoveType(moveName);
        const canAfford = essence >= price;
        const accuracy = getMoveAccuracy(moveName);
        const accLabel = accuracy === Infinity ? '∞' : `${accuracy}%`;
        const info = getMoveInfo(moveName);
        const isStat = !!STAT_MOVES[moveName];
        const statEffect = STAT_MOVES[moveName];

        return (
          <div className="ds-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
            <div className="ds-modal shop-detail-card">
              <img src={getTMSprite(moveName)} alt={moveName} className="shop-detail-img" />
              <h3 className="shop-detail-name">{moveName}</h3>
              <div className="shop-detail-badges">
                <span className="shop-tm-type" style={{ background: TYPE_COLORS[type] ?? '#888' }}>{type}</span>
                <span className="shop-detail-cat">{info.category}</span>
                {isStat && <span className="shop-tm-badge stat">STAT</span>}
              </div>
              <div className="shop-detail-stats">
                {info.bp > 0 && <div className="shop-detail-stat"><span>Power</span><strong>{info.bp}</strong></div>}
                <div className="shop-detail-stat"><span>Accuracy</span><strong>{accLabel}</strong></div>
              </div>
              {statEffect && (
                <div className="shop-detail-boosts">
                  {Object.entries(statEffect.boosts).map(([stat, val]) => (
                    <span key={stat} className={`boost-tag ${val > 0 ? 'boost-up' : 'boost-down'}`}>
                      {val > 0 ? '▲' : '▼'}{stat.toUpperCase()} {val > 0 ? '+' : ''}{val}
                    </span>
                  ))}
                  <span className="shop-detail-target">({statEffect.target === 'self' ? 'Self' : 'Opponent'})</span>
                </div>
              )}
              <p className="shop-detail-desc">{info.description}</p>
              <div className="shop-detail-price">✦ {price}</div>
              <div className="shop-detail-actions">
                <button className="ds-btn ds-btn-ghost ds-btn-block" onClick={() => setSelected(null)}>Back</button>
                <button
                  className="ds-btn ds-btn-gold ds-btn-block"
                  onClick={() => canAfford && handleBuy(moveName)}
                  disabled={!canAfford}
                >
                  {canAfford ? 'Buy' : 'Not enough ✦'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
        </>
      )}

      {tab === 'boosts' && (
        <>
          <div className="shop-search-row">
            <span className="shop-search-icon" aria-hidden>🔍</span>
            <input
              className="shop-search-input"
              type="search"
              placeholder="Search boosts by stat…"
              value={boostSearch}
              onChange={(e) => setBoostSearch(e.target.value)}
              aria-label="Search boosts"
            />
            {boostSearch && (
              <button className="shop-search-clear" onClick={() => setBoostSearch('')} aria-label="Clear boost search">×</button>
            )}
          </div>
          <div className="shop-grid">
            {filteredBoosts.length === 0 && (
              <div className="shop-empty">No boosts match your search.</div>
            )}
            {filteredBoosts.map((boost) => (
              <div
                key={boost.stat}
                className="shop-tm-card"
                onClick={() => setSelectedBoost(boost)}
              >
                <img src={getBoostSprite(boost.stat)} alt={boost.name} className="shop-tm-img" />
                <div className="shop-tm-info">
                  <div className="shop-tm-name">{boost.name}</div>
                  <div className="shop-tm-meta">
                    <span className="shop-tm-badge boost">BOOST</span>
                    <span className="shop-tm-acc">{STAT_LABELS[boost.stat]} IV → {MAX_IV}</span>
                  </div>
                </div>
                <div className="shop-tm-price">✦ {getBoostPrice(boost.stat)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'held' && (
        <>
          <div className="shop-search-row">
            <span className="shop-search-icon" aria-hidden>🔍</span>
            <input
              className="shop-search-input"
              type="search"
              placeholder="Search held items…"
              value={heldSearch}
              onChange={(e) => setHeldSearch(e.target.value)}
              aria-label="Search held items"
            />
            {heldSearch && (
              <button className="shop-search-clear" onClick={() => setHeldSearch('')} aria-label="Clear held item search">×</button>
            )}
          </div>
          <div className="shop-grid">
            {filteredHeldItems.length === 0 && (
              <div className="shop-empty">No held items match your search.</div>
            )}
            {filteredHeldItems.map((item) => (
              <div
                key={item.id}
                className={`shop-tm-card`}
                onClick={() => setSelectedHeldItem(item)}
              >
                <img src={item.sprite} alt={item.name} className="shop-tm-img" style={{ imageRendering: 'pixelated' }} />
                <div className="shop-tm-info">
                  <div className="shop-tm-name">{item.name}</div>
                  <div className="shop-tm-meta">
                    <span className="shop-tm-badge held">HELD</span>
                  </div>
                </div>
                <div className="shop-tm-price">✦ {item.price}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedHeldItem && (() => {
        const item = selectedHeldItem;
        const canAfford = essence >= item.price;
        return (
          <div className="ds-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedHeldItem(null)}>
            <div className="ds-modal shop-detail-card">
              <img src={item.sprite} alt={item.name} className="shop-detail-img" style={{ imageRendering: 'pixelated' }} />
              <h3 className="shop-detail-name">{item.name}</h3>
              <div className="shop-detail-badges">
                <span className="shop-tm-badge held">HELD ITEM</span>
              </div>
              <p className="shop-detail-desc">{item.description}</p>
              <div className="shop-detail-price">✦ {item.price}</div>
              <div className="shop-detail-actions">
                <button className="ds-btn ds-btn-ghost ds-btn-block" onClick={() => setSelectedHeldItem(null)}>Back</button>
                <button
                  className="ds-btn ds-btn-gold ds-btn-block"
                  onClick={() => canAfford && handleBuyHeldItem(item)}
                  disabled={!canAfford}
                >
                  {canAfford ? 'Buy' : 'Not enough ✦'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedBoost && (() => {
        const boost = selectedBoost;
        const price = getBoostPrice(boost.stat);
        const canAfford = essence >= price;
        return (
          <div className="ds-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedBoost(null)}>
            <div className="ds-modal shop-detail-card">
              <img src={getBoostSprite(boost.stat)} alt={boost.name} className="shop-detail-img" />
              <h3 className="shop-detail-name">{boost.name}</h3>
              <div className="shop-detail-badges">
                <span className="shop-tm-badge boost">BOOST</span>
                <span className="shop-detail-cat">{STAT_LABELS[boost.stat]}</span>
              </div>
              <div className="shop-detail-stats">
                <div className="shop-detail-stat"><span>IV Target</span><strong>{MAX_IV}</strong></div>
              </div>
              <p className="shop-detail-desc">{boost.description}</p>
              <div className="shop-detail-price">✦ {price}</div>
              <div className="shop-detail-actions">
                <button className="ds-btn ds-btn-ghost ds-btn-block" onClick={() => setSelectedBoost(null)}>Back</button>
                <button
                  className="ds-btn ds-btn-gold ds-btn-block"
                  onClick={() => canAfford && handleBuyBoost(boost)}
                  disabled={!canAfford}
                >
                  {canAfford ? 'Buy' : 'Not enough ✦'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {bought && (
        <div className="shop-toast">Purchased: {bought}!</div>
      )}
    </div>
  );
}
