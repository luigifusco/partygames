import { useNavigate } from 'react-router-dom';
import { getTMSprite, getMoveType } from '@shared/move-data';
import { POKEMON_BY_ID } from '@shared/pokemon-data';
import type { OwnedItem } from '@shared/types';
import PokemonIcon from '../components/PokemonIcon';
import './ItemsScreen.css';

interface ItemsScreenProps {
  items: OwnedItem[];
}

interface TMGroup {
  moveName: string;
  count: number;
}

interface TokenGroup {
  pokemonId: number;
  pokemonName: string;
  count: number;
}

export default function ItemsScreen({ items }: ItemsScreenProps) {
  const navigate = useNavigate();

  // Group TMs by move name
  const tmGroups: TMGroup[] = [];
  const tmCounts = new Map<string, number>();
  for (const item of items) {
    if (item.itemType === 'tm') {
      tmCounts.set(item.itemData, (tmCounts.get(item.itemData) ?? 0) + 1);
    }
  }
  for (const [moveName, count] of [...tmCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    tmGroups.push({ moveName, count });
  }

  // Group Tokens by pokemon ID
  const tokenGroups: TokenGroup[] = [];
  const tokenCounts = new Map<number, number>();
  for (const item of items) {
    if (item.itemType === 'token') {
      const pid = Number(item.itemData);
      tokenCounts.set(pid, (tokenCounts.get(pid) ?? 0) + 1);
    }
  }
  for (const [pokemonId, count] of [...tokenCounts.entries()].sort((a, b) => a[0] - b[0])) {
    const pokemon = POKEMON_BY_ID[pokemonId];
    tokenGroups.push({ pokemonId, pokemonName: pokemon?.name ?? `#${pokemonId}`, count });
  }

  const hasItems = tmGroups.length > 0 || tokenGroups.length > 0;

  return (
    <div className="items-screen">
      <div className="items-header">
        <button className="items-back" onClick={() => navigate('/play')}>← Back</button>
        <h2>Items</h2>
        <div className="items-count">{items.length} total</div>
      </div>

      {!hasItems ? (
        <div className="items-empty">No items yet. Buy packs to get TMs!</div>
      ) : (
        <div className="items-scroll">
          {tokenGroups.length > 0 && (
            <>
              <div className="items-section-title">Tokens</div>
              <div className="items-grid">
                {tokenGroups.map(({ pokemonId, pokemonName, count }) => (
                  <div key={`token-${pokemonId}`} className="item-card token-card">
                    <div className="token-icon-wrapper">
                      <PokemonIcon pokemonId={pokemonId} />
                    </div>
                    {count > 1 && <div className="item-count">×{count}</div>}
                    <div className="item-name">{pokemonName}</div>
                    <div className="item-type token-badge">Token</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tmGroups.length > 0 && (
            <>
              <div className="items-section-title">TMs</div>
              <div className="items-grid">
                {tmGroups.map(({ moveName, count }) => {
                  const moveType = getMoveType(moveName);
                  return (
                    <div key={moveName} className={`item-card type-bg-${moveType}`}>
                      <img
                        className="item-sprite"
                        src={getTMSprite(moveName)}
                        alt={`TM ${moveName}`}
                      />
                      {count > 1 && <div className="item-count">×{count}</div>}
                      <div className="item-name">{moveName}</div>
                      <div className={`item-type type-${moveType}`}>{moveType}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
