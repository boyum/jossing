"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AddAIPlayers } from "@/components/game/AddAIPlayers";
import { GameBoard } from "@/components/game/GameBoard";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { useGameStore } from "@/store/game-store";
import type { AIDifficulty } from "@/types/game";

export default function PlayPage() {
	const [mode, setMode] = useState<"setup" | "demo" | "multiplayer">("setup");
	const [sessionId, setSessionId] = useState<string | null>(null);

	const {
		createSession,
		joinSession,
		startGame,
		addAI,
		removeAI,
		startPolling,
		stopPolling,
		refreshGameState,
		isConnected,
		isPolling,
		isLoading,
		error,
		setError,
		session,
		playerId,
		players,
	} = useGameStore();

	// Auto-start polling when we have a session
	useEffect(() => {
		if (sessionId && playerId && mode === "multiplayer") {
			startPolling(sessionId); // Use default 1-second interval

			return () => {
				stopPolling();
			};
		}
	}, [sessionId, playerId, mode, startPolling, stopPolling]);

	// Initial game state refresh
	useEffect(() => {
		if (sessionId && playerId) {
			refreshGameState(sessionId);
		}
	}, [sessionId, playerId, refreshGameState]);

	const handleStartGame = async () => {
		if (sessionId && playerId) {
			await startGame(sessionId, playerId);
		}
	};

	const handleAddAI = async (difficulty?: AIDifficulty) => {
		if (sessionId) {
			await addAI(sessionId, difficulty);
		}
	};

	const handleRemoveAI = async (playerId: string) => {
		if (sessionId) {
			await removeAI(sessionId, playerId);
		}
	};

	const isGameStarted = session?.gamePhase === "playing";
	const isAdmin = players.find((p) => p.id === playerId)?.isAdmin || false;
	const canStartGame = isAdmin && players.length >= 2 && !isGameStarted;

	if (mode === "demo") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
				<div className="container mx-auto px-4 py-8">
					<div className="flex justify-between items-center mb-8">
						<h1 className="text-3xl font-bold text-white">
							Jøssing - Demo Mode
						</h1>
						<Link
							href="/play"
							onClick={() => setMode("setup")}
							className="px-4 py-2 bg-indian-red text-white rounded-lg hover:bg-indian-red/90 transition-colors"
						>
							Back to Setup
						</Link>
					</div>

					<div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 text-center">
						<p className="text-slate-300 mb-4">
							Demo mode with AI players coming soon!
						</p>
						<p className="text-slate-400 text-sm">
							For now, create a multiplayer game and share the code with
							friends.
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (mode === "multiplayer") {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
				<ConnectionStatus
					isConnected={isConnected}
					isReconnecting={isLoading || isPolling}
				/>

				{error && (
					<div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mx-4 mt-4">
						<div className="flex justify-between items-center">
							<span>Error: {error}</span>
							<button
								type="button"
								onClick={() => setError(null)}
								className="text-red-400 hover:text-red-200"
							>
								×
							</button>
						</div>
					</div>
				)}

				<div className="container mx-auto px-4 py-8">
					<div className="flex justify-between items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold text-white">
								Jøssing - Multiplayer
							</h1>
							{sessionId && (
								<p className="text-slate-300 mt-2">
									Game Code:{" "}
									<span className="font-mono bg-slate-700 px-2 py-1 rounded text-royal-blue">
										{sessionId}
									</span>
								</p>
							)}
						</div>
						<Link
							href="/play"
							onClick={() => {
								setMode("setup");
								stopPolling();
								setSessionId(null);
							}}
							className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
						>
							Leave Game
						</Link>
					</div>

					{!isGameStarted ? (
						<div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8">
							<h2 className="text-2xl font-bold text-white mb-6">
								Waiting for Players
							</h2>

							<div className="grid gap-4 mb-8">
								<h3 className="text-lg font-semibold text-slate-300">
									Current Players ({players.length}/{session?.maxPlayers || 6}):
								</h3>
								{players.map((player) => (
									<div
										key={player.id}
										className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
									>
										<span className="text-white font-medium">
											{player.name}
											{player.isAI && player.aiDifficulty && (
												<span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
													AI ({player.aiDifficulty})
												</span>
											)}
										</span>
										<div className="flex items-center gap-2">
											{player.isAdmin && (
												<span className="px-2 py-1 bg-indian-red text-white text-xs rounded">
													Admin
												</span>
											)}
											{/* Remove AI button for admin */}
											{isAdmin && player.isAI && !isGameStarted && (
												<button
													type="button"
													onClick={() => handleRemoveAI(player.id)}
													disabled={isLoading}
													className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50"
													title="Remove AI player"
												>
													Remove
												</button>
											)}
											<span
												className={`w-2 h-2 rounded-full ${
													player.isConnected ? "bg-green-500" : "bg-red-500"
												}`}
											/>
										</div>
									</div>
								))}
							</div>

							{canStartGame && (
								<button
									type="button"
									onClick={handleStartGame}
									disabled={isLoading}
									className="w-full px-6 py-3 bg-indian-red text-white font-semibold rounded-lg hover:bg-indian-red/90 transition-colors disabled:opacity-50"
								>
									{isLoading ? "Starting..." : "Start Game"}
								</button>
							)}

							{!canStartGame && players.length < 2 && (
								<div className="space-y-4">
									<p className="text-slate-400 text-center">
										Need at least 2 players to start. Share the game code with
										friends!
									</p>
								</div>
							)}

							{/* Add AI Players Component - Always show if admin and room available */}
							{isAdmin && players.length < (session?.maxPlayers || 6) && (
								<div className="mt-4">
									<AddAIPlayers
										onAddAI={handleAddAI}
										isLoading={isLoading}
										disabled={false}
									/>
								</div>
							)}
						</div>
					) : (
						<GameBoard />
					)}
				</div>
			</div>
		);
	}

	// Setup mode
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<div className="text-center mb-12">
						<h1 className="text-4xl font-bold text-white mb-4">Play Jøssing</h1>
						<p className="text-slate-300 text-lg">
							Choose how you&apos;d like to play the Norwegian card game
						</p>
					</div>

					<div className="grid gap-6">
						{/* <DemoModeSelector setMode={setMode} /> */}

						<RegularModeSelector
							createSession={createSession}
							joinSession={joinSession}
							setSessionId={setSessionId}
							setMode={setMode}
						/>
					</div>

					<div className="text-center mt-8">
						<Link
							href="/"
							className="text-slate-400 hover:text-white transition-colors"
						>
							← Back to Home
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

