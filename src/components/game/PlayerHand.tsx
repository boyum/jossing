'use client';

import { CardComponent } from '@/components/ui/card';
import { useGameStore } from '@/store/game-store';
import type { Card, Suit, Trick } from '@/types/game';

interface PlayerHandProps {
  cards: Card[];
  isPlayerTurn: boolean;
  playerId: string;
  currentTrick: Trick | null;
  trumpSuit: Suit;
}

export function PlayerHand({ cards, isPlayerTurn, playerId, currentTrick, trumpSuit }: PlayerHandProps) {
  const { playCard, session } = useGameStore();

  const handleCardClick = async (card: Card) => {
    if (!isPlayerTurn || !currentTrick || !session) return;

    try {
      await playCard(session.id, card);
    } catch (error) {
      console.error('Failed to play card:', error);
    }
  };

  const isCardPlayable = (card: Card): boolean => {
    if (!isPlayerTurn || !currentTrick) return false;

    // If no leading suit yet, any card can be played
    if (!currentTrick.leadingSuit) return true;

    // Must follow suit if possible
    const hasSuit = cards.some(c => c.suit === currentTrick.leadingSuit);
    if (hasSuit) {
      return card.suit === currentTrick.leadingSuit;
    }

    // If can't follow suit, any card can be played
    return true;
  };

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Your Hand</h3>
        <p className="text-gray-600">No cards to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Your Hand</h3>
        <div className="text-sm text-gray-600">
          {cards.length} card{cards.length !== 1 ? 's' : ''} remaining
        </div>
      </div>

      {!isPlayerTurn && currentTrick && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-center">
          <p className="text-yellow-800 font-medium">
            ⏳ Waiting for your turn...
          </p>
        </div>
      )}

      {isPlayerTurn && currentTrick && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg text-center">
          <p className="text-green-800 font-medium">
            🎯 Your turn! Click a card to play it.
          </p>
          {currentTrick.leadingSuit && (
            <p className="text-sm text-green-700 mt-1">
              Leading suit: <span className="font-semibold capitalize">{currentTrick.leadingSuit}</span>
              {currentTrick.leadingSuit === trumpSuit && ' (Trump!)'}
            </p>
          )}
        </div>
      )}

      {/* Hand of cards */}
      <div className="flex flex-wrap gap-2 justify-center">
        {cards.map((card, index) => {
          const playable = isCardPlayable(card);
          const isTrump = card.suit === trumpSuit;
          
          return (
            <div
              key={`${card.suit}-${card.rank}-${index}`}
              className={`transform transition-all duration-200 ${
                playable 
                  ? 'hover:scale-105 hover:-translate-y-2 cursor-pointer' 
                  : isPlayerTurn 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-default'
              }`}
              onClick={() => handleCardClick(card)}
            >
              <CardComponent 
                card={card} 
                size="medium"
                className={`shadow-md hover:shadow-lg transition-shadow ${
                  isTrump ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                } ${
                  playable ? 'hover:ring-2 hover:ring-jossing-primary' : ''
                }`}
              />
              {isTrump && (
                <div className="text-xs text-center mt-1 text-yellow-600 font-semibold">
                  Trump
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hand analysis */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Trump cards: {cards.filter(c => c.suit === trumpSuit).length}
          </span>
          <span>
            High cards (J+): {cards.filter(c => c.value >= 11).length}
          </span>
        </div>
      </div>
    </div>
  );
}
