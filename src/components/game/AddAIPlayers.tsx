'use client';

import { useState } from 'react';
import { AIDifficulty } from '@/types/game';

interface AddAIPlayersProps {
  onAddAI: (difficulty?: AIDifficulty) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AddAIPlayers({ onAddAI, isLoading = false, disabled = false }: AddAIPlayersProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>(AIDifficulty.EASY);
  const [showDifficultyOptions, setShowDifficultyOptions] = useState(false);

  const handleAddAI = async () => {
    setIsAdding(true);
    try {
      await onAddAI(selectedDifficulty);
    } finally {
      setIsAdding(false);
    }
  };

  const difficultyOptions = [
    {
      value: AIDifficulty.EASY,
      label: 'Easy',
      description: 'Conservative play, great for beginners',
      emoji: '😊'
    },
    {
      value: AIDifficulty.MEDIUM,
      label: 'Medium',
      description: 'Strategic play with card counting',
      emoji: '🤔'
    },
    {
      value: AIDifficulty.HARD,
      label: 'Hard',
      description: 'Expert-level analysis and optimal play',
      emoji: '🧠'
    }
  ];

  const selectedOption = difficultyOptions.find(opt => opt.value === selectedDifficulty) || difficultyOptions[0];

  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
      <div className="text-4xl mb-3">🤖</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Need More Players?
      </h3>
      <p className="text-gray-600 mb-4">
        Add AI players to fill empty spots and start the game faster!
      </p>

      {/* AI Difficulty Selection */}
      <div className="mb-4">
        <div className="block text-sm font-medium text-gray-700 mb-2">
          AI Difficulty
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDifficultyOptions(!showDifficultyOptions)}
            disabled={disabled || isLoading || isAdding}
            className="w-full px-4 py-2 text-left bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>{selectedOption.emoji}</span>
                <span className="font-medium">{selectedOption.label}</span>
                <span className="text-sm text-gray-500">- {selectedOption.description}</span>
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showDifficultyOptions ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Toggle dropdown</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          {showDifficultyOptions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedDifficulty(option.value);
                    setShowDifficultyOptions(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    selectedDifficulty === option.value ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{option.emoji}</span>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <button
        type="button"
        onClick={handleAddAI}
        disabled={disabled || isLoading || isAdding}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          disabled || isLoading || isAdding
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isAdding ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding {selectedOption.label} AI Players...
          </span>
        ) : (
          `Add ${selectedOption.label} AI Players`
        )}
      </button>

      <div className="mt-3 text-sm text-gray-500">
        <p>{selectedOption.label} AI: {selectedOption.description}</p>
      </div>
    </div>
  );
}

interface AIPlayerIndicatorProps {
  playerName: string;
  isThinking?: boolean;
  thought?: string;
}

export function AIPlayerIndicator({ 
  playerName, 
  isThinking = false, 
  thought = "Thinking..." 
}: AIPlayerIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <span className="text-blue-600">🤖</span>
        <span className="font-medium text-blue-600">{playerName}</span>
      </div>
      
      {isThinking && (
        <div className="flex items-center gap-1 text-gray-500">
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          <span className="italic">{thought}</span>
        </div>
      )}
    </div>
  );
}
