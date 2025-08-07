"use client";

import { useGameStore } from "@/store/game-store";
import { BiddingPhase } from "./BiddingPhase";
import { FinalGameScreen } from "./FinalGameScreen";
import { PlayerHand } from "./PlayerHand";
import { PlayerList } from "./PlayerList";
import { ScoreBoard } from "./ScoreBoard";
import { TrickArea } from "./TrickArea";
import { PlayerAvatar } from "./PlayerAvatar";

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
		resetGameState,
	} = useGameStore();

	// Show final game screen if game is finished
	if (session && session.gamePhase === "finished") {
		return (
			<FinalGameScreen
				session={session}
				players={players}
				totalScores={totalScores}
				onNewGame={() => {
					resetGameState();
					window.location.href = "/play";
				}}
				onLeaveGame={() => {
					resetGameState();
					window.location.href = "/";
				}}
			/>
		);
	}

	if (!session || !currentSection || !playerId) {
		return (
			<div className="min-h-screen bg-jossing-play flex items-center justify-center">
				<div className="bg-white rounded-xl shadow-xl p-8 text-center">
					<div className="text-6xl mb-4">⏳</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Waiting for Game
					</h2>
					<p className="text-gray-600">Setting up the game...</p>
				</div>
			</div>
		);
	}

	const currentPlayer = players.find((p) => p.id === playerId);
	const isDealer = currentPlayer?.position === currentSection.dealerPosition;

	// Helper to get avatar positions for semi-circle
	function getAvatarPositions(numPlayers: number) {
		const radius = 120; // px
		const centerX = 200;
		const centerY = 120;
		return Array.from({ length: numPlayers }).map((_, i) => {
			const angle = Math.PI * (i / (numPlayers - 1));
			return {
				left: centerX + radius * Math.cos(angle),
				top: centerY - radius * Math.sin(angle),
			};
		});
	}

	return (
		<div className="min-h-screen bg-jossing-play p-4 flex flex-col items-center justify-center">
			<div className="max-w-4xl w-full mx-auto">
				{/* Game Header */}
				<div className="bg-white rounded-lg shadow-lg p-4 mb-4">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Jøssing Game - Round {currentSection.sectionNumber}
							</h1>
							<p className="text-gray-600">
								{currentSection.phase === "bidding" && "Bidding Phase"}
								{currentSection.phase === "bid_review" && "Bid Review Phase"}
								{currentSection.phase === "playing" && "Playing Phase"}
								{currentSection.phase === "dealing" && "Dealing Cards..."}
								{currentSection.phase === "completed" && "Round Complete"}
							</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-gray-600">
								Cards this round: {currentSection.sectionNumber}
							</p>
							{isDealer && (
								<p className="text-sm text-glaucous font-semibold">
									🃏 You are the dealer
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Central Play Area */}
				<div className="relative flex flex-col items-center justify-center py-8">
					{/* Avatars in semi-circle */}
					<div className="absolute w-full h-64 left-0 top-0 pointer-events-none">
						{players.map((player, idx) => {
							const pos = getAvatarPositions(players.length)[idx];
							return (
								<div
									key={player.id}
									style={{
										position: "absolute",
										left: pos.left,
										top: pos.top,
										transform: "translate(-50%, -50%)",
									}}
								>
									<PlayerAvatar
										name={player.name}
										isCurrent={player.id === playerId}
										score={player.totalScore}
									/>
								</div>
							);
						})}
					</div>

					{/* Trick pile and played cards centered */}
					<div className="z-10 flex flex-col items-center justify-center">
						<TrickArea
							trick={currentTrick}
							players={players}
							trumpSuit={currentSection.trumpSuit}
						/>
					</div>
				</div>

				{/* Player's Hand at the bottom */}
				<div className="mt-8 flex justify-center">
					<PlayerHand
						cards={playerHand}
						isPlayerTurn={isPlayerTurn}
						playerId={playerId}
						currentTrick={currentTrick}
						trumpSuit={currentSection.trumpSuit}
					/>
				</div>

				{/* Phase-specific content */}
				{(currentSection.phase === "bidding" ||
					currentSection.phase === "bid_review") &&
					playerId && (
						<BiddingPhase
							maxBid={currentSection.sectionNumber}
							playerId={playerId}
						/>
					)}

				{currentSection.phase === "playing" && playerId && (
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

				{currentSection.phase === "completed" && (
					<div className="bg-white rounded-lg shadow-lg p-6 text-center">
						<h3 className="text-2xl font-bold text-gray-900 mb-4">
							Round {currentSection.sectionNumber} Complete!
						</h3>
						<p className="text-gray-600 mb-4">
							Waiting for next round to begin...
						</p>
						{currentSection.sectionNumber === 10 && (
							<div className="bg-glaucous text-white p-4 rounded-lg">
								<h4 className="text-xl font-bold">Game Complete!</h4>
								<p>Final scores are being calculated...</p>
							</div>
						)}
					</div>
				)}

				{/* Scoreboard and other components */}
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
				</div>
			</div>
		</div>
	);
}
