"use client";

import { useState, useEffect } from "react";
import { CardComponent } from "@/components/ui/card";
import {
	type Card as CardType,
	type Suit,
	type Rank,
	RANK_VALUES,
} from "@/types/game";

interface BiddingScenario {
	id: string;
	title: string;
	description: string;
	handSize: number;
	playerHand: CardType[];
	trumpSuit: Suit;
	playerPosition: number;
	dealerPosition: number;
	sectionNumber: number;
	optimalBid: number;
	reasoning: string;
}

const scenarios: BiddingScenario[] = [
	{
		id: "strong-hand",
		title: "Strong Hand with Trump",
		description: "You have a powerful hand with high trump cards.",
		handSize: 5,
		playerHand: [
			{ suit: "spades", rank: "A" },
			{ suit: "spades", rank: "K" },
			{ suit: "hearts", rank: "A" },
			{ suit: "clubs", rank: "K" },
			{ suit: "diamonds", rank: "7" },
		],
		trumpSuit: "spades",
		playerPosition: 1,
		dealerPosition: 0,
		sectionNumber: 5,
		optimalBid: 3,
		reasoning:
			"With A♠ and K♠ as trump, plus A♥ and K♣, you should win 3-4 tricks. Bid conservatively at 3.",
	},
	{
		id: "weak-hand",
		title: "Weak Hand - Conservative Bidding",
		description: "Your hand has mostly low cards with little trump strength.",
		handSize: 4,
		playerHand: [
			{ suit: "hearts", rank: "7" },
			{ suit: "clubs", rank: "6" },
			{ suit: "diamonds", rank: "5" },
			{ suit: "diamonds", rank: "4" },
		],
		trumpSuit: "spades",
		playerPosition: 2,
		dealerPosition: 1,
		sectionNumber: 4,
		optimalBid: 0,
		reasoning:
			"No trump cards and all low values. Very unlikely to win any tricks. Bid 0 to play it safe.",
	},
	{
		id: "medium-hand",
		title: "Balanced Hand - Strategic Thinking",
		description: "A moderate hand requiring careful evaluation.",
		handSize: 6,
		playerHand: [
			{ suit: "spades", rank: "J" },
			{ suit: "hearts", rank: "Q" },
			{ suit: "hearts", rank: "9" },
			{ suit: "clubs", rank: "A" },
			{ suit: "diamonds", rank: "8" },
			{ suit: "diamonds", rank: "3" },
		],
		trumpSuit: "spades",
		playerPosition: 3,
		dealerPosition: 2,
		sectionNumber: 6,
		optimalBid: 2,
		reasoning:
			"J♠ (trump), A♣, and Q♥ are likely winners. The 9♥ might win in hearts. Bid 2 for safety.",
	},
];

