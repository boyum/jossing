import type { Card, Suit } from '@/types/game';
import { RANK_VALUES, AIDifficulty } from '@/types/game';

/**
 * Base AI player class with common utility methods
 */
export abstract class BaseAI {
  protected playerName: string;
  protected difficulty: AIDifficulty;
  protected cardMemory: Set<string> = new Set();
  protected opponentBids: Record<string, number[]> = {};
  protected gameHistory: GameEvent[] = [];

  constructor(playerName: string, difficulty: AIDifficulty) {
    this.playerName = playerName;
    this.difficulty = difficulty;
  }

  getName(): string {
    return this.playerName;
  }

  getDifficulty(): AIDifficulty {
    return this.difficulty;
  }

  // Abstract methods that each AI difficulty must implement
  abstract makeBid(hand: Card[], maxBid: number, trumpSuit: Suit, position: number, opponentBids: number[]): number;
  abstract playCard(hand: Card[], currentTrick: Card[], trumpSuit: Suit, leadingSuit?: Suit, gameContext?: GameContext): Card;
  abstract getThought(): string;

  /**
   * Record a card that has been played for memory tracking
   */
  recordCardPlayed(card: Card, playerId: string): void {
    this.cardMemory.add(this.cardToString(card));
    this.gameHistory.push({
      type: 'card-played',
      playerId,
      card,
      timestamp: Date.now()
    });
  }

  /**
   * Record an opponent's bid for pattern learning
   */
  recordOpponentBid(playerId: string, bid: number): void {
    if (!this.opponentBids[playerId]) {
      this.opponentBids[playerId] = [];
    }
    this.opponentBids[playerId].push(bid);
    this.gameHistory.push({
      type: 'bid-placed',
      playerId,
      bid,
      timestamp: Date.now()
    });
  }

  /**
   * Get valid cards that can be played according to game rules
   */
  protected getValidCards(hand: Card[], currentTrick: Card[], leadingSuit?: Suit): Card[] {
    if (!leadingSuit || currentTrick.length === 0) {
      return [...hand];
    }

    const suitCards = hand.filter(card => card.suit === leadingSuit);
    return suitCards.length > 0 ? suitCards : [...hand];
  }

  /**
   * Calculate the strength of a hand for bidding purposes
   */
  protected calculateHandStrength(hand: Card[], trumpSuit: Suit): HandStrength {
    let highCardPoints = 0;
    let trumpCount = 0;
    let highTrumps = 0;
    const suitCounts: Record<Suit, number> = {
      hearts: 0,
      diamonds: 0,
      clubs: 0,
      spades: 0
    };

    for (const card of hand) {
      suitCounts[card.suit]++;
      
      if (card.suit === trumpSuit) {
        trumpCount++;
        if (RANK_VALUES[card.rank] >= 11) { // J, Q, K, A
          highTrumps++;
        }
      }

      // High card points (A=4, K=3, Q=2, J=1)
      if (RANK_VALUES[card.rank] >= 11) {
        const points = RANK_VALUES[card.rank] - 10;
        highCardPoints += card.suit === trumpSuit ? points * 1.5 : points;
      }
    }

    const voidSuits = Object.values(suitCounts).filter(count => count === 0).length;
    const shortSuits = Object.values(suitCounts).filter(count => count === 1).length;

    return {
      highCardPoints,
      trumpCount,
      highTrumps,
      voidSuits,
      shortSuits,
      distribution: suitCounts,
      totalCards: hand.length
    };
  }

  /**
   * Determine if a card can win the current trick
   */
  protected canWinTrick(card: Card, currentTrick: Card[], trumpSuit: Suit, leadingSuit?: Suit): boolean {
    if (currentTrick.length === 0) {
      return true; // Leading the trick
    }

    const highestCard = this.getHighestCard(currentTrick, trumpSuit, leadingSuit);
    return this.compareCards(card, highestCard, trumpSuit, leadingSuit) > 0;
  }

  /**
   * Get the highest card currently in the trick
   */
  protected getHighestCard(trick: Card[], trumpSuit: Suit, leadingSuit?: Suit): Card {
    if (trick.length === 0) {
      throw new Error('Cannot get highest card from empty trick');
    }

    return trick.reduce((highest, current) => {
      return this.compareCards(current, highest, trumpSuit, leadingSuit) > 0 ? current : highest;
    });
  }

