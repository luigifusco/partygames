import { useState } from 'react';
import PokemonIcon from './PokemonIcon';
import { getEffectiveMoves } from '@shared/types';
import type { OwnedItem, PokemonInstance } from '@shared/types';
import { getHeldItemSprite, getHeldItemName } from '@shared/held-item-data';
import {
  PROFILE_NAMES,
  PROFILE_INFO,
  resolveCharacterName,
  type ProfileName,
} from '@shared/character-profiles';

export interface OpponentInfo {
  name: string;
  title?: string;
  team?: number[];
  format?: string;
}

interface TeamSelectGridProps {
  instances: PokemonInstance[];
  selected: number[];          // indices into `instances`
  onToggle: (idx: number, character?: string | null) => void;
  onUpdateCharacter?: (idx: number, character: ProfileName) => void;
  onUpdateHeldItem?: (idx: number, itemId: string | null) => void;
  teamSize: number;
  disabled?: boolean;
  disabledIndices?: Set<number>;
  onSubmit?: () => void;
  submitLabel?: string;
  /** Back button (renders a standard "← Back" pill top-left when provided). */
  onBack?: () => void;
  /** Main title, e.g. "Pick Your Team". A counter chip is appended automatically. */
  title: string;
  /** Optional small subtitle shown under the title (e.g. a short format hint). */
  subtitle?: React.ReactNode;
  /** Opponent info for story/tournament/AI flows. When provided, shows an opponent strip. */
  opponent?: OpponentInfo;
  aboveGrid?: React.ReactNode;
  recentPokemonIds?: number[];
  /** When true, clicking an unselected card opens a character-picker before adding it. */
  enableCharacterPick?: boolean;
  /** Per-selected-index character override (aligned with `selected`). Shown in the chosen bar. */
  selectedCharacters?: (string | null | undefined)[];
  /** Per-selected-index held-item override (aligned with `selected`). */
  selectedHeldItems?: (string | null | undefined)[];
  /** Inventory items available for temporary battle loadout assignment. */
  ownedItems?: OwnedItem[];
  /** When true, legendary-tier Pokémon cannot be selected. Selected ones are auto-removed. */
  disallowLegendaries?: boolean;
}

