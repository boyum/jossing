'use client';

import { type Player, Suit, type Trick } from '@/types/game';

interface TrickAreaProps {
  trick: Trick | null;
  players: Player[];
  trumpSuit: Suit;
}

export function TrickArea({ trick, players, trumpSuit }: TrickAreaProps) {
  if (!trick) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Trick Area</h3>
        <p className="text-gray-600">Waiting for cards to be played...</p>
      </div>
    );
  }

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Trick {trick.trickNumber}
        </h3>
        {trick.leadingSuit && (
          <p className="text-gray-600">
            Leading suit: <span className="font-semibold capitalize">{trick.leadingSuit}</span>
            {trick.leadingSuit === trumpSuit && ' (Trump!)'}
          </p>
        )}
      </div>

      {/* Cards played in the trick */}
      <div className="flex justify-center items-center space-x-4 min-h-[120px]">
        {/* Placeholder for played cards - in real implementation, this would show actual cards */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg w-20 h-28 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Card 1</span>
        </div>
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg w-20 h-28 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Card 2</span>
        </div>
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg w-20 h-28 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Card 3</span>
        </div>
      </div>

      {/* Current leader info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Leading player: <span className="font-semibold">
            {players.find(p => p.position === trick.leadPlayerPosition)?.name || 'Unknown'}
          </span>
        </p>
        {trick.winnerPosition && (
          <p className="text-sm text-green-600 font-semibold">
            Current winner: {players.find(p => p.position === trick.winnerPosition)?.name || 'Unknown'}
          </p>
        )}
      </div>
    </div>
  );
}
