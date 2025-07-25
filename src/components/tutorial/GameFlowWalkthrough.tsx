"use client";

import { useState } from "react";
import { CardComponent } from "@/components/ui/card";

const gameFlowSteps = [
  {
    id: "setup",
    title: "Game Setup",
    description: "Each player gets cards equal to the current section number",
    details: [
      "In section 1: each player gets 1 card",
      "In section 2: each player gets 2 cards",
      "In section 7: each player gets 7 cards",
      "Trump suit is randomly selected for each section",
    ],
    visual: "setup",
  },
  {
    id: "bidding",
    title: "Bidding Phase",
    description: "Players predict how many tricks they will win",
    details: [
      "All players write down bids simultaneously",
      "Bid from 0 to the number of cards you have",
      "Bids are revealed at the same time",
      "Admin clicks 'Next' to proceed after reviewing bids",
      "No strategic advantage from bidding order",
    ],
    visual: "bidding",
  },
  {
    id: "bid-review",
    title: "Bid Review",
    description: "All bids are revealed for players to see",
    details: [
      "Players can see what everyone bid",
      "Time to assess the situation before playing",
      "Admin decides when to start the playing phase",
      "Strategic preparation based on revealed bids",
    ],
    visual: "bid-review",
  },
  {
    id: "playing",
    title: "Playing Tricks",
    description: "Players play cards one by one to win tricks",
    details: [
      "Player left of dealer leads first trick",
      "Must follow suit if possible",
      "Trump beats non-trump",
      "Highest card wins the trick",
    ],
    visual: "playing",
  },
  {
    id: "scoring",
    title: "Scoring",
    description: "Points are awarded based on bid accuracy",
    details: [
      "Exact bid: 10 + bid points",
      "Any other result: 0 points",
      "Simple and decisive scoring",
      "Accuracy is everything!",
    ],
    visual: "scoring",
  },
];

const sampleGameData = {
  section: 3,
  trumpSuit: "hearts",
  players: [
    { name: "You", bid: 2, tricks: 2, score: 12 },
    { name: "Alice", bid: 1, tricks: 0, score: 0 },
    { name: "Bob", bid: 0, tricks: 1, score: 0 },
    { name: "Carol", bid: 1, tricks: 1, score: 11 },
  ],
  totalTricks: 4,
};

