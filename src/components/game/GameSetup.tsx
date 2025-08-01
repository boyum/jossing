"use client";

import { useState } from "react";
import type { GameType, ScoringSystem } from "@/types/game";

interface GameSetupProps {
	onCreateGame: (config: GameConfig) => void;
	onJoinGame: (sessionId: string, playerName: string) => void;
	isLoading: boolean;
}

interface GameConfig {
	adminName: string;
	gameType: GameType;
	scoringSystem: ScoringSystem;
	maxPlayers: number;
}

export function GameSetup({
	onCreateGame,
	onJoinGame,
	isLoading,
}: GameSetupProps) {
	const [mode, setMode] = useState<"create" | "join">("create");
	const [config, setConfig] = useState<GameConfig>({
		adminName: "",
		gameType: "up_and_down",
		scoringSystem: "classic",
		maxPlayers: 6,
	});
	const [joinSessionId, setJoinSessionId] = useState("");
	const [joinPlayerName, setJoinPlayerName] = useState("");

	const handleCreateGame = (e: React.FormEvent) => {
		e.preventDefault();
		if (config.adminName.trim()) {
			onCreateGame(config);
		}
	};

	const handleJoinGame = (e: React.FormEvent) => {
		e.preventDefault();
		if (joinSessionId.trim() && joinPlayerName.trim()) {
			onJoinGame(joinSessionId.trim(), joinPlayerName.trim());
		}
	};

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

				{/* Mode Selection */}
				<div className="flex mb-6 bg-gray-100 rounded-lg p-1">
					<button
						type="button"
						onClick={() => setMode("create")}
						className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
							mode === "create"
								? "bg-white text-glaucous shadow-sm"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						Create Game
					</button>
					<button
						type="button"
						onClick={() => setMode("join")}
						className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
							mode === "join"
								? "bg-white text-glaucous shadow-sm"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						Join Game
					</button>
				</div>

				{mode === "create" ? (
					<form onSubmit={handleCreateGame} className="space-y-4">
						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="admin-name"
							>
								Your Name
							</label>
							<input
								id="admin-name"
								type="text"
								value={config.adminName}
								onChange={(e) =>
									setConfig((prev) => ({ ...prev, adminName: e.target.value }))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glaucous focus:border-transparent"
								placeholder="Enter your name"
								required
							/>
						</div>

						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="game-type"
							>
								Game Type
							</label>
							<select
								id="game-type"
								value={config.gameType}
								onChange={(e) =>
									setConfig((prev) => ({
										...prev,
										gameType: e.target.value as GameType,
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glaucous focus:border-transparent"
							>
								<option value={"up_and_down"}>
									Up and Down (1-10-1 cards)
								</option>
								<option value={"up"}>Up Only (1-10 cards)</option>
							</select>
						</div>

						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="scoring-system"
							>
								Scoring System
							</label>
							<select
								id="scoring-system"
								value={config.scoringSystem}
								onChange={(e) =>
									setConfig((prev) => ({
										...prev,
										scoringSystem: e.target.value as ScoringSystem,
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glaucous focus:border-transparent"
							>
								<option value={"classic"}>Classic (10 + bid)</option>
								<option value={"modern"}>Modern (bid × 2 + 10)</option>
							</select>
						</div>

						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="max-players"
							>
								Max Players
							</label>
							<select
								id="max-players"
								value={config.maxPlayers}
								onChange={(e) =>
									setConfig((prev) => ({
										...prev,
										maxPlayers: parseInt(e.target.value),
									}))
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glaucous focus:border-transparent"
							>
								<option value={2}>2 Players</option>
								<option value={3}>3 Players</option>
								<option value={4}>4 Players</option>
								<option value={5}>5 Players</option>
								<option value={6}>6 Players</option>
							</select>
						</div>

						<button
							type="submit"
							disabled={isLoading || !config.adminName.trim()}
							className={`w-full py-3 rounded-lg font-semibold transition-all ${
								isLoading || !config.adminName.trim()
									? "bg-gray-300 text-gray-500 cursor-not-allowed"
									: "bg-glaucous text-white hover:opacity-90 shadow-lg hover:shadow-xl"
							}`}
						>
							{isLoading ? "Creating Game..." : "Create Game"}
						</button>
					</form>
				) : (
					<form onSubmit={handleJoinGame} className="space-y-4">
						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="join-session-id"
							>
								Game Code
							</label>
							<input
								id="join-session-id"
								type="text"
								value={joinSessionId}
								onChange={(e) => setJoinSessionId(e.target.value.toUpperCase())}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glaucous focus:border-transparent"
								placeholder="Enter game code"
								required
							/>
						</div>

						<div>
							<label
								className="block text-sm font-medium text-gray-700 mb-1"
								htmlFor="join-player-name"
							>
								Your Name
							</label>
							<input
								id="join-player-name"
								type="text"
								value={joinPlayerName}
								onChange={(e) => setJoinPlayerName(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-glaucous focus:border-transparent"
								placeholder="Enter your name"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={
								isLoading || !joinSessionId.trim() || !joinPlayerName.trim()
							}
							className={`w-full py-3 rounded-lg font-semibold transition-all ${
								isLoading || !joinSessionId.trim() || !joinPlayerName.trim()
									? "bg-gray-300 text-gray-500 cursor-not-allowed"
									: "bg-glaucous text-white hover:opacity-90 shadow-lg hover:shadow-xl"
							}`}
						>
							{isLoading ? "Joining Game..." : "Join Game"}
						</button>
					</form>
				)}

				<div className="mt-6 text-center text-sm text-gray-500">
					<p>
						Need help? Check out our{" "}
						<a href="/how-to-play" className="text-glaucous hover:underline">
							game rules
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
