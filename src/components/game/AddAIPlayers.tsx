'use client';

import { useState } from 'react';

interface AddAIPlayersProps {
  onAddAI: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AddAIPlayers({ onAddAI, isLoading = false, disabled = false }: AddAIPlayersProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddAI = async () => {
    setIsAdding(true);
    try {
      await onAddAI();
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
      <div className="text-4xl mb-3">🤖</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Need More Players?
      </h3>
      <p className="text-gray-600 mb-4">
        Add AI players to fill empty spots and start the game faster!
      </p>
      
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
            Adding AI Players...
          </span>
        ) : (
          'Add AI Players'
        )}
      </button>

      <div className="mt-3 text-sm text-gray-500">
        <p>AI players make random moves - perfect for beginners!</p>
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
