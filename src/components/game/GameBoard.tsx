'use client';

import { useGameStore } from '@/store/game-store';
import { SectionPhase, GamePhase } from '@/types/game';
import { PlayerList } from './PlayerList';
import { PlayerHand } from './PlayerHand';
import { TrickArea } from './TrickArea';
import { BiddingPhase } from './BiddingPhase';
import { ScoreBoard } from './ScoreBoard';
import { TrumpDisplay } from './TrumpDisplay';
import { FinalGameScreen } from './FinalGameScreen';

export function GameBoard() {
  const {
    session,
    players,
    currentSection,
    playerHand,
    currentTrick,
    sectionScores,
    totalScores,
    playerId,
    isPlayerTurn,
    resetGameState
  } = useGameStore();

  // Show final game screen if game is finished
  if (session && session.gamePhase === GamePhase.FINISHED) {
    return (
      <FinalGameScreen
        session={session}
        players={players}
        totalScores={totalScores}
        onNewGame={() => {
          resetGameState();
          window.location.href = '/play';
        }}
        onLeaveGame={() => {
          resetGameState();
          window.location.href = '/';
        }}
      />
    );
  }

  if (!session || !currentSection) {
    return (
      <div className="min-h-screen bg-jossing-play flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Game</h2>
          <p className="text-gray-600">Setting up the game...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === playerId);
  const isDealer = currentPlayer?.position === currentSection.dealerPosition;

  return (
    <div className="min-h-screen bg-jossing-play p-4">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Jøssing Game - Round {currentSection.sectionNumber}
              </h1>
              <p className="text-gray-600">
                {currentSection.phase === SectionPhase.BIDDING && 'Bidding Phase'}
                {currentSection.phase === SectionPhase.PLAYING && 'Playing Phase'}
                {currentSection.phase === SectionPhase.DEALING && 'Dealing Cards...'}
                {currentSection.phase === SectionPhase.COMPLETED && 'Round Complete'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Cards this round: {currentSection.sectionNumber}
              </p>
              {isDealer && (
                <p className="text-sm text-jossing-primary font-semibold">
                  🃏 You are the dealer
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Sidebar - Players and Scores */}
          <div className="lg:col-span-1 space-y-4">
            <PlayerList players={players} currentPlayerId={playerId} />
            <ScoreBoard 
              players={players} 
              sectionScores={sectionScores}
              totalScores={totalScores}
              currentSection={currentSection.sectionNumber}
            />
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Trump Display */}
            <TrumpDisplay 
              trumpSuit={currentSection.trumpSuit}
              trumpCardRank={currentSection.trumpCardRank}
            />

            {/* Phase-specific content */}
            {currentSection.phase === SectionPhase.BIDDING && playerId && (
              <BiddingPhase 
                maxBid={currentSection.sectionNumber}
                playerId={playerId}
              />
            )}

            {currentSection.phase === SectionPhase.PLAYING && playerId && (
              <>
                {/* Trick Area */}
                <TrickArea 
                  trick={currentTrick}
                  players={players}
                  trumpSuit={currentSection.trumpSuit}
                />

                {/* Player's Hand */}
                <PlayerHand 
                  cards={playerHand}
                  isPlayerTurn={isPlayerTurn}
                  playerId={playerId}
                  currentTrick={currentTrick}
                  trumpSuit={currentSection.trumpSuit}
                />
              </>
            )}

            {currentSection.phase === SectionPhase.COMPLETED && (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Round {currentSection.sectionNumber} Complete!
                </h3>
                <p className="text-gray-600 mb-4">
                  Waiting for next round to begin...
                </p>
                {currentSection.sectionNumber === 10 && (
                  <div className="bg-jossing-primary text-white p-4 rounded-lg">
                    <h4 className="text-xl font-bold">Game Complete!</h4>
                    <p>Final scores are being calculated...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
