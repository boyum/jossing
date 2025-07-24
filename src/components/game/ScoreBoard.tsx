'use client';

import type { Player } from '@/types/game';

interface ScoreBoardProps {
  players: Player[];
  sectionScores: Record<string, number>;
  totalScores: Record<string, number>;
  currentSection: number;
}

export function ScoreBoard({ players, sectionScores, totalScores, currentSection }: ScoreBoardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-3">Scoreboard</h3>
      
      <div className="space-y-3">
        {players
          .sort((a, b) => (totalScores[b.id] || 0) - (totalScores[a.id] || 0))
          .map((player, index) => (
            <div
              key={player.id}
              className={`p-3 rounded-lg border ${
                index === 0 && totalScores[player.id] > 0
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {index === 0 && totalScores[player.id] > 0 && (
                    <span className="text-lg">👑</span>
                  )}
                  <span className="font-medium">{player.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {totalScores[player.id] || 0}
                  </div>
                  {sectionScores[player.id] !== undefined && (
                    <div className="text-sm text-gray-600">
                      +{sectionScores[player.id]} this round
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600 text-center">
          Round {currentSection} of 10
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-jossing-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentSection / 10) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
