import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './pages/LoginScreen';
import MenuScreen from './pages/MenuScreen';
import PokedexScreen from './pages/PokedexScreen';
import CollectionScreen from './pages/CollectionScreen';
import PokemonDetailScreen from './pages/PokemonDetailScreen';
import StoreScreen from './pages/StoreScreen';
import ItemsScreen from './pages/ItemsScreen';
import BattleDemo from './pages/BattleDemo';
import BattleMultiplayer from './pages/BattleMultiplayer';
import TradeScreen from './pages/TradeScreen';
import TVView from './pages/TVView';
import { socket } from './socket';
import { syncEssence, addPokemonToServer, removePokemonFromServer, addItemsToServer, removeItemsFromServer, evolvePokemonOnServer, buildInstance, buildItem } from './api';
import { STARTING_ESSENCE } from '@shared/essence';
import { STARTING_ELO } from '@shared/elo';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import type { PokemonInstance, OwnedItem } from '@shared/types';

interface PlayerState {
  id: string;
  name: string;
}

export default function App() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [essence, setEssence] = useState(0);
  const [elo, setElo] = useState(STARTING_ELO);
  const [collection, setCollection] = useState<PokemonInstance[]>([]);
  const [items, setItems] = useState<OwnedItem[]>([]);

  const spendEssence = (amount: number) => {
    const newEssence = essence - amount;
    setEssence(newEssence);
    if (player) syncEssence(player.id, newEssence);
  };
  const gainEssence = (amount: number) => {
    const newEssence = essence + amount;
    setEssence(newEssence);
    if (player) syncEssence(player.id, newEssence);
  };
  const addPokemon = async (pokemonIds: number[]) => {
    if (player) {
      const instances = await addPokemonToServer(player.id, pokemonIds);
      setCollection((c) => [...c, ...instances]);
    }
  };

  const addItems = async (newItems: { itemType: string; itemData: string }[]) => {
    if (player) {
      const created = await addItemsToServer(player.id, newItems);
      setItems((i) => [...i, ...created]);
    }
  };

  const evolvePokemon = async (instance: PokemonInstance) => {
    const pokemon = instance.pokemon;
    if (!pokemon.evolutionTo) return;
    const evolved = POKEMON_BY_ID[pokemon.evolutionTo];
    if (!evolved) return;

    // Consume 3 tokens of the same pokemon
    const tokenId = String(pokemon.id);
    const tokensToRemove = items.filter((i) => i.itemType === 'token' && i.itemData === tokenId).slice(0, 3);
    if (tokensToRemove.length < 3) return;

    // Remove tokens from local state
    const removedIds = new Set(tokensToRemove.map((t) => t.id));
    setItems((prev) => prev.filter((i) => !removedIds.has(i.id)));

    // Evolve the pokemon in-place (keep IVs, nature)
    setCollection((c) =>
      c.map((inst) =>
        inst.instanceId === instance.instanceId
          ? { ...inst, pokemon: evolved }
          : inst
      )
    );

    if (player) {
      removeItemsFromServer(player.id, 'token', tokenId, 3);
      evolvePokemonOnServer(player.id, instance.instanceId, evolved.id);
    }
  };

  const shardPokemon = async (instance: PokemonInstance) => {
    setCollection((c) => c.filter((inst) => inst.instanceId !== instance.instanceId));
    if (player) {
      removePokemonFromServer(player.id, instance.pokemon.id, 1);
      await addItems([{ itemType: 'token', itemData: String(instance.pokemon.id) }]);
    }
  };

  const handleTrade = (give: PokemonInstance, receive: PokemonInstance) => {
    setCollection((c) => {
      const newCol = [...c];
      const idx = newCol.findIndex((inst) => inst.instanceId === give.instanceId);
      if (idx !== -1) newCol.splice(idx, 1);
      newCol.push(receive);
      return newCol;
    });
    if (player) {
      removePokemonFromServer(player.id, give.pokemon.id, 1);
      addPokemonToServer(player.id, [receive.pokemon.id]);
    }
  };

  const handleLogin = (playerData: { id: string; name: string; essence: number; elo: number }, pokemonRows: any[], itemRows: any[]) => {
    setPlayer({ id: playerData.id, name: playerData.name });
    setEssence(playerData.essence);
    setElo(playerData.elo ?? STARTING_ELO);
    setCollection(pokemonRows.map(buildInstance).filter(Boolean) as PokemonInstance[]);
    setItems((itemRows ?? []).map(buildItem));
    // Connect socket and identify
    socket.connect();
    socket.emit('player:identify', playerData.name);
  };

  // TV view is always accessible without login
  // Everything else requires login
  if (!player) {
    return (
      <Routes>
        <Route path="/tv" element={<TVView />} />
        <Route path="*" element={<LoginScreen onLogin={handleLogin} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/play" element={<MenuScreen playerName={player.name} essence={essence} elo={elo} collectionSize={collection.length} itemCount={items.length} />} />
      <Route path="/collection" element={<CollectionScreen collection={collection} items={items} onEvolve={evolvePokemon} onShard={shardPokemon} />} />
      <Route path="/pokemon/:idx" element={<PokemonDetailScreen collection={collection} />} />
      <Route path="/pokedex" element={<PokedexScreen />} />
      <Route path="/store" element={<StoreScreen essence={essence} onSpendEssence={spendEssence} onAddPokemon={addPokemon} onAddItems={addItems} />} />
      <Route path="/items" element={<ItemsScreen items={items} />} />
      <Route path="/trade" element={<TradeScreen playerName={player.name} collection={collection} onTrade={handleTrade} />} />
      <Route path="/battle" element={<BattleMultiplayer playerName={player.name} collection={collection} essence={essence} onGainEssence={gainEssence} onEloUpdate={(newElo) => setElo(newElo)} />} />
      <Route path="/battle-demo" element={<BattleDemo essence={essence} onGainEssence={gainEssence} />} />
      <Route path="/tv" element={<TVView />} />
      <Route path="*" element={<Navigate to="/play" replace />} />
    </Routes>
  );
}
