'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/game-store';

export function ConnectionStatus() {
  const { isConnected, connectSocket, disconnectSocket } = useGameStore();
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    // Auto-connect on mount
    if (!isConnected && connectionAttempts < 3) {
      connectSocket().catch(() => {
        setConnectionAttempts(prev => prev + 1);
      });
    }
  }, [isConnected, connectSocket, connectionAttempts]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all ${
        isConnected 
          ? 'bg-green-100 border border-green-400 text-green-800'
          : 'bg-red-100 border border-red-400 text-red-800'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {!isConnected && connectionAttempts < 3 && (
            <button
              type="button"
              onClick={() => {
                setConnectionAttempts(0);
                connectSocket();
              }}
              className="text-xs underline hover:no-underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
