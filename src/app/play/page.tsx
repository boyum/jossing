'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PlayPage() {
  const [mode, setMode] = useState<'setup' | 'demo'>('setup');
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: playerName,
          gameType: 'up-and-down',
          scoringSystem: 'classic',
          maxPlayers: 4
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Game created! Share this code with friends: ${data.sessionId}`);
        setMode('demo');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      alert('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !gameCode.trim()) return;

    setIsJoining(true);
    try {
      const response = await fetch(`/api/sessions/${gameCode.toUpperCase()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully joined game as ${playerName}!`);
        setMode('demo');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (err) {
      alert('Failed to join game. Please check the game code and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (mode === 'demo') {
    return (
      <div className="min-h-screen bg-jossing-play p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-6">🎮</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Game Demo Active!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              You've successfully created/joined a game! The full multiplayer experience 
              is currently being finalized. For now, explore our comprehensive tutorials 
              to master the rules and strategy.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-jossing-primary/10 border-2 border-jossing-primary rounded-lg p-6">
                <h3 className="text-xl font-bold text-jossing-primary mb-2">✅ Backend Working</h3>
                <p className="text-gray-700">Session management, player joining, and game logic are functional!</p>
              </div>
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-yellow-700 mb-2">🔄 Coming Soon</h3>
                <p className="text-gray-700">Real-time gameplay with WebSocket connections is being added.</p>
              </div>
            </div>

            <div className="space-y-4">
              <Link 
                href="/how-to-play"
                className="block bg-jossing-primary hover:opacity-90 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                🎓 Master the Rules While You Wait
              </Link>
              <button
                type="button"
                onClick={() => setMode('setup')}
                className="block w-full bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                🔄 Try Another Game
              </button>
              <Link 
                href="/"
                className="block bg-muted hover:opacity-90 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                🏠 Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jossing-play flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🃏</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Join a Jøssing Game
          </h1>
          <p className="text-gray-600">
            Create a new game or join an existing one
          </p>
        </div>

        <div className="space-y-6">
          {/* Create Game */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Create New Game</h3>
            <form onSubmit={handleCreateGame} className="space-y-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jossing-primary focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isCreating || !playerName.trim()}
                className={`w-full py-2 rounded-lg font-semibold transition-all ${
                  isCreating || !playerName.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-jossing-primary text-white hover:opacity-90'
                }`}
              >
                {isCreating ? 'Creating...' : 'Create Game'}
              </button>
            </form>
          </div>

          {/* Join Game */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Join Existing Game</h3>
            <form onSubmit={handleJoinGame} className="space-y-3">
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Game code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jossing-primary focus:border-transparent"
                required
              />
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-jossing-primary focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isJoining || !playerName.trim() || !gameCode.trim()}
                className={`w-full py-2 rounded-lg font-semibold transition-all ${
                  isJoining || !playerName.trim() || !gameCode.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-jossing-secondary text-white hover:opacity-90'
                }`}
              >
                {isJoining ? 'Joining...' : 'Join Game'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Need help? Check out our{' '}
            <Link href="/how-to-play" className="text-jossing-primary hover:underline">
              game rules
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
