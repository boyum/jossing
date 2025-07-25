import type { Card, Suit } from "@/types/game";
import { RANK_VALUES } from "@/types/game";
import { BaseAI, type HandStrength, type GameContext } from "./base-ai";

/**
 * Medium AI - Intermediate challenge with better strategy
 *
 * Bidding Strategy:
 * - Analyzes hand strength more comprehensively
 * - Considers position relative to dealer
 * - Factors in trump suit distribution
 * - 10% randomness factor
 * - Basic opponent modeling (remembers previous bids)
 *
 * Playing Strategy:
 * - Tracks which cards have been played
 * - Basic trump management (saves trump for important tricks)
 * - Considers trick count vs bid requirements
 * - Attempts to set opponents when profitable
 * - 10% random play for unpredictability
 */
export class MediumAI extends BaseAI {
  private playedCards: Set<string> = new Set();
  private sectionOpponentBids: Record<string, number> = {};

  constructor(playerName: string = "Medium AI") {
    super(playerName, "medium");
  }

  /**
   * Make a strategic bid considering position and opponents
   */
  makeBid(
    hand: Card[],
    maxBid: number,
    trumpSuit: Suit,
    position: number,
    opponentBids: number[],
  ): number {
    const handStrength = this.calculateHandStrength(hand, trumpSuit);

    // More sophisticated trick estimation
    let estimatedTricks = this.estimateAdvancedTricks(handStrength, trumpSuit);

    // Position adjustment - later positions can bid more aggressively
    const positionFactor = position / 4; // 0 to 1
    estimatedTricks += positionFactor * 0.5;

    // Opponent modeling - adjust based on what others have bid
    const opponentFactor = this.analyzeOpponentBids(opponentBids, hand.length);
    estimatedTricks -= opponentFactor;

    // Less conservative than Easy AI
    const strategicBid = Math.max(0, Math.round(estimatedTricks));

    // Add moderate randomness (10%)
    const finalBid = this.addRandomness(strategicBid, 0.1);

    return Math.min(finalBid, maxBid);
  }

  /**
   * Play with intermediate strategy and memory
   */
  playCard(
    hand: Card[],
    currentTrick: Card[],
    trumpSuit: Suit,
    leadingSuit?: Suit,
    gameContext?: GameContext,
  ): Card {
    const validCards = this.getValidCards(hand, currentTrick, leadingSuit);

    // Update memory with played cards
    for (const card of currentTrick) {
      this.playedCards.add(this.cardToString(card));
    }

    // 10% chance of random play for unpredictability
    if (Math.random() < 0.1) {
      return this.playRandomCard(validCards);
    }

    // If leading the trick, use strategic leading
    if (currentTrick.length === 0) {
      return this.leadStrategically(validCards, trumpSuit, gameContext);
    }

    // If following, use advanced following strategy
    return this.followStrategically(
      validCards,
      currentTrick,
      trumpSuit,
      leadingSuit,
      gameContext,
    );
  }

  /**
   * More sophisticated trick estimation
   */
  private estimateAdvancedTricks(
    handStrength: HandStrength,
    trumpSuit: Suit,
  ): number {
    let estimatedTricks = 0;

    // High card analysis with suit consideration
    for (const [suit, count] of Object.entries(handStrength.distribution)) {
      if (suit === trumpSuit) {
        // Trump tricks
        estimatedTricks += Math.min(count, handStrength.highTrumps + 1);
      } else {
        // Non-trump tricks - consider if we have high cards and length
        const suitValue = count > 3 ? 1 : count > 1 ? 0.5 : 0;
        estimatedTricks += suitValue;
      }
    }

    // Ruffing potential
    estimatedTricks += handStrength.voidSuits * handStrength.trumpCount * 0.3;

    // Short suit potential
    estimatedTricks += handStrength.shortSuits * 0.2;

    return estimatedTricks;
  }

  /**
   * Analyze opponent bids to adjust strategy
   */
  private analyzeOpponentBids(
    opponentBids: number[],
    handSize: number,
  ): number {
    if (opponentBids.length === 0) return 0;

    const totalOpponentBids = opponentBids.reduce((sum, bid) => sum + bid, 0);
    const averageOpponentBid = totalOpponentBids / opponentBids.length;

    // If opponents are bidding aggressively, be more conservative
    const expectedBidsForHandSize = handSize * 0.3; // Rough estimate

    if (averageOpponentBid > expectedBidsForHandSize) {
      return 0.5; // More conservative
    } else if (averageOpponentBid < expectedBidsForHandSize * 0.5) {
      return -0.3; // More aggressive
    }

    return 0;
  }

  /**
   * Strategic leading with memory and planning
   */
  private leadStrategically(
    validCards: Card[],
    trumpSuit: Suit,
    gameContext?: GameContext,
  ): Card {
    if (!gameContext) {
      return this.leadBasicStrategy(validCards, trumpSuit);
    }

    // If we need tricks, lead high
    const tricksNeeded = this.calculateTricksNeeded(gameContext);

    if (tricksNeeded > 0) {
      return this.leadForTricks(validCards, trumpSuit);
    } else {
      return this.leadForSafety(validCards, trumpSuit);
    }
  }

