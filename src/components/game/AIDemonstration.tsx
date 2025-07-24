'use client';

import { useState } from 'react';
import { AIDifficulty } from '@/types/game';
import { getDifficultyDisplayName, getDifficultyDescription } from '@/lib/ai/ai-manager';

interface AIDemonstrationProps {
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
  selectedDifficulty?: AIDifficulty;
}

export function AIDemonstration({ onSelectDifficulty, selectedDifficulty }: AIDemonstrationProps) {
  const [showDetails, setShowDetails] = useState(false);

  const difficulties = [
    {
      value: AIDifficulty.EASY,
      emoji: '😊',
      color: 'green',
      features: [
        'Conservative bidding strategy',
        'Basic card play logic',
        '20% random decisions for unpredictability',
        'Great for learning the game'
      ]
    },
    {
      value: AIDifficulty.MEDIUM,
      emoji: '🤔',
      color: 'blue',
      features: [
        'Strategic bidding with position awareness',
        'Card counting and memory',
        'Basic trump management',
        '10% random decisions'
      ]
    },
    {
      value: AIDifficulty.HARD,
      emoji: '🧠',
      color: 'purple',
      features: [
        'Expert-level hand analysis',
        'Advanced opponent modeling',
        'Optimal card play strategy',
        'Only 3% random decisions'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">AI Opponents</h3>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="grid gap-3">
        {difficulties.map((difficulty) => {
          const isSelected = selectedDifficulty === difficulty.value;
          const colorClasses = {
            green: {
              border: isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-green-200 hover:border-green-300',
              bg: isSelected ? 'bg-green-50' : 'bg-white hover:bg-green-50',
              text: 'text-green-700',
              badge: 'bg-green-100 text-green-800'
            },
            blue: {
              border: isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-200 hover:border-blue-300',
              bg: isSelected ? 'bg-blue-50' : 'bg-white hover:bg-blue-50',
              text: 'text-blue-700',
              badge: 'bg-blue-100 text-blue-800'
            },
            purple: {
              border: isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-200 hover:border-purple-300',
              bg: isSelected ? 'bg-purple-50' : 'bg-white hover:bg-purple-50',
              text: 'text-purple-700',
              badge: 'bg-purple-100 text-purple-800'
            }
          }[difficulty.color] || {
            border: 'border-gray-200',
            bg: 'bg-white',
            text: 'text-gray-700',
            badge: 'bg-gray-100 text-gray-800'
          };

          return (
            <button
              key={difficulty.value}
              type="button"
              onClick={() => onSelectDifficulty(difficulty.value)}
              className={`p-4 border-2 rounded-lg transition-all text-left ${colorClasses.border} ${colorClasses.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{difficulty.emoji}</span>
                  <div>
                    <h4 className={`font-semibold ${colorClasses.text}`}>
                      {getDifficultyDisplayName(difficulty.value)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getDifficultyDescription(difficulty.value)}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className={`px-2 py-1 rounded text-xs font-medium ${colorClasses.badge}`}>
                    Selected
                  </div>
                )}
              </div>

              {showDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Features:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {difficulty.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDifficulty && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {difficulties.find(d => d.value === selectedDifficulty)?.emoji}
            </span>
            <span className="font-medium text-gray-800">
              {getDifficultyDisplayName(selectedDifficulty)} AI Selected
            </span>
          </div>
          <p className="text-sm text-gray-600">
            This AI will be used when adding computer opponents to your game.
          </p>
        </div>
      )}
    </div>
  );
}