export default function BiddingTrainer() {
	const [currentScenario, setCurrentScenario] = useState(0);
	const [userBid, setUserBid] = useState<number>(0);
	const [showExplanation, setShowExplanation] = useState(false);
	const [feedback, setFeedback] = useState<string>("");
	const [feedbackType, setFeedbackType] = useState<
		"success" | "warning" | "info"
	>("info");

	const scenario = scenarios[currentScenario];

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setUserBid(0);
		setShowExplanation(false);
		setFeedback("");
		setFeedbackType("info");
	}, [currentScenario]);

	const handleBidSubmit = () => {
		const optimal = scenario.optimalBid;
		const difference = Math.abs(userBid - optimal);

		if (difference === 0) {
			setFeedback("🎯 Perfect! You found the optimal bid.");
			setFeedbackType("success");
		} else if (difference === 1) {
			setFeedback(`👍 Very good! Your bid is close to optimal (${optimal}).`);
			setFeedbackType("success");
		} else if (difference === 2) {
			setFeedback(
				`⚠️ Decent bid, but consider the optimal choice (${optimal}).`,
			);
			setFeedbackType("warning");
		} else {
			setFeedback(
				`❌ Your bid is quite different from optimal (${optimal}). Review the hand strength.`,
			);
			setFeedbackType("warning");
		}

		setShowExplanation(true);
	};

	const resetScenario = () => {
		setUserBid(0);
		setShowExplanation(false);
		setFeedback("");
		setFeedbackType("info");
	};

	const nextScenario = () => {
		setCurrentScenario((prev) => (prev + 1) % scenarios.length);
	};

	const prevScenario = () => {
		setCurrentScenario(
			(prev) => (prev - 1 + scenarios.length) % scenarios.length,
		);
	};

	// Calculate basic hand analysis for display
	const handAnalysis = {
		trumpCards: scenario.playerHand.filter(
			(card) => card.suit === scenario.trumpSuit,
		).length,
		highCards: scenario.playerHand.filter(
			(card) => RANK_VALUES[card.rank] >= 12,
		).length,
		aces: scenario.playerHand.filter((card) => card.rank === "A").length,
	};

	return (
		<div className="space-y-6">
			{/* Scenario Selection */}
			<div className="flex flex-wrap gap-2 mb-4">
				{scenarios.map((scenarioItem, index) => (
					<button
						key={scenarioItem.id}
						type="button"
						onClick={() => setCurrentScenario(index)}
						className={`px-3 py-1 rounded-md text-sm ${
							currentScenario === index
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-700 hover:bg-gray-300"
						}`}
					>
						Scenario {index + 1}
					</button>
				))}
			</div>

			{/* Current Scenario Info */}
			<div className="bg-blue-50 p-4 rounded-lg">
				<h3 className="font-bold text-lg mb-2">{scenario.title}</h3>
				<p className="text-gray-700 mb-3">{scenario.description}</p>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<strong>Section:</strong> {scenario.sectionNumber} (cards per
						player: {scenario.handSize})
					</div>
					<div>
						<strong>Trump Suit:</strong> {scenario.trumpSuit}
						{scenario.trumpSuit === "spades" && " ♠"}
						{scenario.trumpSuit === "hearts" && " ♥"}
						{scenario.trumpSuit === "diamonds" && " ♦"}
						{scenario.trumpSuit === "clubs" && " ♣"}
					</div>
					<div>
						<strong>Your Position:</strong> {scenario.playerPosition} (Dealer:{" "}
						{scenario.dealerPosition})
					</div>
					<div>
						<strong>Bidding Range:</strong> 0 to {scenario.handSize}
					</div>
				</div>
			</div>

			{/* Hand Display */}
			<div className="bg-green-50 p-4 rounded-lg">
				<h4 className="font-medium mb-3">Your Hand</h4>
				<div className="flex justify-center space-x-2 mb-4">
					{scenario.playerHand.map((card) => (
						<CardComponent
							key={`${card.suit}-${card.rank}`}
							card={card}
							size="medium"
							disabled={false}
							className={
								card.suit === scenario.trumpSuit ? "ring-2 ring-yellow-400" : ""
							}
						/>
					))}
				</div>

				{/* Quick Analysis */}
				<div className="bg-white p-3 rounded border">
					<h5 className="font-medium mb-2">Quick Analysis:</h5>
					<div className="grid grid-cols-3 gap-4 text-sm">
						<div>
							<strong>Trump Cards:</strong> {handAnalysis.trumpCards}
						</div>
						<div>
							<strong>High Cards:</strong> {handAnalysis.highCards} (J+)
						</div>
						<div>
							<strong>Aces:</strong> {handAnalysis.aces}
						</div>
					</div>
				</div>
			</div>

			{/* Bidding Interface */}
			<div className="bg-yellow-50 p-4 rounded-lg">
				<h4 className="font-medium mb-3">Make Your Bid</h4>
				<div className="flex items-center space-x-4 mb-4">
					<label htmlFor="bid-input" className="font-medium">
						Your bid:
					</label>
					<div className="flex items-center space-x-2">
						<button
							type="button"
							onClick={() => setUserBid(Math.max(0, userBid - 1))}
							disabled={userBid <= 0}
							className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
						>
							-
						</button>
						<input
							id="bid-input"
							type="number"
							min="0"
							max={scenario.handSize}
							value={userBid}
							onChange={(e) =>
								setUserBid(
									Math.max(
										0,
										Math.min(scenario.handSize, parseInt(e.target.value) || 0),
									),
								)
							}
							className="w-16 text-center p-2 border rounded"
						/>
						<button
							type="button"
							onClick={() =>
								setUserBid(Math.min(scenario.handSize, userBid + 1))
							}
							disabled={userBid >= scenario.handSize}
							className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
						>
							+
						</button>
					</div>
					<button
						type="button"
						onClick={handleBidSubmit}
						className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
					>
						Submit Bid
					</button>
				</div>

				<p className="text-sm text-gray-600">
					How many tricks do you think you can win with this hand?
				</p>
			</div>

			{/* Feedback */}
			{feedback && (
				<div
					className={`p-4 rounded-lg ${
						feedbackType === "success"
							? "bg-green-100 border border-green-300"
							: feedbackType === "warning"
								? "bg-yellow-100 border border-yellow-300"
								: "bg-blue-100 border border-blue-300"
					}`}
				>
					<p
						className={`font-medium ${
							feedbackType === "success"
								? "text-green-800"
								: feedbackType === "warning"
									? "text-yellow-800"
									: "text-blue-800"
						}`}
					>
						{feedback}
					</p>
					{showExplanation && (
						<div className="mt-3 text-sm text-gray-700">
							<p>
								<strong>Optimal bid:</strong> {scenario.optimalBid}
							</p>
							<p>
								<strong>Reasoning:</strong> {scenario.reasoning}
							</p>
						</div>
					)}
				</div>
			)}

			{/* Controls */}
			<div className="flex justify-between items-center">
				<button
					type="button"
					onClick={prevScenario}
					className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
				>
					Previous Scenario
				</button>

				<button
					type="button"
					onClick={resetScenario}
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
				>
					Reset
				</button>

				<button
					type="button"
					onClick={nextScenario}
					className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
				>
					Next Scenario
				</button>
			</div>
		</div>
	);
}
