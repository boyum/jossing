'use client';

import { useState } from 'react';
import { CardComponent } from '@/components/ui/card';
import { Card, Suit, Rank, RANK_VALUES } from '@/types/game';

const suitSymbols: Record<Suit, string> = {
  [Suit.HEARTS]: '♥',
  [Suit.DIAMONDS]: '♦',
  [Suit.CLUBS]: '♣',
  [Suit.SPADES]: '♠'
};

const suitColors: Record<Suit, string> = {
  [Suit.HEARTS]: 'text-red-500',
  [Suit.DIAMONDS]: 'text-red-500',
  [Suit.CLUBS]: 'text-black',
  [Suit.SPADES]: 'text-black'
};

const demoCards: Card[] = [
  { suit: Suit.HEARTS, rank: Rank.ACE, value: RANK_VALUES[Rank.ACE] },
  { suit: Suit.DIAMONDS, rank: Rank.KING, value: RANK_VALUES[Rank.KING] },
  { suit: Suit.CLUBS, rank: Rank.QUEEN, value: RANK_VALUES[Rank.QUEEN] },
  { suit: Suit.SPADES, rank: Rank.JACK, value: RANK_VALUES[Rank.JACK] },
  { suit: Suit.HEARTS, rank: Rank.SEVEN, value: RANK_VALUES[Rank.SEVEN] },
  { suit: Suit.DIAMONDS, rank: Rank.EIGHT, value: RANK_VALUES[Rank.EIGHT] },
  { suit: Suit.CLUBS, rank: Rank.NINE, value: RANK_VALUES[Rank.NINE] },
  { suit: Suit.SPADES, rank: Rank.TEN, value: RANK_VALUES[Rank.TEN] }
];

interface TrickExample {
  id: string;
  name: string;
  leadCard: Card;
  followCards: Card[];
  trumpSuit: Suit;
  winner: number;
  explanation: string;
}

const trickExamples: TrickExample[] = [
  {
    id: 'trump-wins',
    name: 'Trump Wins',
    leadCard: { suit: Suit.DIAMONDS, rank: Rank.ACE, value: RANK_VALUES[Rank.ACE] },
    followCards: [
      { suit: Suit.DIAMONDS, rank: Rank.KING, value: RANK_VALUES[Rank.KING] },
      { suit: Suit.DIAMONDS, rank: Rank.QUEEN, value: RANK_VALUES[Rank.QUEEN] },
      { suit: Suit.HEARTS, rank: Rank.SEVEN, value: RANK_VALUES[Rank.SEVEN] }
    ],
    trumpSuit: Suit.HEARTS,
    winner: 3,
    explanation: 'Even a low trump card beats high cards of other suits'
  },
  {
    id: 'follow-suit',
    name: 'Follow Suit',
    leadCard: { suit: Suit.SPADES, rank: Rank.JACK, value: RANK_VALUES[Rank.JACK] },
    followCards: [
      { suit: Suit.SPADES, rank: Rank.ACE, value: RANK_VALUES[Rank.ACE] },
      { suit: Suit.SPADES, rank: Rank.TEN, value: RANK_VALUES[Rank.TEN] },
      { suit: Suit.SPADES, rank: Rank.EIGHT, value: RANK_VALUES[Rank.EIGHT] }
    ],
    trumpSuit: Suit.HEARTS,
    winner: 1,
    explanation: 'When following suit, highest card wins (Ace beats Jack)'
  },
  {
    id: 'cant-follow',
    name: "Can't Follow Suit",
    leadCard: { suit: Suit.CLUBS, rank: Rank.ACE, value: RANK_VALUES[Rank.ACE] },
    followCards: [
      { suit: Suit.DIAMONDS, rank: Rank.KING, value: RANK_VALUES[Rank.KING] },
      { suit: Suit.HEARTS, rank: Rank.SEVEN, value: RANK_VALUES[Rank.SEVEN] },
      { suit: Suit.SPADES, rank: Rank.QUEEN, value: RANK_VALUES[Rank.QUEEN] }
    ],
    trumpSuit: Suit.HEARTS,
    winner: 2,
    explanation: 'Only trump can beat the lead suit when you cannot follow'
  },
  {
    id: 'highest-lead',
    name: 'Highest Lead Wins',
    leadCard: { suit: Suit.DIAMONDS, rank: Rank.ACE, value: RANK_VALUES[Rank.ACE] },
    followCards: [
      { suit: Suit.CLUBS, rank: Rank.KING, value: RANK_VALUES[Rank.KING] },
      { suit: Suit.SPADES, rank: Rank.QUEEN, value: RANK_VALUES[Rank.QUEEN] },
      { suit: Suit.HEARTS, rank: Rank.JACK, value: RANK_VALUES[Rank.JACK] }
    ],
    trumpSuit: Suit.CLUBS,
    winner: 0,
    explanation: 'Lead card wins when no one can follow suit or play trump'
  }
];