export default function TeamSelectGrid({
  instances,
  selected,
  onToggle,
  onUpdateCharacter,
  onUpdateHeldItem,
  teamSize,
  disabled = false,
  disabledIndices,
  onSubmit,
  submitLabel = 'Lock In!',
  onBack,
  title,
  subtitle,
  opponent,
  aboveGrid,
  recentPokemonIds,
  enableCharacterPick = false,
  selectedCharacters,
  selectedHeldItems,
  ownedItems = [],
  disallowLegendaries = false,
}: TeamSelectGridProps) {
  const [actionPick, setActionPick] = useState<number | null>(null);
  const [actionSubcard, setActionSubcard] = useState<'menu' | 'style' | 'item'>('menu');
  const [nameQuery, setNameQuery] = useState('');

  const recentSet = new Set(recentPokemonIds ?? []);
  const normalizedQuery = nameQuery.trim().toLowerCase();
  const matchesQuery = (inst: PokemonInstance) => {
    if (normalizedQuery === '') return true;
    const q = normalizedQuery;
    if (inst.pokemon.name.toLowerCase().includes(q)) return true;
    if ((inst.ability ?? '').toLowerCase().includes(q)) return true;
    if ((inst.nature ?? '').toLowerCase().includes(q)) return true;
    const moves = getEffectiveMoves(inst);
    return moves.some((m) => m.toLowerCase().includes(q));
  };
  const sortedIndices = instances
    .map((_, i) => i)
    .filter((i) => matchesQuery(instances[i]))
    .sort((a, b) => {
    const aFav = instances[a].favorite ? 0 : 1;
    const bFav = instances[b].favorite ? 0 : 1;
    if (aFav !== bFav) return aFav - bFav;
    const aRecent = recentSet.has(instances[a].pokemon.id) ? 0 : 1;
    const bRecent = recentSet.has(instances[b].pokemon.id) ? 0 : 1;
    if (aRecent !== bRecent) return aRecent - bRecent;
    return instances[a].pokemon.id - instances[b].pokemon.id;
  });

  const handleCardClick = (idx: number) => {
    if (disabled) return;
    if (disabledIndices?.has(idx)) return;
    if (disallowLegendaries && instances[idx].pokemon.tier === 'legendary' && !selected.includes(idx)) return;
    const isSelected = selected.includes(idx);
    if (isSelected) {
      setActionPick(idx);
      setActionSubcard('menu');
      return;
    }
    onToggle(idx, 'balanced');
  };

  const actionInst = actionPick != null ? instances[actionPick] : null;
  const actionSelectedIndex = actionPick != null ? selected.indexOf(actionPick) : -1;
  const actionCharacter = actionInst && actionSelectedIndex >= 0
    ? resolveCharacterName(selectedCharacters?.[actionSelectedIndex] ?? 'balanced', actionInst.pokemon.name)
    : null;
  const actionInfo = actionCharacter ? PROFILE_INFO[actionCharacter] : null;
  const effectiveHeldItemAt = (selectedIndex: number): string | null => {
    const idx = selected[selectedIndex];
    if (idx == null) return null;
    if (selectedHeldItems && selectedIndex in selectedHeldItems) {
      return selectedHeldItems[selectedIndex] ?? null;
    }
    return instances[idx]?.heldItem ?? null;
  };
  const selectedHeldItem = actionSelectedIndex >= 0 ? effectiveHeldItemAt(actionSelectedIndex) : null;

  const itemPoolCounts = new Map<string, number>();
  for (const item of ownedItems) {
    if (item.itemType !== 'held_item') continue;
    itemPoolCounts.set(item.itemData, (itemPoolCounts.get(item.itemData) ?? 0) + 1);
  }
  for (const idx of selected) {
    const held = instances[idx]?.heldItem;
    if (!held) continue;
    itemPoolCounts.set(held, (itemPoolCounts.get(held) ?? 0) + 1);
  }
  const usedHeldCounts = new Map<string, number>();
  selected.forEach((_, i) => {
    const held = effectiveHeldItemAt(i);
    if (!held) return;
    usedHeldCounts.set(held, (usedHeldCounts.get(held) ?? 0) + 1);
  });
  const heldItemOptions = [...itemPoolCounts.keys()].sort((a, b) => getHeldItemName(a).localeCompare(getHeldItemName(b)));

  return (
    <div className="team-select-screen">
      <header className="tsg-header">
        {onBack && (
          <button className="tsg-back" onClick={onBack} aria-label="Back">← Back</button>
        )}
        <div className="tsg-title-block">
          <div className="tsg-title-row">
            <h2 className="tsg-title">{title}</h2>
            <span className="tsg-count">{selected.length}/{teamSize}</span>
          </div>
          {subtitle && <div className="tsg-subtitle">{subtitle}</div>}
        </div>
        {opponent && (
          <div className="tsg-opponent-pill" title={opponent.title ?? undefined}>
            <span className="tsg-opponent-vs">vs</span>
            <span className="tsg-opponent-name">{opponent.name}</span>
          </div>
        )}
      </header>

      {opponent && (opponent.title || (opponent.team && opponent.team.length > 0) || opponent.format) && (
        <div className="tsg-opponent-strip">
          {opponent.title && <div className="tsg-opponent-title">{opponent.title}</div>}
          {opponent.team && opponent.team.length > 0 && (
            <div className="tsg-opponent-team">
              {opponent.team.map((id, i) => <PokemonIcon key={i} pokemonId={id} size={28} />)}
            </div>
          )}
          {opponent.format && <div className="tsg-opponent-format">{opponent.format}</div>}
        </div>
      )}

      {aboveGrid}

      {!disabled && (
        <>
          <div className={`team-select-chosen ${teamSize > 4 ? 'compact' : ''}`}>
            {selected.map((idx, i) => {
              const inst = instances[idx];
              const p = inst.pokemon;
              const heldItem = effectiveHeldItemAt(i);
              const charOverride = selectedCharacters?.[i] ?? null;
              const effectiveChar = (charOverride ?? inst.character) as ProfileName | null | undefined;
              const resolved = resolveCharacterName(effectiveChar, p.name);
              const info = PROFILE_INFO[resolved];
              return (
                <div key={`sel-${idx}`} className="team-select-chosen-card" onClick={() => { setActionPick(idx); setActionSubcard('menu'); }}>
                  <PokemonIcon pokemonId={p.id} className="team-select-sprite-icon" />
                  {heldItem && (
                    <span
                      className="team-select-chosen-held"
                      title={getHeldItemName(heldItem)}
                      aria-label={getHeldItemName(heldItem)}
                    >
                      <img src={getHeldItemSprite(heldItem)} alt="" />
                    </span>
                  )}
                  <span
                    className="team-select-chosen-character"
                    title={`${info.label}: ${info.blurb}`}
                    style={{ color: info.color }}
                  >
                    <span className="team-select-chosen-character-icon">{info.icon}</span>
                  </span>
                </div>
              );
            })}
            {Array.from({ length: teamSize - selected.length }).map((_, i) => (
              <div key={`empty-${i}`} className="team-select-chosen-card empty">?</div>
            ))}
          </div>
          {onSubmit && (
            <div className="tsg-submit-float">
              <button className="team-select-go" onClick={onSubmit}>{submitLabel}</button>
            </div>
          )}
        </>
      )}

      <div className="team-select-search-row">
        <span className="team-select-search-icon" aria-hidden>🔍</span>
        <input
          type="search"
          className="team-select-search-input"
          placeholder="Search name, move, ability, nature…"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          aria-label="Search Pokémon by name"
        />
        {nameQuery && (
          <button
            type="button"
            className="team-select-search-clear"
            onClick={() => setNameQuery('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="team-select-scroll">
        {instances.length === 0 ? (
          <div className="team-select-empty">
            <div className="team-select-empty-icon">🎒</div>
            <div className="team-select-empty-title">No Pokémon yet</div>
            <div className="team-select-empty-hint">
              Head back and complete <b>Oak's Gift</b> first — you'll pick your starter team there.
            </div>
          </div>
        ) : sortedIndices.length === 0 ? (
          <div className="team-select-empty">
            <div className="team-select-empty-icon">🔍</div>
            <div className="team-select-empty-title">No matches</div>
            <div className="team-select-empty-hint">
              No Pokémon match <b>{nameQuery}</b>.
            </div>
          </div>
        ) : (
        <div className="team-select-grid">
          {sortedIndices.map((idx) => {
            const inst = instances[idx];
            const p = inst.pokemon;
            const moves = getEffectiveMoves(inst);
            const isSelected = selected.includes(idx);
            const isDisabled = disabledIndices?.has(idx) ?? false;
            const isLegendaryBanned = disallowLegendaries && p.tier === 'legendary' && !isSelected;
            const isRecent = recentSet.has(p.id);
            const isFavorite = !!inst.favorite;
            return (
              <div
                key={idx}
                className={`team-select-card ${isSelected ? 'selected' : ''} ${isDisabled || isLegendaryBanned ? 'drafted' : ''} ${isRecent ? 'recent' : ''} ${isFavorite ? 'favorite' : ''}`}
                onClick={() => handleCardClick(idx)}
                title={isLegendaryBanned ? 'Legendary clause: banned' : undefined}
              >
                {isLegendaryBanned && <span className="favorite-badge" style={{ background: '#555', color: '#fff' }} title="Legendaries banned">🚫</span>}
                {isFavorite && <span className="favorite-badge" title="Favorite">★</span>}
                {isRecent && !isFavorite && <span className="recent-badge">★</span>}
                {inst.heldItem && (
                  <span
                    className="team-select-held-badge"
                    title={getHeldItemName(inst.heldItem)}
                    aria-label={getHeldItemName(inst.heldItem)}
                  >
                    <img src={getHeldItemSprite(inst.heldItem)} alt="" />
                  </span>
                )}
                <img src={p.sprite} alt={p.name} />
                <PokemonIcon pokemonId={p.id} className="team-select-sprite-icon" />
                <div className="team-select-card-name">{p.name}</div>
                <div className="team-select-card-info">
                  <div className="team-select-card-nature">{inst.nature}</div>
                  {inst.ability && <div className="team-select-card-ability">{inst.ability}</div>}
                  <div className="team-select-card-moves">
                    {moves.map((m, i) => (
                      <span key={i} className="team-select-card-move">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {actionInst && actionInfo && (
        <div className="ds-overlay" onClick={() => setActionPick(null)}>
          <div className="ds-modal character-pick-modal team-select-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="character-pick-header">
              <PokemonIcon pokemonId={actionInst.pokemon.id} size={32} />
              <div>
                <div className="character-pick-title">
                  {actionSubcard === 'style' ? 'Battle style' : actionSubcard === 'item' ? 'Held item' : 'Team slot options'}
                </div>
                <div className="character-pick-subtitle">{actionInst.pokemon.name}</div>
              </div>
              <button className="character-pick-close" onClick={() => setActionPick(null)}>✕</button>
            </div>

            {actionSubcard === 'menu' && (
              <>
                <div className="team-select-action-summary">
                  <button
                    type="button"
                    className="team-select-action-summary-button"
                    onClick={() => setActionSubcard('style')}
                    disabled={!enableCharacterPick}
                  >
                    <span className="team-select-action-summary-label">Battle style</span>
                    <span className="team-select-action-summary-value" style={{ color: actionInfo.color }}>
                      {actionInfo.icon} {actionInfo.label}
                    </span>
                  </button>
                  {onUpdateHeldItem && (
                    <button
                      type="button"
                      className="team-select-action-summary-button"
                      onClick={() => setActionSubcard('item')}
                    >
                      <span className="team-select-action-summary-label">Held item</span>
                      <span className="team-select-action-summary-value">
                        {selectedHeldItem ? (
                          <>
                            <img src={getHeldItemSprite(selectedHeldItem)} alt="" />
                            {getHeldItemName(selectedHeldItem)}
                          </>
                        ) : 'No item'}
                      </span>
                    </button>
                  )}
                </div>
                <div className="team-select-action-list">
                  <button
                    type="button"
                    className="team-select-action-button team-select-action-button-danger"
                    onClick={() => {
                      onToggle(actionPick!);
                      setActionPick(null);
                    }}
                  >
                    Remove from team
                  </button>
                </div>
              </>
            )}

            {actionSubcard === 'style' && (
              <>
                <button type="button" className="team-select-subcard-back" onClick={() => setActionSubcard('menu')}>← Team slot options</button>
                <div className="character-pick-list">
                  {PROFILE_NAMES.map((name) => {
                    const info = PROFILE_INFO[name];
                    const isActive = name === actionCharacter;
                    return (
                      <button
                        key={name}
                        className={`character-pick-option ${isActive ? 'is-active' : ''}`}
                        style={{ borderColor: isActive ? info.color : undefined }}
                        onClick={() => {
                          onUpdateCharacter?.(actionPick!, name);
                          setActionSubcard('menu');
                        }}
                      >
                        <span className="character-pick-icon" style={{ color: info.color }}>{info.icon}</span>
                        <div className="character-pick-text">
                          <div className="character-pick-name" style={{ color: info.color }}>
                            {info.label}
                            {name === 'balanced' && <span className="character-pick-default-tag"> (default)</span>}
                          </div>
                          <div className="character-pick-blurb">{info.blurb}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {actionSubcard === 'item' && onUpdateHeldItem && (
              <div className="team-select-held-picker">
                <button type="button" className="team-select-subcard-back" onClick={() => setActionSubcard('menu')}>← Team slot options</button>
                <button
                  type="button"
                  className={`team-select-held-option ${selectedHeldItem == null ? 'is-active' : ''}`}
                  onClick={() => {
                    onUpdateHeldItem(actionPick!, null);
                    setActionSubcard('menu');
                  }}
                >
                  <span className="team-select-held-option-icon">—</span>
                  <span>No item</span>
                </button>
                {heldItemOptions.map((itemId) => {
                  const active = selectedHeldItem === itemId;
                  const available = itemPoolCounts.get(itemId) ?? 0;
                  const usedByOthers = (usedHeldCounts.get(itemId) ?? 0) - (active ? 1 : 0);
                  const disabledOption = usedByOthers >= available;
                  return (
                    <button
                      type="button"
                      key={itemId}
                      className={`team-select-held-option ${active ? 'is-active' : ''}`}
                      disabled={disabledOption && !active}
                      onClick={() => {
                        if (disabledOption && !active) return;
                        onUpdateHeldItem(actionPick!, itemId);
                        setActionSubcard('menu');
                      }}
                    >
                      <span className="team-select-held-option-icon">
                        <img src={getHeldItemSprite(itemId)} alt="" />
                      </span>
                      <span>{getHeldItemName(itemId)}</span>
                      <span className="team-select-held-option-count">
                        {Math.max(0, available - usedByOthers)} left
                      </span>
                    </button>
                  );
                })}
                {heldItemOptions.length === 0 && (
                  <div className="team-select-held-empty">No held items available.</div>
                )}
              </div>
            )}

            {actionSubcard === 'style' && !enableCharacterPick && (
              <button
                type="button"
                className="team-select-subcard-back"
                onClick={() => setActionSubcard('menu')}
              >
                ← Team slot options
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
