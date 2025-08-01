"use client";

import { CardComponent } from "@/components/ui/card";
import type { Player, Suit, TrickWithCards } from "@/types/game";

interface TrickAreaProps {
	trick: TrickWithCards | null;
	players: Player[];
	trumpSuit: Suit;
}

export function TrickArea({ trick, players, trumpSuit }: TrickAreaProps) {
	if (!trick) {
		return (
			<div className="bg-white rounded-lg shadow-lg p-6 text-center">
				<h3 className="text-xl font-bold text-gray-900 mb-2">Trick Area</h3>
				<p className="text-gray-600">Waiting for cards to be played...</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-lg p-6">
			<div className="text-center mb-4">
				<h3 className="text-xl font-bold text-gray-900">
					Trick {trick.trickNumber}
				</h3>
				{trick.leadingSuit && (
					<p className="text-gray-600">
						Leading suit:{" "}
						<span className="font-semibold capitalize">
							{trick.leadingSuit}
						</span>
						{trick.leadingSuit === trumpSuit && " (Trump!)"}
					</p>
				)}
			</div>

			{/* Cards played in the trick */}
			<div className="flex justify-center items-center space-x-6 min-h-[140px]">
				{trick.cardsPlayed.length > 0 ? (
					trick.cardsPlayed.map((trickCard) => {
						const player = players[trickCard.playerPosition - 1];
						const card = {
							suit: trickCard.cardSuit,
							rank: trickCard.cardRank,
							value: 0, // Value not needed for display
						};
						const isTrump = trickCard.cardSuit === trumpSuit;
						const isLead =
							trickCard.playerPosition === trick.leadPlayerPosition;

						return (
							<div key={trickCard.id} className="text-center">
								<CardComponent
									card={card}
									size="medium"
									isTrump={isTrump}
									className={`
                    shadow-lg
                    ${isLead ? "ring-2 ring-blue-400 ring-opacity-75" : ""}
                  `}
								/>
								<p className="text-sm text-gray-600 mt-2 font-medium">
									{player?.name || `Player ${trickCard.playerPosition}`}
									{isLead && " (Lead)"}
									{isTrump && " 👑"}
								</p>
							</div>
						);
					})
				) : (
					<p className="text-gray-500 italic">Waiting for first card...</p>
				)}
			</div>

			{/* Trick status */}
			{trick.winnerPosition && (
				<div className="text-center mt-4 p-3 bg-green-100 rounded-lg">
					<p className="text-green-800 font-semibold">
						🏆 Won by{" "}
						{players[trick.winnerPosition - 1]?.name ||
							`Player ${trick.winnerPosition}`}
					</p>
				</div>
			)}

			{/* Leading player info */}
			<div className="mt-4 text-center">
				<p className="text-sm text-gray-600">
					Leading player:{" "}
					<span className="font-semibold">
						{players.find((p) => p.position === trick.leadPlayerPosition)
							?.name || "Unknown"}
					</span>
				</p>
			</div>
		</div>
	);
}