export default function TrumpSuitDemo() {
  const [selectedTrumpSuit, setSelectedTrumpSuit] = useState<Suit>(Suit.HEARTS);
  const [selectedExample, setSelectedExample] = useState<TrickExample>(trickExamples[0]);
  const [currentStep, setCurrentStep] = useState(0);

  const sortedCards = [...demoCards].sort((a, b) => {
    // Trump cards first
    if (a.suit === selectedTrumpSuit && b.suit !== selectedTrumpSuit) return -1;
    if (b.suit === selectedTrumpSuit && a.suit !== selectedTrumpSuit) return 1;
    
    // Then by suit
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    
    // Then by rank (simplified)
    const rankOrder = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  });

  const allTrickCards = [selectedExample.leadCard, ...selectedExample.followCards];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Trump Suit & Trick Taking</h3>
      <p className="text-gray-600 mb-6">
        The trump suit is the most powerful suit in each section. Learn how it affects trick-taking!
      </p>

      {/* Trump suit selector */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Select Trump Suit:</h4>
        <div className="flex gap-2">
          {([Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES] as Suit[]).map((suit) => (
            <button
              key={suit}
              type="button"
              onClick={() => setSelectedTrumpSuit(suit)}
              className={`px-4 py-2 rounded border transition-colors ${
                selectedTrumpSuit === suit
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className={`text-2xl ${suitColors[suit]}`}>
                {suitSymbols[suit]}
              </span>
              <span className="ml-2 capitalize">{suit}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card demonstration */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Card Power with Trump as {selectedTrumpSuit}:</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-wrap justify-center gap-2">
            {sortedCards.map((card) => (
              <div key={`${card.suit}-${card.rank}`} className="relative">
                <CardComponent
                  card={card}
                  size="small"
                  className={card.suit === selectedTrumpSuit ? 'ring-2 ring-yellow-400' : ''}
                />
                {card.suit === selectedTrumpSuit && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs px-1 rounded">
                    TRUMP
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center">
            Trump cards (highlighted) always beat non-trump cards
          </p>
        </div>
      </div>

      {/* Trick examples */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Trick Taking Examples:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {trickExamples.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => {
                setSelectedExample(example);
                setCurrentStep(0);
              }}
              className={`p-3 text-left rounded border transition-colors ${
                selectedExample.id === example.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">{example.name}</div>
              <div className="text-sm text-gray-600">
                Trump: {suitSymbols[example.trumpSuit]} {example.trumpSuit}
              </div>
            </button>
          ))}
        </div>

        {/* Trick visualization */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h5 className="font-medium">Trick: {selectedExample.name}</h5>
            <div className="text-sm text-gray-600">
              Trump: <span className={suitColors[selectedExample.trumpSuit]}>
                {suitSymbols[selectedExample.trumpSuit]} {selectedExample.trumpSuit}
              </span>
            </div>
          </div>

          {/* Play step controls */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(Math.min(allTrickCards.length, currentStep + 1))}
              disabled={currentStep === allTrickCards.length}
              className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Step {currentStep} of {allTrickCards.length}
            </span>
          </div>

          {/* Cards played so far */}
          <div className="flex justify-center gap-3 mb-4">
            {allTrickCards.slice(0, currentStep).map((card, cardIndex) => (
              <div key={`${card.suit}-${card.rank}-player-${cardIndex}`} className="text-center">
                <CardComponent
                  card={card}
                  size="medium"
                  className={`${
                    card.suit === selectedExample.trumpSuit ? 'ring-2 ring-yellow-400' : ''
                  } ${
                    cardIndex === selectedExample.winner ? 'ring-2 ring-green-500' : ''
                  }`}
                />
                <div className="text-xs mt-1 text-gray-600">
                  Player {cardIndex + 1}
                  {cardIndex === 0 && ' (Lead)'}
                  {cardIndex === selectedExample.winner && currentStep === allTrickCards.length && ' (Winner)'}
                </div>
              </div>
            ))}
          </div>

          {/* Current step explanation */}
          {currentStep === 0 && (
            <p className="text-sm text-gray-700 text-center">
              Click &quot;Next&quot; to see the trick played out card by card
            </p>
          )}
          
          {currentStep > 0 && currentStep < allTrickCards.length && (
            <p className="text-sm text-gray-700 text-center">
              {currentStep === 1 && `Player 1 leads with ${allTrickCards[0].rank} of ${allTrickCards[0].suit}`}
              {currentStep > 1 && `Player ${currentStep} plays ${allTrickCards[currentStep - 1].rank} of ${allTrickCards[currentStep - 1].suit}`}
            </p>
          )}
          
          {currentStep === allTrickCards.length && (
            <div className="text-center">
              <p className="text-sm font-medium text-green-700 mb-2">
                Player {selectedExample.winner + 1} wins this trick!
              </p>
              <p className="text-sm text-gray-700">
                {selectedExample.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rules reminder */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Trick-Taking Rules:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Must follow the lead suit if you can</li>
          <li>• If you can&apos;t follow suit, you may play any card</li>
          <li>• Trump cards always beat non-trump cards</li>
          <li>• Highest card of the lead suit wins (if no trump played)</li>
          <li>• Highest trump card wins (if trump played)</li>
        </ul>
      </div>
    </div>
  );
}