  /**
   * Compare two cards according to trick-taking rules
   * Returns: > 0 if card1 wins, < 0 if card2 wins, 0 if equal
   */
  protected compareCards(card1: Card, card2: Card, trumpSuit: Suit, leadingSuit?: Suit): number {
    const card1IsTrump = card1.suit === trumpSuit;
    const card2IsTrump = card2.suit === trumpSuit;

    // Trump beats non-trump
    if (card1IsTrump && !card2IsTrump) return 1;
    if (!card1IsTrump && card2IsTrump) return -1;

    // Both trump or both non-trump
    if (card1IsTrump && card2IsTrump) {
      return RANK_VALUES[card1.rank] - RANK_VALUES[card2.rank];
    }

    // Non-trump cards: only leading suit can win
    if (leadingSuit) {
      const card1IsLeading = card1.suit === leadingSuit;
      const card2IsLeading = card2.suit === leadingSuit;

      if (card1IsLeading && !card2IsLeading) return 1;
      if (!card1IsLeading && card2IsLeading) return -1;

      // Both leading suit or both off-suit
      if (card1IsLeading && card2IsLeading) {
        return RANK_VALUES[card1.rank] - RANK_VALUES[card2.rank];
      }
    }

    // Both off-suit, compare by rank
    return RANK_VALUES[card1.rank] - RANK_VALUES[card2.rank];
  }

  /**
   * Add controlled randomness to decisions
   */
  protected addRandomness(value: number, factor: number): number {
    const randomAdjustment = (Math.random() - 0.5) * 2 * factor;
    return Math.max(0, Math.round(value + randomAdjustment));
  }

  /**
   * Convert a card to a string for memory tracking
   */
  protected cardToString(card: Card): string {
    return `${card.rank}${card.suit}`;
  }

  /**
   * Check if a card has been played already
   */
  protected hasCardBeenPlayed(card: Card): boolean {
    return this.cardMemory.has(this.cardToString(card));
  }

  /**
   * Get cards of a specific suit from hand
   */
  protected getCardsOfSuit(hand: Card[], suit: Suit): Card[] {
    return hand.filter(card => card.suit === suit);
  }

  /**
   * Get the highest card of a suit from hand
   */
  protected getHighestOfSuit(hand: Card[], suit: Suit): Card | null {
    const suitCards = this.getCardsOfSuit(hand, suit);
    if (suitCards.length === 0) return null;

    return suitCards.reduce((highest, current) =>
      RANK_VALUES[current.rank] > RANK_VALUES[highest.rank] ? current : highest
    );
  }

  /**
   * Get the lowest card of a suit from hand
   */
  protected getLowestOfSuit(hand: Card[], suit: Suit): Card | null {
    const suitCards = this.getCardsOfSuit(hand, suit);
    if (suitCards.length === 0) return null;

    return suitCards.reduce((lowest, current) =>
      RANK_VALUES[current.rank] < RANK_VALUES[lowest.rank] ? current : lowest
    );
  }

  /**
   * Simulate thinking time for realistic AI behavior
   */
  async simulateThinking(): Promise<void> {
    const thinkingTimes = {
      [AIDifficulty.EASY]: [1000, 3000],
      [AIDifficulty.MEDIUM]: [2000, 4000],
      [AIDifficulty.HARD]: [3000, 6000]
    };

    const [min, max] = thinkingTimes[this.difficulty];
    const thinkingTime = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, thinkingTime));
  }
}

// Supporting interfaces and types
export interface HandStrength {
  highCardPoints: number;
  trumpCount: number;
  highTrumps: number;
  voidSuits: number;
  shortSuits: number;
  distribution: Record<Suit, number>;
  totalCards: number;
}

export interface GameContext {
  currentSection: number;
  totalSections: number;
  playerBids: Record<string, number>;
  tricksPlayed: number;
  totalTricks: number;
  scores: Record<string, number>;
}

export interface GameEvent {
  type: 'card-played' | 'bid-placed' | 'trick-won';
  playerId: string;
  card?: Card;
  bid?: number;
  timestamp: number;
}
