'use client';

import { useState } from 'react';

// Scoring utility functions
const calculateTrickScore = (tricks: number): number => tricks * 10;

const calculateBidBonus = (bid: number, tricks: number): number => {
  if (bid === 0) {
    return tricks === 0 ? 50 : -50;
  }
  
  if (bid === tricks) {
    return bid * 10; // 10 points per bid trick when exact
  }
  
  if (tricks < bid) {
    return (tricks - bid) * 10; // Penalty for missing tricks
  }
  
  return 0; // No bonus for overbidding
};

const calculateFinalScore = (bid: number, tricks: number): number => {
  return calculateTrickScore(tricks) + calculateBidBonus(bid, tricks);
};

interface ScoreExample {
  id: string;
  name: string;
  bid: number;
  tricksWon: number;
  trumpSuit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  description: string;
}

const scoreExamples: ScoreExample[] = [
  {
    id: 'exact-bid',
    name: 'Perfect Bid',
    bid: 3,
    tricksWon: 3,
    trumpSuit: 'hearts',
    description: 'When you bid exactly what you won - you get bonus points!'
  },
  {
    id: 'under-bid',
    name: 'Underbid',
    bid: 2,
    tricksWon: 4,
    trumpSuit: 'diamonds',
    description: 'Won more than bid - still get points for tricks, but no bonus'
  },
  {
    id: 'over-bid',
    name: 'Overbid',
    bid: 4,
    tricksWon: 2,
    trumpSuit: 'clubs',
    description: 'Won fewer than bid - negative points!'
  },
  {
    id: 'zero-bid',
    name: 'Zero Bid Success',
    bid: 0,
    tricksWon: 0,
    trumpSuit: 'spades',
    description: 'Successfully bid zero and won no tricks - big bonus!'
  },
  {
    id: 'zero-bid-fail',
    name: 'Zero Bid Failure',
    bid: 0,
    tricksWon: 1,
    trumpSuit: 'hearts',
    description: 'Failed zero bid - penalty points'
  }
];

export default function ScoreCalculator() {
  const [selectedExample, setSelectedExample] = useState<ScoreExample>(scoreExamples[0]);
  const [customBid, setCustomBid] = useState(2);
  const [customTricks, setCustomTricks] = useState(2);
  const [showCustom, setShowCustom] = useState(false);

  const calculateScore = (bid: number, tricks: number) => {
    const trickScore = calculateTrickScore(tricks);
    const bidBonus = calculateBidBonus(bid, tricks);
    const finalScore = calculateFinalScore(bid, tricks);
    
    return {
      trickScore,
      bidBonus,
      finalScore
    };
  };

  const currentScore = showCustom 
    ? calculateScore(customBid, customTricks)
    : calculateScore(selectedExample.bid, selectedExample.tricksWon);

  const currentBid = showCustom ? customBid : selectedExample.bid;
  const currentTricks = showCustom ? customTricks : selectedExample.tricksWon;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Score Calculator</h3>
      <p className="text-gray-600 mb-6">
        Understanding how scoring works is key to strategic bidding. Try different scenarios below!
      </p>

      {/* Toggle between examples and custom */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setShowCustom(false)}
          className={`px-4 py-2 rounded transition-colors ${
            !showCustom 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Examples
        </button>
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className={`px-4 py-2 rounded transition-colors ${
            showCustom 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Custom
        </button>
      </div>

      {!showCustom ? (
        /* Example scenarios */
        <div className="mb-6">
          <h4 className="font-medium mb-3">Choose a scenario:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {scoreExamples.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => setSelectedExample(example)}
                className={`p-3 text-left rounded border transition-colors ${
                  selectedExample.id === example.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{example.name}</div>
                <div className="text-sm text-gray-600">
                  Bid {example.bid}, Won {example.tricksWon}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-sm text-gray-700">{selectedExample.description}</p>
          </div>
        </div>
      ) : (
        /* Custom input */
        <div className="mb-6">
          <h4 className="font-medium mb-3">Enter your own scenario:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="custom-bid" className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid
              </label>
              <input
                id="custom-bid"
                type="number"
                min="0"
                max="13"
                value={customBid}
                onChange={(e) => setCustomBid(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="custom-tricks" className="block text-sm font-medium text-gray-700 mb-1">
                Tricks Won
              </label>
              <input
                id="custom-tricks"
                type="number"
                min="0"
                max="13"
                value={customTricks}
                onChange={(e) => setCustomTricks(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Score breakdown */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Score Breakdown</h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Bid:</span>
            <span className="font-mono">{currentBid}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Tricks Won:</span>
            <span className="font-mono">{currentTricks}</span>
          </div>
          
          <hr className="border-gray-300" />
          
          <div className="flex justify-between items-center">
            <span>Base Points (10 × tricks):</span>
            <span className="font-mono">+{currentScore.trickScore}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Bid Bonus/Penalty:</span>
            <span className={`font-mono ${currentScore.bidBonus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentScore.bidBonus >= 0 ? '+' : ''}{currentScore.bidBonus}
            </span>
          </div>
          
          <hr className="border-gray-300" />
          
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total Score:</span>
            <span className={`font-mono ${currentScore.finalScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentScore.finalScore >= 0 ? '+' : ''}{currentScore.finalScore}
            </span>
          </div>
        </div>
      </div>

      {/* Scoring rules reminder */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Scoring Rules:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Base: 10 points per trick won</li>
          <li>• Exact bid: +10 bonus per bid trick</li>
          <li>• Zero bid success: +50 bonus</li>
          <li>• Overbid: -10 penalty per missed trick</li>
          <li>• Zero bid failure: -50 penalty</li>
        </ul>
      </div>
    </div>
  );
}
