import type { Card } from '@/types/game';
import { getSuitSymbol } from '@/lib/game-utils';

interface CardComponentProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function CardComponent({ 
  card, 
  onClick, 
  disabled = false, 
  size = 'medium',
  className = '' 
}: CardComponentProps) {
  const sizeClasses = {
    small: 'w-12 h-16 text-xs',
    medium: 'w-16 h-24 text-sm',
    large: 'w-20 h-28 text-base'
  };

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`
        ${sizeClasses[size]}
        rounded-lg border-2 border-gray-300 bg-white
        flex flex-col items-center justify-center
        transition-all duration-200 transform
        ${!disabled && onClick ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isRed ? 'text-red-600' : 'text-black'}
        font-bold
        ${className}
      `}
    >
      <span className="text-xs font-bold">{card.rank}</span>
      <span className="text-lg">{getSuitSymbol(card.suit)}</span>
    </button>
  );
}