// type DemoModeSelectorProps = {
//   setMode: (mode: "setup" | "demo" | "multiplayer") => void;
// };

// function DemoModeSelector({ setMode }: DemoModeSelectorProps) {
//   return (
//     <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
//       <h2 className="text-2xl font-bold text-white mb-4">Demo Mode</h2>
//       <p className="text-slate-300 mb-6">
//         Practice against AI players and learn the game mechanics
//       </p>
//       <button
//         type="button"
//         onClick={() => setMode("demo")}
//         className="w-full px-6 py-3 bg-glaucous text-white font-semibold rounded-lg hover:bg-glaucous/90 transition-colors"
//       >
//         Start Demo
//       </button>
//     </div>
//   );
// }

type RegularModeSelectorProps = {
	createSession: (playerName: string) => Promise<{ sessionId: string } | null>;
	joinSession: (
		code: string,
		playerName: string,
	) => Promise<{ playerId: string; position: number } | null>;
	setSessionId: (id: string | null) => void;
	setMode: (mode: "setup" | "demo" | "multiplayer") => void;
};

function RegularModeSelector({
	createSession,
	joinSession,
	setSessionId,
	setMode,
}: RegularModeSelectorProps) {
	const handleCreateGame = async (playerName: string) => {
		if (!playerName.trim()) return;

		const result = await createSession(playerName);
		if (result) {
			setSessionId(result.sessionId);
			setMode("multiplayer");
		}
	};

	const handleJoinGame = async (gameCode: string, playerName: string) => {
		const result = await joinSession(gameCode.toUpperCase(), playerName);
		if (result) {
			setSessionId(gameCode.toUpperCase());
			setMode("multiplayer");
		}
	};

	return (
		<div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
			<p className="text-slate-300 mb-6">
				Play against the computer, or with friends online in real-time
			</p>

			<div className="grid md:grid-cols-2 gap-6">
				<CreateGame onCreateGame={handleCreateGame} />
				<JoinGame onJoinGame={handleJoinGame} />
			</div>
		</div>
	);
}

type CreateGameProps = {
	onCreateGame: (playerName: string) => void;
};

function CreateGame({ onCreateGame }: CreateGameProps) {
	const [playerName, setPlayerName] = useState("");
	const [isCreatingGame, setIsCreatingGame] = useState(false);

	const handleCreateGame = (e: React.FormEvent) => {
		e.preventDefault();
		if (playerName.trim()) {
			setIsCreatingGame(true);

			onCreateGame(playerName.trim());
			setPlayerName("");
		}
	};

	return (
		<div>
			<h3 className="text-lg font-semibold text-white mb-3">Create New Game</h3>
			<form onSubmit={handleCreateGame} className="space-y-4">
				<label htmlFor="createPlayerName" className="sr-only">
					Your name
				</label>
				<input
					id="createPlayerName"
					type="text"
					placeholder="Your name"
					value={playerName}
					onChange={(e) => setPlayerName(e.target.value)}
					className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-indian-red focus:outline-none"
					required
				/>
				<button
					type="submit"
					disabled={isCreatingGame}
					className="w-full px-6 py-3 bg-indian-red text-white font-semibold rounded-lg hover:bg-indian-red/90 transition-colors disabled:opacity-50"
				>
					{isCreatingGame ? "Creating..." : "Create Game"}
				</button>
			</form>
		</div>
	);
}

type JoinGameProps = {
	onJoinGame: (code: string, name: string) => void;
};

function JoinGame({ onJoinGame }: JoinGameProps) {
	const [gameCode, setGameCode] = useState("");
	const [playerName, setPlayerName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (gameCode.trim() && playerName.trim()) {
			onJoinGame(gameCode.trim().toUpperCase(), playerName.trim());
			setGameCode("");
		}
	};

	return (
		<div>
			<h3 className="text-lg font-semibold text-white mb-3">
				Join Existing Game
			</h3>
			<form onSubmit={handleSubmit} className="space-y-4">
				<label htmlFor="gameCode" className="sr-only">
					Game code
				</label>
				<input
					id="gameCode"
					type="text"
					placeholder="Enter game code"
					value={gameCode}
					onChange={(e) => setGameCode(e.target.value.toUpperCase())}
					className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-royal-blue focus:outline-none"
					maxLength={6}
					required
				/>

				<label htmlFor="joinPlayerName" className="sr-only">
					Your name
				</label>
				<input
					id="joinPlayerName"
					type="text"
					placeholder="Your name"
					value={playerName}
					onChange={(e) => setPlayerName(e.target.value)}
					className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-royal-blue focus:outline-none"
					required
				/>

				<button
					type="submit"
					className="w-full px-6 py-3 bg-royal-blue text-white font-semibold rounded-lg hover:bg-royal-blue/90 transition-colors"
				>
					Join Game
				</button>
			</form>
		</div>
	);
}
