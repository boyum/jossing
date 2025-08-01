"use client";

import { useState, useEffect } from "react";
import type { Player, GameSession } from "@/types/game";
import {
	Trophy,
	Medal,
	Award,
	Users,
	Clock,
	TrendingUp,
	Sparkles,
} from "lucide-react";

interface FinalGameScreenProps {
	session: GameSession;
	players: Player[];
	totalScores: Record<string, number>;
	sectionScores?: Record<string, number[]>; // Score history for each section
	onNewGame?: () => void;
	onLeaveGame?: () => void;
}

interface PlayerStats {
	player: Player;
	totalScore: number;
	rank: number;
	perfectBids: number;
	totalBids: number;
	successRate: number;
	averageScore: number;
}

export function FinalGameScreen({
	session,
	players,
	totalScores,
	onNewGame,
	onLeaveGame,
}: FinalGameScreenProps) {
	const [showStats, setShowStats] = useState(false);
	const [showCelebration, setShowCelebration] = useState(true);

	// Hide celebration after 3 seconds
	useEffect(() => {
		const timer = setTimeout(() => {
			setShowCelebration(false);
		}, 3000);
		return () => clearTimeout(timer);
	}, []);

	// Calculate final rankings
	const sortedPlayers = players
		.map((player) => ({ ...player, finalScore: totalScores[player.id] || 0 }))
		.sort((a, b) => b.finalScore - a.finalScore);

	const winner = sortedPlayers[0];
	const totalSections = session.gameType === "up" ? 10 : 20;

	// Calculate detailed stats (placeholder for future implementation)
	const calculatePlayerStats = (player: Player): PlayerStats => {
		const playerScore = totalScores[player.id] || 0;
		const rank = sortedPlayers.findIndex((p) => p.id === player.id) + 1;

		// For now, using placeholder calculations
		// In real implementation, this would use actual bid/trick data
		const estimatedBids = totalSections;
		const estimatedPerfectBids = Math.floor(playerScore / 12); // Rough estimate

		return {
			player,
			totalScore: playerScore,
			rank,
			perfectBids: estimatedPerfectBids,
			totalBids: estimatedBids,
			successRate:
				estimatedBids > 0 ? (estimatedPerfectBids / estimatedBids) * 100 : 0,
			averageScore: estimatedBids > 0 ? playerScore / estimatedBids : 0,
		};
	};

	const playerStats = players.map(calculatePlayerStats);

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Trophy className="w-8 h-8 text-yellow-500" />;
			case 2:
				return <Medal className="w-8 h-8 text-gray-400" />;
			case 3:
				return <Award className="w-8 h-8 text-amber-600" />;
			default:
				return (
					<span className="w-8 h-8 flex items-center justify-center text-gray-500 font-bold text-lg">
						#{rank}
					</span>
				);
		}
	};

	const getRankColor = (rank: number) => {
		switch (rank) {
			case 1:
				return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
			case 2:
				return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
			case 3:
				return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	return (
		<div className="min-h-screen bg-jossing-play p-4 relative">
			{/* Celebration Animation */}
			{showCelebration && (
				<div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
					<div className="animate-bounce">
						<Sparkles className="w-32 h-32 text-yellow-400 animate-pulse" />
					</div>
				</div>
			)}

			<div className="max-w-6xl mx-auto relative z-20">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="mb-4">
						<div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500 rounded-full shadow-lg mb-4">
							<Trophy className="w-12 h-12 text-white" />
						</div>
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
						Game Complete!
					</h1>
					<p className="text-xl text-gray-600">
						{session.gameType === "up" ? "10 Sections" : "20 Sections"} •{" "}
						{session.scoringSystem === "classic" ? "Classic" : "Modern"} Scoring
					</p>
				</div>

				{/* Winner Announcement */}
				<div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-4 border-yellow-400 relative overflow-hidden">
					{/* Background celebration pattern */}
					<div className="absolute inset-0 opacity-10">
						<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-200 via-transparent to-yellow-200"></div>
					</div>

					<div className="text-center relative z-10">
						<div className="mb-4">
							<div className="relative inline-block">
								<Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-2 animate-pulse" />
								{/* Sparkle effects around trophy */}
								<Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-ping" />
								<Sparkles className="w-4 h-4 text-yellow-300 absolute -bottom-1 -left-1 animate-pulse" />
							</div>
							<h2 className="text-3xl font-bold text-gray-900 animate-bounce">
								🎉 {winner.name} Wins! 🎉
							</h2>
						</div>
						<div className="text-6xl font-bold text-yellow-600 mb-2 animate-pulse">
							{winner.finalScore}
						</div>
						<p className="text-xl text-gray-600">Final Score</p>

						{/* Achievement badges for special accomplishments */}
						<div className="mt-4 flex justify-center space-x-2">
							{winner.finalScore > 100 && (
								<span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
									🎯 High Scorer
								</span>
							)}
							{winner.isAI && (
								<span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
									🤖 AI Champion
								</span>
							)}
							<span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
								👑 Champion
							</span>
						</div>
					</div>
				</div>

				{/* Final Rankings */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
						<Users className="w-6 h-6 mr-2" />
						Final Rankings
					</h3>

					<div className="space-y-4">
						{sortedPlayers.map((player, index) => (
							<div
								key={player.id}
								className={`flex items-center justify-between p-4 rounded-lg ${getRankColor(index + 1)}`}
							>
								<div className="flex items-center space-x-4">
									{getRankIcon(index + 1)}
									<div>
										<h4 className="text-xl font-bold">
											{player.name}
											{player.isAI && (
												<span className="ml-2 text-sm opacity-75">(AI)</span>
											)}
										</h4>
										{index === 0 && (
											<p className="text-sm opacity-90">Champion!</p>
										)}
									</div>
								</div>
								<div className="text-right">
									<div className="text-2xl font-bold">{player.finalScore}</div>
									<div className="text-sm opacity-75">points</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Toggle Stats Button */}
				<div className="text-center mb-6">
					<button
						type="button"
						onClick={() => setShowStats(!showStats)}
						className="px-6 py-3 bg-jossing-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg"
					>
						{showStats ? "Hide" : "Show"} Detailed Statistics
					</button>
				</div>

				{/* Detailed Statistics */}
				{showStats && (
					<div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fadeIn">
						<h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
							<TrendingUp className="w-6 h-6 mr-2" />
							Game Statistics
						</h3>

						<div className="grid gap-6 md:grid-cols-2">
							{playerStats.map((stats, index) => (
								<div
									key={stats.player.id}
									className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-jossing-primary"
									style={{
										animationDelay: `${index * 100}ms`,
										animation: "slideInUp 0.5s ease-out forwards",
									}}
								>
									<div className="flex items-center justify-between mb-4">
										<div className="flex items-center space-x-2">
											<h4 className="text-lg font-bold text-gray-900">
												{stats.player.name}
											</h4>
											{stats.rank === 1 && (
												<Trophy className="w-5 h-5 text-yellow-500" />
											)}
											{stats.rank === 2 && (
												<Medal className="w-5 h-5 text-gray-400" />
											)}
											{stats.rank === 3 && (
												<Award className="w-5 h-5 text-amber-600" />
											)}
										</div>
										<div className="text-right">
											<div className="text-sm text-gray-600">Rank</div>
											<div className="text-lg font-bold text-jossing-primary">
												#{stats.rank}
											</div>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="text-center p-2 bg-gray-50 rounded">
											<div className="text-gray-600">Total Score</div>
											<div className="text-lg font-bold text-gray-900">
												{stats.totalScore}
											</div>
										</div>
										<div className="text-center p-2 bg-gray-50 rounded">
											<div className="text-gray-600">Avg/Section</div>
											<div className="text-lg font-bold text-gray-900">
												{stats.averageScore.toFixed(1)}
											</div>
										</div>
										<div className="text-center p-2 bg-green-50 rounded">
											<div className="text-gray-600">Perfect Bids</div>
											<div className="text-lg font-bold text-green-600">
												{stats.perfectBids}
											</div>
										</div>
										<div className="text-center p-2 bg-blue-50 rounded">
											<div className="text-gray-600">Success Rate</div>
											<div className="text-lg font-bold text-blue-600">
												{stats.successRate.toFixed(0)}%
											</div>
										</div>
									</div>

									{/* Performance indicator */}
									<div className="mt-3 text-center">
										{stats.successRate >= 70 ? (
											<span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
												🎯 Excellent Performance
											</span>
										) : stats.successRate >= 50 ? (
											<span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
												👍 Good Performance
											</span>
										) : (
											<span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
												📈 Room for Improvement
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Game Summary */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
						<Clock className="w-6 h-6 mr-2" />
						Game Summary
					</h3>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
						<div>
							<div className="text-2xl font-bold text-jossing-primary">
								{totalSections}
							</div>
							<div className="text-sm text-gray-600">Sections Played</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-jossing-primary">
								{players.length}
							</div>
							<div className="text-sm text-gray-600">Players</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-jossing-primary">
								{session.scoringSystem === "classic" ? "Classic" : "Modern"}
							</div>
							<div className="text-sm text-gray-600">Scoring</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-jossing-primary">
								{Math.max(...Object.values(totalScores)) -
									Math.min(...Object.values(totalScores))}
							</div>
							<div className="text-sm text-gray-600">Point Spread</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					{onNewGame && (
						<button
							type="button"
							onClick={onNewGame}
							className="px-8 py-4 bg-jossing-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg font-semibold text-lg"
						>
							🎮 Start New Game
						</button>
					)}

					<button
						type="button"
						onClick={() => {
							window.location.href = "/";
						}}
						className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all shadow-lg font-semibold text-lg"
					>
						🏠 Back to Home
					</button>

					{onLeaveGame && (
						<button
							type="button"
							onClick={onLeaveGame}
							className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-lg font-semibold text-lg"
						>
							🚪 Leave Game
						</button>
					)}
				</div>

				{/* Share Results */}
				<div className="text-center mt-8">
					<p className="text-gray-600 mb-4">
						Share these results with friends!
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<button
							type="button"
							onClick={() => {
								const results =
									`🃏 Jøssing Game Results 🃏\n\n🏆 Winner: ${winner.name} (${winner.finalScore} pts)\n\n` +
									sortedPlayers
										.map((p, i) => `${i + 1}. ${p.name}: ${p.finalScore} pts`)
										.join("\n") +
									`\n\nGame: ${totalSections} sections • ${session.scoringSystem} scoring`;

								if (navigator.share) {
									navigator
										.share({
											title: "Jøssing Game Results",
											text: results,
										})
										.catch(console.error);
								} else {
									navigator.clipboard
										.writeText(results)
										.then(() => {
											alert("Results copied to clipboard!");
										})
										.catch(() => {
											// Fallback for older browsers
											const textArea = document.createElement("textarea");
											textArea.value = results;
											document.body.appendChild(textArea);
											textArea.select();
											document.execCommand("copy");
											document.body.removeChild(textArea);
											alert("Results copied to clipboard!");
										});
								}
							}}
							className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
						>
							📱 Share Results
						</button>

						<button
							type="button"
							onClick={() => {
								const gameUrl = `${window.location.origin}/play`;
								if (navigator.share) {
									navigator
										.share({
											title: "Play Jøssing Card Game",
											text: "Join me for a game of Jøssing!",
											url: gameUrl,
										})
										.catch(console.error);
								} else {
									navigator.clipboard
										.writeText(`Play Jøssing with me! ${gameUrl}`)
										.then(() => {
											alert("Game link copied to clipboard!");
										})
										.catch(console.error);
								}
							}}
							className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
						>
							🎮 Share Game Link
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
