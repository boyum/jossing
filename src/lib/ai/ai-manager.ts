import type { Card, Suit, AIDifficulty } from "@/types/game";
import { BaseAI, type GameContext } from "./base-ai";
import { EasyAI } from "./easy-ai";
import { MediumAI } from "./medium-ai";
import { HardAI } from "./hard-ai";

/**
 * Create an AI player of the specified difficulty
 */
export function createAI(
	difficulty: AIDifficulty,
	playerName?: string,
): BaseAI {
	switch (difficulty) {
		case "easy":
			return new EasyAI(playerName || generateAIName(difficulty));
		case "medium":
			return new MediumAI(playerName || generateAIName(difficulty));
		case "hard":
			return new HardAI(playerName || generateAIName(difficulty));
		default:
			return new EasyAI(playerName || generateAIName("easy"));
	}
}

/**
 * Generate a thematic name for an AI based on difficulty
 */
function generateAIName(difficulty: AIDifficulty): string {
	const names: Record<AIDifficulty, string[]> = {
		easy: [
			"Rookie Riley",
			"Beginner Bob",
			"Cautious Clara",
			"Simple Sam",
			"Learning Lucy",
			"Careful Carl",
		],
		medium: [
			"Strategic Steve",
			"Tactical Tom",
			"Clever Claire",
			"Methodical Mike",
			"Analytical Anna",
			"Calculating Cal",
		],
		hard: [
			"Master Magnus",
			"Expert Elena",
			"Grandmaster Gary",
			"Prodigy Petra",
			"Genius Greg",
			"Virtuoso Vera",
		],
	};

	const difficultyNames = names[difficulty];
	return difficultyNames[Math.floor(Math.random() * difficultyNames.length)];
}

/**
 * Get all available AI difficulties
 */
export function getAvailableDifficulties(): AIDifficulty[] {
	return ["easy", "medium", "hard"];
}

/**
 * Get difficulty display names
 */
export function getDifficultyDisplayName(difficulty: AIDifficulty): string {
	const displayNames: Record<AIDifficulty, string> = {
		easy: "Easy (Beginner Friendly)",
		medium: "Medium (Strategic Play)",
		hard: "Hard (Expert Level)",
	};
	return displayNames[difficulty];
}

/**
 * Get difficulty descriptions
 */
export function getDifficultyDescription(difficulty: AIDifficulty): string {
	const descriptions: Record<AIDifficulty, string> = {
		easy: "Conservative bidding, basic card play, 20% random decisions for unpredictability.",
		medium:
			"Strategic bidding with position awareness, card counting, trump management.",
		hard: "Expert analysis, opponent modeling, optimal play with minimal randomness.",
	};
	return descriptions[difficulty];
}

/**
 * Manager for handling AI players in a game session
 */
export class AIManager {
	private aiPlayers: Map<string, BaseAI> = new Map();
	private playerGameContext: Map<string, GameContext> = new Map();

	/**
	 * Add an AI player to the manager
	 */
	addAIPlayer(
		playerId: string,
		difficulty: AIDifficulty,
		playerName?: string,
	): BaseAI {
		const ai = createAI(difficulty, playerName);
		this.aiPlayers.set(playerId, ai);
		return ai;
	}

	/**
	 * Remove an AI player from the manager
	 */
	removeAIPlayer(playerId: string): void {
		this.aiPlayers.delete(playerId);
		this.playerGameContext.delete(playerId);
	}

	/**
	 * Get an AI player by ID
	 */
	getAIPlayer(playerId: string): BaseAI | undefined {
		return this.aiPlayers.get(playerId);
	}

	/**
	 * Check if a player is an AI
	 */
	isAIPlayer(playerId: string): boolean {
		return this.aiPlayers.has(playerId);
	}

