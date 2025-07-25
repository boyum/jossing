"use client";

import { useState, useEffect } from "react";
import { CardComponent } from "@/components/ui/card";
import type { Card as CardType, Suit, Rank, TrickWithCards } from "@/types/game";

// Sample scenarios for the simulator
const scenarios = [
  {
    id: "basic-follow-suit",
    title: "Following Suit",
    description:
      "When another player leads a suit, you must follow that suit if you have it.",
    playerHand: [
      { suit: "hearts", rank: "A",  },
      { suit: "hearts", rank: "K",  },
      { suit: "spades", rank: "Q",  },
      { suit: "diamonds", rank: "J",  },
    ] as const satisfies CardType[],
    currentTrick: {
      leadingSuit: "hearts",
      cardsPlayed: [
        {
          playerId: "opponent1",
          card: { suit: "hearts", rank: "10",  },
        },
      ],
      leadPlayerId: "opponent1",
    } as const,
    trumpSuit: "spades",
    correctCards: ["hearts-A", "hearts-K"],
    explanation:
      "You must play a heart since hearts were led and you have hearts in your hand.",
  },
  {
    id: "no-suit-trump",
    title: "Using Trump When You Cannot Follow Suit",
    description:
      "If you cannot follow the led suit, you can play any card, including trump.",
    playerHand: [
      { suit: "spades", rank: "A" },
      { suit: "clubs", rank: "K" },
      { suit: "diamonds", rank: "Q" },
      { suit: "diamonds", rank: "J" },
    ] as const satisfies CardType[],
    currentTrick: {
      leadingSuit: "hearts",
      cardsPlayed: [
        {
          playerId: "opponent1",
          card: { suit: "hearts", rank: "10", value: 10 },
        },
      ],
      leadPlayerId: "opponent1",
    } as const,
    trumpSuit: "spades",
    correctCards: ["spades-A", "clubs-K", "diamonds-Q", "diamonds-J"],
    explanation:
      "You have no hearts, so you can play any card. The Ace of Spades would win as trump!",
  },
  {
    id: "leading-trick",
    title: "Leading a Trick",
    description: "When you lead a trick, you can play any card from your hand.",
    playerHand: [
      { suit: "hearts", rank: "A" },
      { suit: "spades", rank: "K" },
      { suit: "clubs", rank: "Q" },
      { suit: "diamonds", rank: "J" },
    ] as const satisfies CardType[],
    currentTrick: {
      cardsPlayed: [],
      leadPlayerId: "player",
    } as const,
    trumpSuit: "spades",
    correctCards: ["hearts-A", "spades-K", "clubs-Q", "diamonds-J"],
    explanation:
      "As the leader, you can play any card you want to start the trick.",
  },
];

// Simple validation function for the tutorial
function validateTutorialCardPlay(
  card: CardType,
  hand: CardType[],
  trick: {
    leadingSuit?: Suit;
    cardsPlayed: readonly { playerId: string; card: CardType }[];
  },
): string | null {
  if (!hand.some((c) => c.suit === card.suit && c.rank === card.rank)) {
    return "You do not have this card";
  }

  if (trick.leadingSuit) {
    const hasLeadingSuit = hand.some((c) => c.suit === trick.leadingSuit);
    if (hasLeadingSuit && card.suit !== trick.leadingSuit) {
      return `You must follow suit (${trick.leadingSuit})`;
    }
  }

  return null;
}

export default function CardPlaySimulator() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackType, setFeedbackType] = useState<
    "success" | "error" | "info"
  >("info");
  const [showExplanation, setShowExplanation] = useState(false);

  const scenario = scenarios[currentScenario];

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setSelectedCard(null);
    setFeedback("");
    setShowExplanation(false);
    setFeedbackType("info");
  }, [currentScenario]);

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);

    const cardKey = `${card.suit}-${card.rank}` as const;
    const isValidPlay = scenario.correctCards.includes(cardKey);

    if (isValidPlay) {
      setFeedback("✅ Correct! This is a valid play.");
      setFeedbackType("success");
    } else {
      const validation = validateTutorialCardPlay(
        card,
        scenario.playerHand,
        scenario.currentTrick,
      );
      setFeedback(`❌ ${validation || "Invalid play"}`);
      setFeedbackType("error");
    }
    setShowExplanation(true);
  };

  const resetScenario = () => {
    setSelectedCard(null);
    setFeedback("");
    setShowExplanation(false);
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

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {scenarios.map((scenario, index) => (
          <button
            key={scenario.id}
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
        <p className="text-gray-700 mb-2">{scenario.description}</p>
        <p className="text-sm text-gray-600">
          <strong>Trump Suit:</strong> {scenario.trumpSuit} ♠
        </p>
      </div>

      {/* Current Trick Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Current Trick</h4>
        <div className="flex justify-center space-x-4">
          {scenario.currentTrick.cardsPlayed.length === 0 ? (
            <div className="text-gray-500 italic">
              You are leading this trick
            </div>
          ) : (
            scenario.currentTrick.cardsPlayed.map((play) => (
              <div
                key={`${play.playerId}-${play.card.suit}-${play.card.rank}`}
                className="text-center"
              >
                <CardComponent card={play.card} size="small" disabled={false} />
                <div className="text-xs mt-1 text-gray-600">
                  {play.playerId}
                </div>
              </div>
            ))
          )}
        </div>
        {scenario.currentTrick.leadingSuit && (
          <div className="text-center mt-2 text-sm text-gray-600">
            Leading suit: <strong>{scenario.currentTrick.leadingSuit}</strong>
          </div>
        )}
      </div>

      {/* Player Hand */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">
          Your Hand - Click a card to play it
        </h4>
        <div className="flex justify-center space-x-2">
          {scenario.playerHand.map((card) => (
            <button
              key={`${card.suit}-${card.rank}`}
              type="button"
              className={`cursor-pointer transition-transform hover:scale-105 ${
                selectedCard === card
                  ? "ring-2 ring-blue-500 ring-offset-2"
                  : ""
              }`}
              onClick={() => handleCardClick(card)}
            >
              <CardComponent
                card={card}
                size="medium"
                disabled={false}
                className={selectedCard === card ? "bg-blue-100" : ""}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg ${
            feedbackType === "success"
              ? "bg-green-100 border border-green-300"
              : feedbackType === "error"
              ? "bg-red-100 border border-red-300"
              : "bg-blue-100 border border-blue-300"
          }`}
        >
          <p
            className={`font-medium ${
              feedbackType === "success"
                ? "text-green-800"
                : feedbackType === "error"
                ? "text-red-800"
                : "text-blue-800"
            }`}
          >
            {feedback}
          </p>
          {showExplanation && (
            <p className="mt-2 text-sm text-gray-700">{scenario.explanation}</p>
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
