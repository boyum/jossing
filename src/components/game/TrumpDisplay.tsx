'use client';

import { type Rank, Suit } from '@/types/game';
import { getSuitSymbol } from '@/lib/game-utils';

interface TrumpDisplayProps {
  trumpSuit: Suit;
  trumpCardRank: Rank;
}

export function TrumpDisplay({ trumpSuit, trumpCardRank }: TrumpDisplayProps) {
  const getSuitColor = (suit: Suit) => {
    return suit === Suit.HEARTS || suit === Suit.DIAMONDS ? 'text-red-600' : 'text-black';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-yellow-300">
      <div className="flex items-center justify-center space-x-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Trump Suit</h3>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded-lg p-6 shadow-md">
            <div className={`text-5xl ${getSuitColor(trumpSuit)} mb-2`}>
              {getSuitSymbol(trumpSuit)}
            </div>
            <div className="font-semibold text-gray-800 capitalize text-lg">
              {trumpSuit}
            </div>
            <div className="text-xs text-yellow-700 mt-1">TRUMP</div>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Trump Card</h3>
          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-md min-w-[100px]">
            <div className={`text-4xl font-bold ${getSuitColor(trumpSuit)} mb-2`}>
              {trumpCardRank}
            </div>
            <div className={`text-3xl ${getSuitColor(trumpSuit)}`}>
              {getSuitSymbol(trumpSuit)}
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Revealed from deck
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
