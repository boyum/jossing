"use client";

import type { Player } from "@/types/game";

interface PlayerListProps {
	players: Player[];
	currentPlayerId: string | null;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
	return (
		<div className="bg-white rounded-lg shadow-lg p-4">
			<h3 className="text-lg font-bold text-gray-900 mb-3">Players</h3>
			<div className="space-y-2">
				{players
					.sort((a, b) => a.position - b.position)
					.map((player) => (
						<div
							key={player.id}
							className={`p-3 rounded-lg border-2 transition-colors ${
								player.id === currentPlayerId
									? "border-glaucous bg-glaucous/10"
									: "border-gray-200 bg-gray-50"
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<div
										className={`w-3 h-3 rounded-full ${
											player.isConnected ? "bg-green-500" : "bg-red-500"
										}`}
									/>
									<span className="font-medium">
										{player.name}
										{player.id === currentPlayerId && " (You)"}
									</span>
									{player.isAdmin && (
										<span className="text-xs bg-royal-blue text-white px-2 py-1 rounded">
											Admin
										</span>
									)}
								</div>
								<div className="text-sm text-gray-600">
									Position {player.position}
								</div>
							</div>
							<div className="mt-1 text-sm text-gray-600">
								Total: {player.totalScore} points
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
