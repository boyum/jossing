'use client';

import { useState } from 'react';

// Scoring utility functions
const calculateScore = (bid: number, tricks: number): number => {
  const isFailure = bid !== tricks;
  if (isFailure) {
    return 0;
  }
  return 10 + bid;
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
    description: 'When you bid exactly what you won - you get 10 + bid points!'
  },
  {
    id: 'under-bid',
    name: 'Underbid',
    bid: 2,
    tricksWon: 4,
    trumpSuit: 'diamonds',
    description: 'Won more than bid - you get zero points'
  },
  {
    id: 'over-bid',
    name: 'Overbid',
    bid: 4,
    tricksWon: 2,
    trumpSuit: 'clubs',
    description: 'Won fewer than bid - you get zero points'
  },
  {
    id: 'zero-bid',
    name: 'Zero Bid Success',
    bid: 0,
    tricksWon: 0,
    trumpSuit: 'spades',
    description: 'Successfully bid zero and won no tricks - you get 10 points!'
  },
  {
    id: 'zero-bid-fail',
    name: 'Zero Bid Failure',
    bid: 0,
    tricksWon: 1,
    trumpSuit: 'hearts',
    description: 'Failed zero bid - you get zero points'
  }
];

export default function ScoreCalculator() {
  const [selectedExample, setSelectedExample] = useState<ScoreExample>(scoreExamples[0]);
  const [customBid, setCustomBid] = useState(2);
  const [customTricks, setCustomTricks] = useState(2);
  const [showCustom, setShowCustom] = useState(false);

  const getScoreBreakdown = (bid: number, tricks: number) => {
    const isExact = bid === tricks;
    const finalScore = calculateScore(bid, tricks);
    
    return {
      isExact,
      finalScore
    };
  };

  const currentScore = showCustom 
    ? getScoreBreakdown(customBid, customTricks)
    : getScoreBreakdown(selectedExample.bid, selectedExample.tricksWon);

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
          className={`px-4 py-2 rounded transition-all ${
            !showCustom 
              ? 'text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={{ backgroundColor: !showCustom ? '#496DDB' : undefined }}
        >
          Examples
        </button>
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className={`px-4 py-2 rounded transition-all ${
            showCustom 
              ? 'text-white shadow-md' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          style={{ backgroundColor: showCustom ? '#C95D63' : undefined }}
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
                className={`p-3 text-left rounded border transition-all hover:shadow-md ${
                  selectedExample.id === example.id
                    ? 'text-white shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                style={{
                  backgroundColor: selectedExample.id === example.id ? '#717EC3' : undefined,
                  borderColor: selectedExample.id === example.id ? '#717EC3' : undefined,
                }}
              >
                <div className="font-medium">{example.name}</div>
                <div className={`text-sm ${selectedExample.id === example.id ? 'text-blue-100' : 'text-gray-600'}`}>
                  Bid {example.bid}, Won {example.tricksWon}
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-4 p-3 rounded border-2" style={{ backgroundColor: '#F8F9FA', borderColor: '#AE8799' }}>
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
            <span>Bid Achieved:</span>
            <span className="font-mono">{currentTricks === currentBid ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Score Calculation:</span>
            <span className="font-mono text-sm">
              {currentTricks === currentBid ? `10 + ${currentBid} = ${currentScore.finalScore}` : '0'}
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
        <h5 className="font-medium text-blue-900 mb-2">Classic Jøssing Scoring:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Exact bid:</strong> 10 + bid points</li>
          <li>• <strong>Any other result:</strong> 0 points</li>
          <li>• Example: Bid 3, win 3 tricks = 13 points</li>
          <li>• Example: Bid 3, win 2 or 4 tricks = 0 points</li>
        </ul>
      </div>
    </div>
  );
}
