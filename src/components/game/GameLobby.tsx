"use client";

import type { GameSession, Player } from "@/types/game";
import { useState } from "react";

interface GameLobbyProps {
	session: GameSession;
	players: Player[];
	currentPlayerId: string;
	onStartGame: () => void;
	onLeaveGame: () => void;
}

export function GameLobby({
	session,
	players,
	currentPlayerId,
	onStartGame,
	onLeaveGame,
}: GameLobbyProps) {
	const [copySuccess, setCopySuccess] = useState(false);
	const currentPlayer = players.find((p) => p.id === currentPlayerId);
	const isAdmin = currentPlayer?.isAdmin || false;
	const canStart = players.length >= 2 && isAdmin;

	const copyGameCode = async () => {
		try {
			await navigator.clipboard.writeText(session.id);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) {
			console.error("Failed to copy game code:", err);
		}
	};

	return (
		<div className="min-h-screen bg-jossing-play p-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								🃏 Game Lobby
							</h1>
							<p className="text-gray-600">Waiting for players to join...</p>
						</div>
						<button
							type="button"
							onClick={onLeaveGame}
							className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
						>
							Leave Game
						</button>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					{/* Game Info */}
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Game Settings
						</h2>

						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-gray-600">Game Code:</span>
								<div className="flex items-center space-x-2">
									<span className="font-mono font-bold text-lg">
										{session.id}
									</span>
									<button
										type="button"
										onClick={copyGameCode}
										className="bg-glaucous text-white px-2 py-1 rounded text-sm hover:opacity-90 transition-opacity"
									>
										{copySuccess ? "✅" : "📋"}
									</button>
								</div>
							</div>

							<div className="flex justify-between">
								<span className="text-gray-600">Game Type:</span>
								<span className="font-semibold">
									{session.gameType === "up_and_down"
										? "Up and Down"
										: "Up Only"}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="text-gray-600">Scoring:</span>
								<span className="font-semibold">
									{session.scoringSystem === "classic"
										? "Classic (10 + bid)"
										: "Modern (bid × 2 + 10)"}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="text-gray-600">Max Players:</span>
								<span className="font-semibold">{session.maxPlayers}</span>
							</div>
						</div>

						<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<h3 className="font-semibold text-blue-900 mb-2">
								Share this code:
							</h3>
							<p className="text-blue-800 text-sm">
								Friends can join by entering the game code:{" "}
								<span className="font-mono font-bold">{session.id}</span>
							</p>
						</div>
					</div>

					{/* Players */}
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-bold text-gray-900 mb-4">
							Players ({players.length}/{session.maxPlayers})
						</h2>

						<div className="space-y-3">
							{players
								.sort((a, b) => a.position - b.position)
								.map((player) => (
									<div
										key={player.id}
										className={`p-4 rounded-lg border-2 transition-colors ${
											player.id === currentPlayerId
												? "border-glaucous bg-glaucous/10"
												: "border-gray-200 bg-gray-50"
										}`}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div
													className={`w-4 h-4 rounded-full ${
														player.isConnected ? "bg-green-500" : "bg-red-500"
													}`}
												/>
												<span className="font-semibold text-lg">
													{player.name}
													{player.id === currentPlayerId && " (You)"}
												</span>
												{player.isAdmin && (
													<span className="bg-royal-blue text-white px-2 py-1 rounded text-sm font-medium">
														Admin
													</span>
												)}
											</div>
											<div className="text-sm text-gray-600">
												Seat {player.position}
											</div>
										</div>
									</div>
								))}

							{/* Empty slots */}
							{Array.from(
								{ length: session.maxPlayers - players.length },
								(_, i) => (
									<div
										key={`empty-${
											// biome-ignore lint/suspicious/noArrayIndexKey: We have no keys for empty slots
											i
										}`}
										className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
									>
										<div className="flex items-center justify-center text-gray-400">
											<span>Waiting for player...</span>
										</div>
									</div>
								),
							)}
						</div>

						{/* Start Game Button */}
						<div className="mt-6">
							{isAdmin ? (
								<button
									type="button"
									onClick={onStartGame}
									disabled={!canStart}
									className={`w-full py-3 rounded-lg font-semibold text-lg transition-all ${
										canStart
											? "bg-glaucous text-white hover:opacity-90 shadow-lg hover:shadow-xl"
											: "bg-gray-300 text-gray-500 cursor-not-allowed"
									}`}
								>
									{players.length < 2
										? `Need ${2 - players.length} more player${
												2 - players.length !== 1 ? "s" : ""
											} to start`
										: "Start Game"}
								</button>
							) : (
								<div className="text-center p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
									<p className="text-yellow-800">
										Waiting for the admin to start the game...
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Game Rules Reminder */}
				<div className="mt-6 bg-white rounded-lg shadow-lg p-6">
					<h3 className="text-lg font-bold text-gray-900 mb-3">
						🎯 Quick Reminder
					</h3>
					<div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
						<div>
							<h4 className="font-semibold text-gray-900 mb-1">Objective:</h4>
							<p>
								Bid exactly how many tricks you&apos;ll win. Hit your bid
								exactly to score!
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-1">Scoring:</h4>
							<p>Exact bid = 10 + bid points. Any other result = 0 points.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