  /**
   * Strategic following with memory and trump management
   */
  private followStrategically(
    validCards: Card[],
    currentTrick: Card[],
    trumpSuit: Suit,
    leadingSuit?: Suit,
    gameContext?: GameContext,
  ): Card {
    const tricksNeeded = gameContext
      ? this.calculateTricksNeeded(gameContext)
      : 0;
    const canWin = validCards.some((card) =>
      this.canWinTrick(card, currentTrick, trumpSuit, leadingSuit),
    );

    if (tricksNeeded > 0 && canWin) {
      // Need tricks and can win - play strategically to win
      return this.winTrickEfficiently(
        validCards,
        currentTrick,
        trumpSuit,
        leadingSuit,
      );
    } else if (tricksNeeded <= 0) {
      // Don't need tricks - try to lose or play safely
      return this.avoidWinningTrick(
        validCards,
        currentTrick,
        trumpSuit,
        leadingSuit,
      );
    } else {
      // Need tricks but can't win - play for future tricks
      return this.playForFuture(validCards, trumpSuit);
    }
  }

  /**
   * Lead to win tricks efficiently
   */
  private leadForTricks(validCards: Card[], trumpSuit: Suit): Card {
    // Lead highest non-trump first to draw out high cards
    const nonTrumps = validCards.filter((card) => card.suit !== trumpSuit);
    if (nonTrumps.length > 0) {
      return nonTrumps.reduce((highest, current) =>
        RANK_VALUES[current.rank] > RANK_VALUES[highest.rank]
          ? current
          : highest,
      );
    }

    // If only trumps, lead moderate trump
    const trumps = this.getCardsOfSuit(validCards, trumpSuit);
    return (
      trumps.find(
        (card) => RANK_VALUES[card.rank] >= 10 && RANK_VALUES[card.rank] <= 12,
      ) || trumps[0]
    );
  }

  /**
   * Lead safely to avoid unwanted tricks
   */
  private leadForSafety(validCards: Card[], trumpSuit: Suit): Card {
    // Lead lowest non-trump cards
    const nonTrumps = validCards.filter((card) => card.suit !== trumpSuit);
    if (nonTrumps.length > 0) {
      return nonTrumps.reduce((lowest, current) =>
        RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
      );
    }

    // If only trumps, lead lowest trump
    return this.getLowestOfSuit(validCards, trumpSuit) || validCards[0];
  }

  /**
   * Win a trick with the most efficient card
   */
  private winTrickEfficiently(
    validCards: Card[],
    currentTrick: Card[],
    trumpSuit: Suit,
    leadingSuit?: Suit,
  ): Card {
    const winningCards = validCards.filter((card) =>
      this.canWinTrick(card, currentTrick, trumpSuit, leadingSuit),
    );

    if (winningCards.length === 0) {
      return validCards[0]; // Fallback
    }

    // Prefer non-trump winners to save trumps
    const nonTrumpWinners = winningCards.filter(
      (card) => card.suit !== trumpSuit,
    );
    if (nonTrumpWinners.length > 0) {
      return nonTrumpWinners.reduce((lowest, current) =>
        RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
      );
    }

    // Use lowest trump that wins
    return winningCards.reduce((lowest, current) =>
      RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
    );
  }

  /**
   * Avoid winning when we don't need the trick
   */
  private avoidWinningTrick(
    validCards: Card[],
    currentTrick: Card[],
    trumpSuit: Suit,
    leadingSuit?: Suit,
  ): Card {
    const nonWinningCards = validCards.filter(
      (card) => !this.canWinTrick(card, currentTrick, trumpSuit, leadingSuit),
    );

    if (nonWinningCards.length > 0) {
      // Play highest non-winning card to get rid of high cards safely
      return nonWinningCards.reduce((highest, current) =>
        RANK_VALUES[current.rank] > RANK_VALUES[highest.rank]
          ? current
          : highest,
      );
    }

    // All cards win - play lowest
    return validCards.reduce((lowest, current) =>
      RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
    );
  }

  /**
   * Play for future positioning
   */
  private playForFuture(validCards: Card[], trumpSuit: Suit): Card {
    // Save trumps for later, play off-suit
    const nonTrumps = validCards.filter((card) => card.suit !== trumpSuit);
    if (nonTrumps.length > 0) {
      return nonTrumps.reduce((lowest, current) =>
        RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest,
      );
    }

    return validCards[0];
  }

  /**
   * Calculate how many more tricks we need
   */
  private calculateTricksNeeded(gameContext: GameContext): number {
    // Simplified - in real implementation, would track player's specific progress
    const playerBid = Object.values(gameContext.playerBids)[0] || 0;
    const tricksWon = gameContext.tricksPlayed || 0;
    return Math.max(0, playerBid - tricksWon);
  }

  /**
   * Basic leading strategy fallback
   */
  private leadBasicStrategy(validCards: Card[], trumpSuit: Suit): Card {
    const nonTrumps = validCards.filter((card) => card.suit !== trumpSuit);
    if (nonTrumps.length > 0) {
      return nonTrumps.reduce((highest, current) =>
        RANK_VALUES[current.rank] > RANK_VALUES[highest.rank]
          ? current
          : highest,
      );
    }
    return validCards[0];
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
      "Let me think strategically...",
      "Considering my options carefully.",
      "This needs some planning.",
      "Analyzing the situation...",
      "What's the best move here?",
      "Thinking about trump management.",
      "Need to consider the bid count.",
      "Playing with more strategy now.",
    ];

    return thoughts[Math.floor(Math.random() * thoughts.length)];
  }
}
