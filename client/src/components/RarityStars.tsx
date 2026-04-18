import type { BoxTier } from '@shared/types';
import './RarityStars.css';

const TIER_SYMBOL: Record<BoxTier, string> = {
  common: '●',
  uncommon: '◆',
  rare: '■',
  epic: '★',
  legendary: '🌟',
};

interface RarityStarsProps {
  tier: BoxTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RarityStars({ tier, size = 'sm', className }: RarityStarsProps) {
  const symbol = TIER_SYMBOL[tier] ?? '●';
  return (
    <span
      className={`rarity-stars rarity-stars-${size} rarity-stars-${tier} ${className ?? ''}`}
      aria-label={tier}
      title={tier}
    >
      {symbol}
    </span>
  );
}