export default function GameFlowWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExample, setShowExample] = useState(false);

  const currentStepData = gameFlowSteps[currentStep];

  const renderVisual = (visualType: string) => {
    switch (visualType) {
      case "setup":
        return (
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-center mb-4">
              <h4 className="font-medium">
                Section {sampleGameData.section} Setup
              </h4>
              <p className="text-sm text-gray-600">
                Each player gets {sampleGameData.section} cards
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              {Array.from({ length: sampleGameData.section }, (_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: We don't have unique keys here
                  key={i}
                  className="w-8 h-12 bg-white border-2 border-gray-300 rounded"
                ></div>
              ))}
            </div>
            <div className="text-center mt-3">
              <span className="text-red-500 font-bold">♥ Trump: Hearts</span>
            </div>
          </div>
        );

      case "bidding":
        return (
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-medium text-center mb-3">Bidding Results</h4>
            <div className="space-y-2">
              {sampleGameData.players.map((player) => (
                <div
                  key={player.name}
                  className="flex justify-between items-center"
                >
                  <span className={player.name === "You" ? "font-bold" : ""}>
                    {player.name}:
                  </span>
                  <span className="bg-white px-2 py-1 rounded">
                    Bid {player.bid}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-sm text-gray-600">
              Total bids:{" "}
              {sampleGameData.players.reduce((sum, p) => sum + p.bid, 0)}
              (Total tricks: {sampleGameData.totalTricks})
            </div>
          </div>
        );

      case "bid-review":
        return (
          <div className="bg-purple-50 p-4 rounded">
            <h4 className="font-medium text-center mb-3">All Bids Revealed!</h4>
            <div className="space-y-2">
              {sampleGameData.players.map((player) => (
                <div
                  key={player.name}
                  className="flex justify-between items-center bg-white p-2 rounded border"
                >
                  <span className={player.name === "You" ? "font-bold" : ""}>
                    {player.name}:
                  </span>
                  <span className="bg-purple-100 px-2 py-1 rounded font-medium">
                    Bid: {player.bid}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <div className="bg-green-100 border border-green-300 rounded p-2">
                <p className="text-green-800 text-sm font-medium">
                  🎯 Total bids: {sampleGameData.players.reduce((sum, p) => sum + p.bid, 0)} 
                  (Available tricks: {sampleGameData.totalTricks})
                </p>
                <p className="text-green-700 text-xs mt-1">
                  Admin can now start the playing phase!
                </p>
              </div>
            </div>
          </div>
        );

      case "playing":
        return (
          <div className="bg-yellow-50 p-4 rounded">
            <h4 className="font-medium text-center mb-3">Trick in Progress</h4>
            <div className="flex justify-center space-x-3">
              <div className="text-center">
                <CardComponent
                  card={{ suit: "spades", rank: "K" }}
                  size="small"
                />
                <div className="text-xs mt-1">Alice</div>
              </div>
              <div className="text-center">
                <CardComponent
                  card={{ suit: "hearts", rank: "7" }}
                  size="small"
                  className="ring-2 ring-yellow-400"
                />
                <div className="text-xs mt-1">You (Trump!)</div>
              </div>
              <div className="text-center">
                <CardComponent
                  card={{ suit: "spades", rank: "A" }}
                  size="small"
                />
                <div className="text-xs mt-1">Bob</div>
              </div>
            </div>
            <p className="text-center text-sm mt-3">
              Your trump 7 beats their high spades!
            </p>
          </div>
        );

      case "scoring":
        return (
          <div className="bg-purple-50 p-4 rounded">
            <h4 className="font-medium text-center mb-3">
              Section {sampleGameData.section} Results
            </h4>
            <div className="space-y-2">
              {sampleGameData.players.map((player) => (
                <div
                  key={player.name}
                  className="flex justify-between items-center"
                >
                  <div className={player.name === "You" ? "font-bold" : ""}>
                    {player.name}
                  </div>
                  <div className="text-sm">
                    Bid {player.bid}, Won {player.tricks}
                  </div>
                  <div
                    className={`font-bold ${
                      player.score >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {player.score >= 0 ? "+" : ""}
                    {player.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Game Flow Walkthrough</h3>
      <p className="text-gray-600 mb-6">
        Follow along to understand how a complete section of Jøssing is played!
      </p>

      {/* Step navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex space-x-2">
          {gameFlowSteps.map(({ id }, index) => (
            <button
              key={id}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentStep ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setCurrentStep(Math.min(gameFlowSteps.length - 1, currentStep + 1))
          }
          disabled={currentStep === gameFlowSteps.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Current step content */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
            {currentStep + 1}
          </div>
          <h4 className="text-lg font-bold">{currentStepData.title}</h4>
        </div>

        <p className="text-gray-700 mb-4">{currentStepData.description}</p>

        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-4">
          {currentStepData.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>

        {/* Visual example */}
        <div className="mb-4">{renderVisual(currentStepData.visual)}</div>
      </div>

      {/* Example game toggle */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-medium">Want to see a complete example?</h5>
          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
          >
            {showExample ? "Hide" : "Show"} Full Example
          </button>
        </div>

        {showExample && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="font-medium mb-3">Complete Section Example</h6>

            <div className="space-y-4 text-sm">
              <div>
                <strong>Setup:</strong> Section 3, Trump is Hearts ♥, each
                player gets 3 cards
              </div>

              <div>
                <strong>Bidding:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>You bid 2 (confident with trump cards)</li>
                  <li>Alice bids 1 (cautious)</li>
                  <li>Bob bids 0 (risky zero bid)</li>
                  <li>
                    Carol bids 1 (total = 4, but only 3 tricks available!)
                  </li>
                </ul>
              </div>

              <div>
                <strong>Bid Review:</strong> All bids are revealed and everyone can see the situation. 
                Admin starts the playing phase when ready.
              </div>

              <div>
                <strong>Playing:</strong> 3 tricks played, you win 2 exactly as
                bid!
              </div>

              <div>
                <strong>Scoring:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>
                    <strong>You:</strong> Bid 2, won 2 = 10 + 2 = 12 points
                  </li>
                  <li>
                    <strong>Alice:</strong> Bid 1, won 0 = 0 points (missed bid)
                  </li>
                  <li>
                    <strong>Bob:</strong> Bid 0, won 1 = 0 points (missed bid)
                  </li>
                  <li>
                    <strong>Carol:</strong> Bid 1, won 1 = 10 + 1 = 11 points
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation hint */}
      <div className="text-center text-sm text-gray-500 mt-6">
        {currentStep < gameFlowSteps.length - 1
          ? `Step ${currentStep + 1} of ${
              gameFlowSteps.length
            } - Click "Next" to continue`
          : "You've completed the walkthrough! Try the other tutorials to master Jøssing."}
      </div>
    </div>
  );
}
