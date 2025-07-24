'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { CardComponent } from '@/components/ui/card';
import type { Card } from '@/types/game';

interface BiddingPhaseProps {
  maxBid: number;
  playerId: string;
}

export function BiddingPhase({ maxBid, playerId }: BiddingPhaseProps) {
  const [selectedBid, setSelectedBid] = useState<number | null>(null);
  const { placeBid, players, currentSection, session, sectionBids, playerHand } = useGameStore();

  // Check if this player has already bid
  const playerBid = sectionBids.find(bid => bid.playerId === playerId);
  const hasBid = playerBid !== undefined;

  const handlePlaceBid = async () => {
    if (selectedBid === null || hasBid || !session) return;

    try {
      await placeBid(session.id, selectedBid);
      // The store will be updated via polling, so we don't need to manually update state
    } catch (error) {
      console.error('Failed to place bid:', error);
    }
  };

  const getPlayerBids = () => {
    if (!currentSection) return [];
    
    return players.map(player => {
      const bid = sectionBids.find(b => b.playerId === player.id);
      return {
        playerId: player.id,
        playerName: player.name,
        hasBid: bid !== undefined,
        bid: bid && bid.bid >= 0 ? bid.bid : undefined // Only show actual bid if >= 0 (not hidden)
      };
    });
  };

  const playerBids = getPlayerBids();
  const allBidsPlaced = playerBids.every(pb => pb.hasBid);

  // Create bid options array for better keys
  const bidOptions = Array.from({ length: maxBid + 1 }, (_, i) => ({ value: i, label: `${i}` }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Player's Hand */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Cards</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {playerHand.map((card: Card, index: number) => (
            <div key={`${card.suit}-${card.rank}-${index}`} className="transform transition-transform hover:scale-105">
              <CardComponent card={card} size="small" />
            </div>
          ))}
        </div>
        {playerHand.length === 0 && (
          <p className="text-gray-500 text-center">No cards in hand</p>
        )}
      </div>

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Place Your Bid
        </h3>
        <p className="text-gray-600">
          How many tricks will you win this round? Choose wisely!
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Round {maxBid}: Each player gets {maxBid} card{maxBid !== 1 ? 's' : ''}
        </div>
      </div>

      {!hasBid ? (
        <div className="space-y-4">
          {/* Bid Selection */}
          <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
            {bidOptions.map((option) => (
              <button
                key={`bid-${option.value}`}
                type="button"
                onClick={() => setSelectedBid(option.value)}
                className={`aspect-square rounded-lg border-2 font-bold text-lg transition-all ${
                  selectedBid === option.value
                    ? 'border-jossing-primary bg-jossing-primary text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-jossing-secondary hover:bg-jossing-secondary/10'
                }`}
              >
                {option.value}
              </button>
            ))}
          </div>

          {/* Confirm Bid Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handlePlaceBid}
              disabled={selectedBid === null}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                selectedBid !== null
                  ? 'bg-jossing-primary text-white hover:opacity-90 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedBid !== null 
                ? `Bid ${selectedBid} Trick${selectedBid !== 1 ? 's' : ''}` 
                : 'Select a Bid'
              }
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            💡 Remember: You must win exactly your bid to score points!
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-2xl mb-2">✅</div>
            <h4 className="text-lg font-semibold text-green-800">
              Bid Placed: {playerBid?.bid} trick{playerBid?.bid !== 1 ? 's' : ''}
            </h4>
            <p className="text-green-600">
              Waiting for other players...
            </p>
          </div>
        </div>
      )}

      {/* Bid Status */}
      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Bidding Status</h4>
        {!allBidsPlaced && (
          <div className="mb-3 text-sm text-gray-600 text-center">
            💡 Bids are hidden until all players have placed their bids
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {playerBids.map((playerBidInfo) => (
            <div
              key={playerBidInfo.playerId}
              className={`p-2 rounded border text-center text-sm ${
                playerBidInfo.hasBid
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <div className="font-medium">{playerBidInfo.playerName}</div>
              <div>
                {playerBidInfo.hasBid ? (
                  playerBidInfo.bid !== undefined ? (
                    `Bid: ${playerBidInfo.bid}`
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <span className="text-green-600">✅</span>
                      <span>Bid placed</span>
                    </span>
                  )
                ) : (
                  'Thinking...'
                )}
              </div>
            </div>
          ))}
        </div>

        {allBidsPlaced && (
          <div className="mt-4 text-center">
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-blue-800 font-medium">
                🎯 All bids are in! Starting the playing phase...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
