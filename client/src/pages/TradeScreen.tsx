import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../socket';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import { useOnlinePlayers } from '../useOnlinePlayers';
import Avatar from '../components/Avatar';
import type { PokemonInstance } from '@shared/types';
import { getEffectiveMoves } from '@shared/types';
import { getHeldItemSprite, getHeldItemName } from '@shared/held-item-data';
import { randomNature, randomIVs } from '@shared/natures';
import './TradeScreen.css';
import '../pages/BattleDemo.css';

type Phase = 'request' | 'waiting' | 'selectPokemon' | 'waitingPartner' | 'confirm' | 'waitingConfirm' | 'animation';

interface TradeScreenProps {
  playerName: string;
  collection: PokemonInstance[];
  onTrade: (give: PokemonInstance, receive: PokemonInstance) => void;
}

export default function TradeScreen({ playerName, collection, onTrade }: TradeScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const autoChallenge = (location.state as any)?.autoChallenge as string | undefined;
  const onlinePlayers = useOnlinePlayers(playerName);
  const [phase, setPhase] = useState<Phase>('request');
  const [targetName, setTargetName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [tradeId, setTradeId] = useState('');
  const [incomingFrom, setIncomingFrom] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [myPokemonId, setMyPokemonId] = useState<number | null>(null);
  const [theirPokemonId, setTheirPokemonId] = useState<number | null>(null);
  const [nameQuery, setNameQuery] = useState('');

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    const onConnect = () => socket.emit('player:identify', playerName);
    if (socket.connected) socket.emit('player:identify', playerName);
    socket.on('connect', onConnect);

    const onMatched = ({ tradeId, partner }: { tradeId: string; partner: string }) => {
      setTradeId(tradeId);
      setPartnerName(partner);
      setPhase('selectPokemon');
    };

    const onWaiting = () => setPhase('waiting');

    const onIncoming = ({ from }: { from: string }) => {
      setIncomingFrom((prev) => prev.includes(from) ? prev : [...prev, from]);
    };

    const onBothSelected = ({ player1Pokemon, player2Pokemon }: { tradeId: string; player1Pokemon: number; player2Pokemon: number }) => {
      // Figure out which is mine
      // The server sets player1 = whoever initiated first, we need to check
      // We stored our selection, so the other one is theirs
      if (myPokemonId === player1Pokemon) {
        setTheirPokemonId(player2Pokemon);
      } else if (myPokemonId === player2Pokemon) {
        setTheirPokemonId(player1Pokemon);
      } else {
        // We might not have set myPokemonId yet via state, use the one that matches
        setMyPokemonId(player1Pokemon);
        setTheirPokemonId(player2Pokemon);
      }
      setPhase('confirm');
    };

    const onWaitingForPartner = () => setPhase('waitingPartner');
    const onWaitingConfirm = () => setPhase('waitingConfirm');

    const onExecute = ({ player1, player1Pokemon, player2Pokemon }: { tradeId: string; player1: string; player2: string; player1Pokemon: number; player2Pokemon: number }) => {
      const isPlayer1 = player1 === playerName;
      const givePokemonId = isPlayer1 ? player1Pokemon : player2Pokemon;
      const receivePokemonId = isPlayer1 ? player2Pokemon : player1Pokemon;
      setMyPokemonId(givePokemonId);
      setTheirPokemonId(receivePokemonId);
      setPhase('animation');

      setTimeout(() => {
        const giveInst = collection.find((inst) => inst.pokemon.id === givePokemonId);
        const receivePokemon = POKEMON_BY_ID[receivePokemonId];
        if (giveInst && receivePokemon) {
          const receiveInst: PokemonInstance = {
            instanceId: crypto.randomUUID(),
            pokemon: receivePokemon,
            ivs: randomIVs(),
            nature: randomNature(),
            ability: '',
          };
          onTrade(giveInst, receiveInst);
        }
      }, 2800);
    };

    socket.on('trade:matched', onMatched);
    socket.on('trade:waiting', onWaiting);
    socket.on('trade:incoming', onIncoming);
    socket.on('trade:bothSelected', onBothSelected);
    socket.on('trade:waitingForPartner', onWaitingForPartner);
    socket.on('trade:waitingConfirm', onWaitingConfirm);
    socket.on('trade:execute', onExecute);

    return () => {
      socket.off('connect', onConnect);
      socket.off('trade:matched', onMatched);
      socket.off('trade:waiting', onWaiting);
      socket.off('trade:incoming', onIncoming);
      socket.off('trade:bothSelected', onBothSelected);
      socket.off('trade:waitingForPartner', onWaitingForPartner);
      socket.off('trade:waitingConfirm', onWaitingConfirm);
      socket.off('trade:execute', onExecute);
    };
  }, [playerName, myPokemonId]);

  // Auto-request when accepting a notification
  useEffect(() => {
    if (autoChallenge && phase === 'request') {
      setTargetName(autoChallenge);
      socket.emit('trade:request', autoChallenge);
      window.history.replaceState({}, '');
    }
  }, [autoChallenge]);

  const handleRequest = () => {
    if (!targetName.trim()) return;
    socket.emit('trade:request', targetName.trim());
  };

  const requestPlayer = (name: string) => {
    setTargetName(name);
    socket.emit('trade:request', name);
  };

  const handleCancel = () => {
    socket.emit('trade:cancel');
    setPhase('request');
  };

  const handleSelectPokemon = () => {
    if (selectedIdx === null) return;
    const inst = collection[selectedIdx];
    setMyPokemonId(inst.pokemon.id);
    socket.emit('trade:selectPokemon', { tradeId, pokemonId: inst.pokemon.id });
  };

  const handleConfirm = () => {
    socket.emit('trade:confirm', { tradeId });
  };

  const myPokemon = myPokemonId !== null ? POKEMON_BY_ID[myPokemonId] : null;
  const theirPokemon = theirPokemonId !== null ? POKEMON_BY_ID[theirPokemonId] : null;

  // Animation phase
  if (phase === 'animation' && myPokemon && theirPokemon) {
    return (
      <div className="trade-overlay">
        <div className="trade-stage">
          <div className="trade-slot trade-slot-left">
            <img
              className="trade-sprite trade-sprite-out"
              src={myPokemon.sprite}
              alt={myPokemon.name}
            />
            <div className="trade-ball trade-ball-left" aria-hidden="true">
              <div className="trade-ball-top" />
              <div className="trade-ball-band" />
              <div className="trade-ball-btn" />
            </div>
            <img
              className="trade-sprite trade-sprite-in trade-sprite-received"
              src={theirPokemon.sprite}
              alt={theirPokemon.name}
            />
          </div>
          <div className="trade-starburst" aria-hidden="true">
            <div className="trade-starburst-core" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`trade-starburst-ray trade-starburst-ray-${i}`} />
            ))}
          </div>
          <div className="trade-slot trade-slot-right">
            <img
              className="trade-sprite trade-sprite-out"
              src={theirPokemon.sprite}
              alt={theirPokemon.name}
            />
            <div className="trade-ball trade-ball-right" aria-hidden="true">
              <div className="trade-ball-top" />
              <div className="trade-ball-band" />
              <div className="trade-ball-btn" />
            </div>
            <img
              className="trade-sprite trade-sprite-in"
              src={myPokemon.sprite}
              alt={myPokemon.name}
            />
          </div>
        </div>
        <div className="trade-anim-text">Trade complete!</div>
        <div className="trade-anim-received">You received {theirPokemon.name}!</div>
        <button className="trade-anim-close" onClick={() => navigate('/play')}>OK</button>
      </div>
    );
  }

  // Confirm phase
  if (phase === 'confirm' || phase === 'waitingConfirm') {
    return (
      <div className="trade-screen">
        <div className="trade-header">
          <h2>Confirm Trade</h2>
        </div>
        <div className="trade-content">
          <div className="trade-confirm-view">
            <div className="trade-confirm-card">
              <div className="label">You give</div>
              {myPokemon && (
                <>
                  <img src={myPokemon.sprite} alt={myPokemon.name} />
                  <div className="name">{myPokemon.name}</div>
                </>
              )}
            </div>
            <div className="trade-confirm-arrow">⇄</div>
            <div className="trade-confirm-card">
              <div className="label">You get</div>
              {theirPokemon && (
                <>
                  <img src={theirPokemon.sprite} alt={theirPokemon.name} />
                  <div className="name">{theirPokemon.name}</div>
                </>
              )}
            </div>
          </div>
          {phase === 'confirm' && (
            <button className="trade-btn confirm" onClick={handleConfirm}>
              Confirm Trade
            </button>
          )}
          {phase === 'waitingConfirm' && (
            <div className="trade-status waiting">Waiting for {partnerName} to confirm...</div>
          )}
        </div>
      </div>
    );
  }

  // Select pokemon phase
  if (phase === 'selectPokemon' || phase === 'waitingPartner') {
    const normalizedQuery = nameQuery.trim().toLowerCase();
    const matchesQuery = (inst: PokemonInstance) => {
      if (!normalizedQuery) return true;
      const q = normalizedQuery;
      if (inst.pokemon.name.toLowerCase().includes(q)) return true;
      if ((inst.ability ?? '').toLowerCase().includes(q)) return true;
      if ((inst.nature ?? '').toLowerCase().includes(q)) return true;
      return getEffectiveMoves(inst).some((m) => m.toLowerCase().includes(q));
    };

    const indices = collection
      .map((_, i) => i)
      .filter((i) => matchesQuery(collection[i]))
      .sort((a, b) => {
        const aFav = collection[a].favorite ? 0 : 1;
        const bFav = collection[b].favorite ? 0 : 1;
        if (aFav !== bFav) return aFav - bFav;
        return collection[a].pokemon.id - collection[b].pokemon.id;
      });

    return (
      <div className="trade-screen">
        <div className="trade-header">
          <h2>Trade with {partnerName}</h2>
        </div>
        <div style={{ padding: '8px 12px', textAlign: 'center' }}>
          {phase === 'waitingPartner' ? (
            <div className="trade-status waiting">Waiting for {partnerName} to pick...</div>
          ) : (
            <div className="trade-select-label">Select a Pokémon to trade</div>
          )}
        </div>
        {phase === 'selectPokemon' && (
          <div className="team-select-search-row">
            <span className="team-select-search-icon" aria-hidden="true">🔍</span>
            <input
              className="team-select-search-input"
              type="text"
              placeholder="Search name, move, ability, nature…"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              maxLength={40}
            />
            {nameQuery && (
              <button
                type="button"
                className="team-select-search-clear"
                aria-label="Clear search"
                onClick={() => setNameQuery('')}
              >✕</button>
            )}
          </div>
        )}
        {selectedIdx !== null && phase === 'selectPokemon' && (
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <div className="trade-selected-pokemon" style={{ display: 'inline-flex' }}>
              <img src={collection[selectedIdx].pokemon.sprite} alt={collection[selectedIdx].pokemon.name} />
              <div className="name">{collection[selectedIdx].pokemon.name}</div>
            </div>
            <div style={{ marginTop: '8px' }}>
              <button className="trade-btn" onClick={handleSelectPokemon} style={{ maxWidth: '200px' }}>
                Offer this Pokémon
              </button>
            </div>
          </div>
        )}
        <div className="team-select-grid" style={{ flex: 1, overflow: 'auto', padding: '8px', alignContent: 'start' }}>
          {indices.length === 0 && (
            <div className="team-select-empty" style={{ gridColumn: '1 / -1' }}>
              No Pokémon match “{nameQuery}”.
            </div>
          )}
          {indices.map((idx) => {
            const inst = collection[idx];
            const p = inst.pokemon;
            const isSelected = selectedIdx === idx;
            const isFavorite = !!inst.favorite;
            const moves = getEffectiveMoves(inst);
            return (
              <div
                key={idx}
                className={`team-select-card ${isSelected ? 'selected' : ''} ${isFavorite ? 'favorite' : ''}`}
                onClick={() => phase === 'selectPokemon' && setSelectedIdx(idx)}
              >
                {isFavorite && <span className="favorite-badge" title="Favorite">★</span>}
                <img src={p.sprite} alt={p.name} />
                <div className="team-select-card-name">{p.name}</div>
                <div className="team-select-card-info">
                  <div className="team-select-card-nature">{inst.nature}</div>
                  {inst.ability && <div className="team-select-card-ability">{inst.ability}</div>}
                  <div className="team-select-card-moves">
                    {moves.map((m, i) => (
                      <span key={i} className="team-select-card-move">{m}</span>
                    ))}
                  </div>
                  {inst.heldItem && (
                    <div className="team-select-card-held">
                      <img src={getHeldItemSprite(inst.heldItem)} alt="" className="team-select-held-icon" />
                      <span>{getHeldItemName(inst.heldItem)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Request phase
  return (
    <div className="trade-screen">
      <div className="trade-header">
        <button className="trade-back" onClick={() => navigate('/play')}>← Back</button>
        <h2>Trade</h2>
      </div>
      <div className="trade-content">
        {incomingFrom.length > 0 && (
          <div className="trade-incoming">
            Trade request from: {incomingFrom.join(', ')}
          </div>
        )}

        {phase === 'request' && (
          <>
            {onlinePlayers.length > 0 && (
              <div className="online-players-section">
                <div className="online-players-label">Online — tap to trade</div>
                <div className="online-players-grid">
                  {onlinePlayers.map((p) => (
                    <button
                      key={p.name}
                      className="online-player-card"
                      onClick={() => requestPlayer(p.name)}
                      title={`Trade with ${p.name}`}
                    >
                      <Avatar name={p.name} picture={p.picture} className="online-player-avatar" />
                      <span className="online-player-name">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input
              className="trade-input"
              type="text"
              placeholder="Partner's name"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRequest()}
              maxLength={20}
            />
            <button
              className="trade-btn"
              onClick={handleRequest}
              disabled={!targetName.trim()}
            >
              Request Trade
            </button>
          </>
        )}

        {phase === 'waiting' && (
          <>
            <div className="trade-status waiting">
              Waiting for {targetName} to accept...
            </div>
            <button className="trade-btn" onClick={handleCancel}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
