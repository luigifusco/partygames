import { POKEMON_BY_ID } from '@shared/pokemon-data';
import './TournamentPrizeModal.css';

export interface TournamentPrizeAward {
  tournamentName: string;
  rank: number;
  totalPlayers: number;
  prize: {
    essence: number;
    pack?: string;
    pokemonIds?: number[];
  };
}

interface Props {
  award: TournamentPrizeAward;
  onClose: () => void;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function rankHeadline(rank: number, total: number): { emoji: string; label: string; accent: string } {
  if (rank === 1) return { emoji: '🏆', label: 'Tournament Champion!', accent: 'gold' };
  if (rank === 2) return { emoji: '🥈', label: 'Runner-up!', accent: 'silver' };
  if (rank === 3) return { emoji: '🥉', label: 'Third place!', accent: 'bronze' };
  if (rank === 4) return { emoji: '🎖️', label: 'Fourth place', accent: 'bronze' };
  return { emoji: '🎗️', label: `${ordinal(rank)} of ${total}`, accent: 'plain' };
}

export default function TournamentPrizeModal({ award, onClose }: Props) {
  const { tournamentName, rank, totalPlayers, prize } = award;
  const headline = rankHeadline(rank, totalPlayers);
  const hasEssence = prize.essence > 0;
  const hasPack = !!prize.pack;
  const hasPokemon = !!prize.pokemonIds && prize.pokemonIds.length > 0;
  const nothing = !hasEssence && !hasPack && !hasPokemon;

  return (
    <div className="ds-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={'ds-modal tournament-prize-modal accent-' + headline.accent}>
        <div className="tournament-prize-headline">
          <div className="tournament-prize-emoji">{headline.emoji}</div>
          <div className="tournament-prize-rank">{headline.label}</div>
          <div className="tournament-prize-tournament">{tournamentName}</div>
        </div>

        {nothing ? (
          <div className="tournament-prize-empty">No prize this time — better luck next tournament!</div>
        ) : (
          <div className="tournament-prize-list">
            {hasEssence && (
              <div className="tournament-prize-row">
                <span className="tournament-prize-row-icon">✦</span>
                <span className="tournament-prize-row-label">{prize.essence.toLocaleString()} essence</span>
              </div>
            )}
            {hasPack && (
              <div className="tournament-prize-row">
                <span className="tournament-prize-row-icon">🎁</span>
                <span className="tournament-prize-row-label">{prize.pack} pack</span>
              </div>
            )}
            {hasPokemon && prize.pokemonIds!.map((pid, i) => {
              const species = POKEMON_BY_ID[pid];
              return (
                <div key={i} className="tournament-prize-row">
                  <span className="tournament-prize-row-icon">✨</span>
                  <span className="tournament-prize-row-label">{species ? species.name : 'Pokémon #' + pid}</span>
                </div>
              );
            })}
          </div>
        )}

        <button className="ds-btn ds-btn-primary tournament-prize-collect" onClick={onClose}>
          Collect!
        </button>
      </div>
    </div>
  );
}
