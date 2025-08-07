"use client";

import type { Player } from "@/types/game";
import { PlayerAvatar } from "./PlayerAvatar";

interface ScoreBoardProps {
	players: Player[];
	sectionScores: Record<string, number>;
	totalScores: Record<string, number>;
	currentSection: number;
}

export function ScoreBoard({
	players,
	sectionScores,
	totalScores,
	currentSection,
}: ScoreBoardProps) {
	return (
		<div className="bg-white rounded-xl shadow-xl p-6">
			<h3 className="text-2xl font-extrabold text-glaucous mb-4 flex items-center gap-2">
				<span>🏆</span> Scoreboard
			</h3>

			<div className="space-y-4">
				{players
					.sort((a, b) => (totalScores[b.id] || 0) - (totalScores[a.id] || 0))
					.map((player, index) => (
						<div
							key={player.id}
							className={`flex items-center justify-between p-4 rounded-2xl border-4 ${
								index === 0 && totalScores[player.id] > 0
									? "border-yellow-400 bg-yellow-100 animate-pulse"
									: "border-gray-200 bg-gray-50"
							}`}
						>
							<div className="flex items-center gap-3">
								<PlayerAvatar name={player.name} score={totalScores[player.id]} />
								<span className="font-bold text-lg text-gray-800">
									{player.name}
								</span>
								{index === 0 && totalScores[player.id] > 0 && (
									<span className="text-2xl ml-1">👑</span>
								)}
							</div>
							<div className="flex flex-col items-end">
								<div className="font-extrabold text-3xl text-glaucous drop-shadow-lg">
									{totalScores[player.id] || 0}
								</div>
								{sectionScores[player.id] !== undefined && (
									<div className="text-sm text-green-600 font-semibold">
										+{sectionScores[player.id]} this round
									</div>
								)}
							</div>
						</div>
					))}
			</div>

			<div className="mt-6 pt-4 border-t-2 border-gray-300">
				<div className="text-lg text-gray-600 text-center font-bold">
					Round {currentSection} of 10
				</div>
				<div className="w-full bg-gray-300 rounded-full h-4 mt-3">
					<div
						className="bg-glaucous h-4 rounded-full transition-all duration-300"
						style={{ width: `${(currentSection / 10) * 100}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
