'use client';

import { Card, Suit, Rank } from '@/types/game';

interface TrumpDisplayProps {
  trumpSuit: Suit;
  trumpCardRank: Rank;
}

export function TrumpDisplay({ trumpSuit, trumpCardRank }: TrumpDisplayProps) {
  const getSuitEmoji = (suit: Suit) => {
    switch (suit) {
      case Suit.HEARTS: return '♥️';
      case Suit.DIAMONDS: return '♦️';
      case Suit.CLUBS: return '♣️';
      case Suit.SPADES: return '♠️';
    }
  };

  const getSuitColor = (suit: Suit) => {
    return suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'text-red-600' : 'text-black';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-center space-x-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Trump Suit</h3>
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
            <div className={`text-4xl ${getSuitColor(trumpSuit)}`}>
              {getSuitEmoji(trumpSuit)}
            </div>
            <div className="mt-2 font-semibold text-gray-800 capitalize">
              {trumpSuit}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Trump Card</h3>
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4">
            <div className={`text-3xl font-bold ${getSuitColor(trumpSuit)}`}>
              {trumpCardRank}{getSuitEmoji(trumpSuit)}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Revealed from deck
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
