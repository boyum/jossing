import { RANK_VALUES, type Card, type Suit } from "@/types/game";
import { BaseAI, type HandStrength, type GameContext } from "./base-ai";

/**
 * Easy AI - Conservative and predictable with basic strategy
 *
 * Bidding Strategy:
 * - Conservative approach, bids slightly under estimated tricks
 * - 15% randomness factor for uncertainty
 * - Only considers basic card strength (high cards, trump cards)
 * - No advanced position analysis
 *
 * Playing Strategy:
 * - Follows suit correctly but doesn't optimize
 * - Plays high cards when trying to win tricks
 * - Plays low cards when trying to avoid tricks
 * - No complex trump management
 * - 20% random suboptimal play for realism
 */
export class EasyAI extends BaseAI {
  constructor(playerName: string = "Easy AI") {
    super(playerName, "easy");
  }

  /**
   * Make a conservative bid based on basic hand analysis
   */
  makeBid(
    hand: Card[],
    maxBid: number,
    trumpSuit: Suit,
    _position: number,
    _opponentBids: number[],
  ): number {
    const handStrength = this.calculateHandStrength(hand, trumpSuit);

    // Basic strength calculation - count high cards and trumps
    const estimatedTricks = this.estimateBasicTricks(handStrength);

    // Conservative adjustment - bid one less than estimated
    const conservativeBid = Math.max(0, estimatedTricks - 1);

    // Add some randomness (15%)
    const finalBid = this.addRandomness(conservativeBid, 0.15);

    return Math.min(finalBid, maxBid);
  }

  /**
   * Play a card with basic strategy
   */
  playCard(
    hand: Card[],
    currentTrick: Card[],
    trumpSuit: Suit,
    leadingSuit?: Suit,
    gameContext?: GameContext,
  ): Card {
    const validCards = this.getValidCards(hand, currentTrick, leadingSuit);

    // 20% chance of random play for unpredictability
    if (Math.random() < 0.2) {
      return this.playRandomCard(validCards);
    }

    // If leading the trick, play based on simple strategy
    if (currentTrick.length === 0) {
      return this.leadTrick(validCards, trumpSuit, gameContext);
    }

    // If following, decide whether to try to win or lose
    const shouldTryToWin = this.shouldTryToWinTrick(gameContext);

    if (shouldTryToWin) {
      return this.tryToWinTrick(
        validCards,
        currentTrick,
        trumpSuit,
        leadingSuit,
      );
    } else {
      return this.tryToLoseTrick(
        validCards,
        currentTrick,
        trumpSuit,
        leadingSuit,
      );
    }
  }

  /**
   * Basic trick estimation based on hand strength
   */
  private estimateBasicTricks(handStrength: HandStrength): number {
    let estimatedTricks = 0;

    // Count high cards (J, Q, K, A)
    estimatedTricks += Math.floor(handStrength.highCardPoints / 3);

    // Count trump cards
    estimatedTricks += Math.floor(handStrength.trumpCount / 2);

    // Bonus for high trumps
    estimatedTricks += handStrength.highTrumps;

    // Small bonus for void suits (ruffing opportunities)
    estimatedTricks += handStrength.voidSuits * 0.5;

    return Math.round(estimatedTricks);
  }

  /**
   * Simple strategy for leading a trick
   */
  private leadTrick(
    validCards: Card[],
    trumpSuit: Suit,
    _gameContext?: GameContext,
  ): Card {
    // Try to lead with a high card in a long suit
    const nonTrumpCards = validCards.filter((card) => card.suit !== trumpSuit);

    if (nonTrumpCards.length > 0) {
      // Lead highest non-trump card
      return nonTrumpCards.reduce((highest, current) =>
        RANK_VALUES[current.rank] > RANK_VALUES[highest.rank]
          ? current
          : highest,
      );
    }

    // If only trump cards, lead lowest trump
    return this.getLowestOfSuit(validCards, trumpSuit) || validCards[0];
  }

  /**
   * Try to win the current trick
   */
  private tryToWinTrick(
    validCards: Card[],
    currentTrick: Card[],
    trumpSuit: Suit,
    leadingSuit?: Suit,
  ): Card {
    // Find cards that can win the trick
    const winningCards = validCards.filter((card) =>
      this.canWinTrick(card, currentTrick, trumpSuit, leadingSuit),
    );

    if (winningCards.length > 0) {
      // Play the lowest winning card
      return winningCards.reduce((lowest, current) =>
        RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
      );
    }

    // Can't win, play lowest card
    return validCards.reduce((lowest, current) =>
      RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
    );
  }

  /**
   * Try to lose the current trick
   */
  private tryToLoseTrick(
    validCards: Card[],
    currentTrick: Card[],
    trumpSuit: Suit,
    leadingSuit?: Suit,
  ): Card {
    // Play the lowest card that won't win
    const nonWinningCards = validCards.filter(
      (card) => !this.canWinTrick(card, currentTrick, trumpSuit, leadingSuit),
    );

    if (nonWinningCards.length > 0) {
      return nonWinningCards.reduce((lowest, current) =>
        RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
      );
    }

    // All cards would win, play the lowest
    return validCards.reduce((lowest, current) =>
      RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
    );
  }

  /**
   * Simple decision on whether to try to win a trick
   */
  private shouldTryToWinTrick(gameContext?: GameContext): boolean {
    if (!gameContext) {
      return Math.random() > 0.5; // Random if no context
    }

    // Very basic logic: try to win if we need more tricks for our bid
    const playerBid = Object.values(gameContext.playerBids)[0] || 0; // Simplified
    const tricksNeeded = playerBid - (gameContext.tricksPlayed || 0);

    return tricksNeeded > 0;
  }

  /**
   * Play a random valid card
   */
  private playRandomCard(validCards: Card[]): Card {
    const randomIndex = Math.floor(Math.random() * validCards.length);
    return validCards[randomIndex];
  }

  /**
   * Get a hint about what this AI is thinking
   */
  getThought(): string {
    const thoughts = [
      "Let me play it safe...",
      "I'll try a conservative approach.",
      "This should be okay.",
      "Playing carefully here.",
      "Better safe than sorry!",
      "I think this is reasonable.",
      "Hope this works out.",
      "Going with my gut feeling.",
    ];

    return thoughts[Math.floor(Math.random() * thoughts.length)];
  }
}
