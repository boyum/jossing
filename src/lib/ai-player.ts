import type { Card, Suit } from '@/types/game';

/**
 * The most basic AI player - makes completely random decisions
 * This AI has no strategy whatsoever and serves as the easiest opponent
 */
export class RandomAI {
  private playerName: string;

  constructor(playerName: string = 'AI Bot') {
    this.playerName = playerName;
  }

  getName(): string {
    return this.playerName;
  }

  /**
   * Make a completely random bid between 0 and maxBid
   * No consideration of hand strength, trump suit, or strategy
   */
  makeBid(hand: Card[], maxBid: number, _trumpSuit: Suit): number {
    // Intentionally ignore hand and trump suit - this AI is completely random
    return Math.floor(Math.random() * (maxBid + 1));
  }

  /**
   * Play a completely random valid card
   * Only follows basic rules (must follow suit if possible)
   * No strategy, no consideration of winning tricks or trump cards
   */
  playCard(
    hand: Card[],
    currentTrick: Card[],
    _trumpSuit: Suit,
    leadingSuit?: Suit
  ): Card {
    if (hand.length === 0) {
      throw new Error('Cannot play card from empty hand');
    }

    let validCards = [...hand];

    // If there's a leading suit and we have cards of that suit, we must follow suit
    if (leadingSuit && currentTrick.length > 0) {
      const suitCards = hand.filter(card => card.suit === leadingSuit);
      if (suitCards.length > 0) {
        validCards = suitCards;
      }
    }

    // Pick a completely random valid card
    const randomIndex = Math.floor(Math.random() * validCards.length);
    return validCards[randomIndex];
  }

  /**
   * Get a hint about what this AI is thinking (for educational purposes)
   * Since this AI doesn't think at all, it just admits to being random
   */
  getThought(): string {
    const thoughts = [
      "I'll just pick something random!",
      "Eeny, meeny, miny, moe...",
      "Let's see what happens!",
      "I have no idea what I'm doing!",
      "Random choice time!",
      "Throwing darts at the board!",
      "Pure luck strategy!",
      "Why think when you can guess?",
    ];
    
    return thoughts[Math.floor(Math.random() * thoughts.length)];
  }

  /**
   * Get AI difficulty level
   */
  getDifficulty(): 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' {
    return 'beginner';
  }

  /**
   * Helper method to check if a card can be legally played
   */
  private isValidPlay(
    card: Card,
    hand: Card[],
    currentTrick: Card[],
    leadingSuit?: Suit
  ): boolean {
    // Must be in hand
    if (!hand.some(c => c.suit === card.suit && c.rank === card.rank)) {
      return false;
    }

    // If no leading suit, any card is valid
    if (!leadingSuit || currentTrick.length === 0) {
      return true;
    }

    // If we have the leading suit, we must play it
    const hasSuit = hand.some(c => c.suit === leadingSuit);
    if (hasSuit && card.suit !== leadingSuit) {
      return false;
    }

    return true;
  }

  /**
   * Simulate the AI taking some time to "think" (purely for UI purposes)
   */
  async simulateThinking(minMs: number = 500, maxMs: number = 2000): Promise<void> {
    const thinkingTime = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, thinkingTime));
  }
}

/**
 * Factory function to create AI players with different personalities
 */
export function createRandomAI(personality?: 'confused' | 'reckless' | 'lucky'): RandomAI {
  const names = {
    confused: 'Confused Carl',
    reckless: 'Reckless Rita',
    lucky: 'Lucky Larry',
    default: 'Random Bot'
  };

  return new RandomAI(names[personality || 'default']);
}

/**
 * Helper function to add AI players to a game session
 */
export function getAIPlayerName(index: number): string {
  const names = [
    'Random Bot 1',
    'Chaos Charlie',
    'Lucky Lucy',
    'Dizzy Dave',
    'Scatter Sam',
    'Wild Willie'
  ];
  
  return names[index % names.length];
}