	/**
	 * Make a bid for an AI player
	 */
	async makeAIBid(
		playerId: string,
		hand: Card[],
		maxBid: number,
		trumpSuit: Suit,
		position: number,
		opponentBids: number[],
	): Promise<number | null> {
		const ai = this.aiPlayers.get(playerId);
		if (!ai) return null;

		// Simulate thinking time
		await ai.simulateThinking();

		// Record opponent bids for learning
		opponentBids.forEach((bid, index) => {
			ai.recordOpponentBid(`opponent_${index}`, bid);
		});

		return ai.makeBid(hand, maxBid, trumpSuit, position, opponentBids);
	}

	/**
	 * Play a card for an AI player
	 */
	async playAICard(
		playerId: string,
		hand: Card[],
		currentTrick: Card[],
		trumpSuit: Suit,
		leadingSuit?: Suit,
		gameContext?: GameContext,
	): Promise<Card | null> {
		const ai = this.aiPlayers.get(playerId);
		if (!ai) return null;

		// Update game context for this player
		if (gameContext) {
			this.playerGameContext.set(playerId, gameContext);
		}

		// Simulate thinking time
		await ai.simulateThinking();

		// Record played cards for memory
		for (const card of currentTrick) {
			ai.recordCardPlayed(card, "unknown"); // In real implementation, would track specific players
		}

		return ai.playCard(hand, currentTrick, trumpSuit, leadingSuit, gameContext);
	}

	/**
	 * Get AI thoughts for debugging/educational purposes
	 */
	getAIThought(playerId: string): string | null {
		const ai = this.aiPlayers.get(playerId);
		return ai ? ai.getThought() : null;
	}

	/**
	 * Get AI difficulty for a player
	 */
	getAIDifficulty(playerId: string): AIDifficulty | null {
		const ai = this.aiPlayers.get(playerId);
		return ai ? ai.getDifficulty() : null;
	}

	/**
	 * Get all AI player IDs
	 */
	getAIPlayerIds(): string[] {
		return Array.from(this.aiPlayers.keys());
	}

	/**
	 * Get AI statistics for a player
	 */
	getAIStats(playerId: string): AIStats | null {
		const ai = this.aiPlayers.get(playerId);
		if (!ai) return null;

		return {
			name: ai.getName(),
			difficulty: ai.getDifficulty(),
			gamesPlayed: 0, // Would track this in real implementation
			winRate: 0, // Would calculate from game history
			averageScore: 0, // Would calculate from game history
		};
	}

	/**
	 * Reset AI memory (useful between games)
	 */
	resetAIMemory(playerId: string): void {
		const ai = this.aiPlayers.get(playerId);
		if (ai) {
			// Reset memory - specific implementation would depend on AI class structure
			this.playerGameContext.delete(playerId);
		}
	}

	/**
	 * Clear all AI players
	 */
	clearAllAI(): void {
		this.aiPlayers.clear();
		this.playerGameContext.clear();
	}

	/**
	 * Get summary of all AI players
	 */
	getAISummary(): AISummary {
		const summary: AISummary = {
			totalAIs: this.aiPlayers.size,
			difficulties: { easy: 0, medium: 0, hard: 0 },
			players: [],
		};

		for (const [playerId, ai] of this.aiPlayers.entries()) {
			const difficulty = ai.getDifficulty();
			summary.difficulties[difficulty]++;
			summary.players.push({
				playerId,
				name: ai.getName(),
				difficulty,
			});
		}

		return summary;
	}
}

// Supporting interfaces
export interface AIStats {
	name: string;
	difficulty: AIDifficulty;
	gamesPlayed: number;
	winRate: number;
	averageScore: number;
}

export interface AISummary {
	totalAIs: number;
	difficulties: Record<AIDifficulty, number>;
	players: Array<{
		playerId: string;
		name: string;
		difficulty: AIDifficulty;
	}>;
}

// Export everything for easy access
export { BaseAI, EasyAI, MediumAI, HardAI };
export type { GameContext } from "./base-ai";

// Create a default instance for global use
export const aiManager = new AIManager();
