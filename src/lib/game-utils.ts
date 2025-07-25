import type { Card } from '@/types/game';
import { Suit, Rank, RANK_VALUES } from '@/types/game';

/**
 * Creates a new card instance
 */
export function createCard(suit: Suit, rank: Rank): Card {
  return {
    suit,
    rank,
    value: RANK_VALUES[rank]
  };
}

/**
 * Creates a full deck of 52 cards
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(Rank)) {
      deck.push(createCard(suit, rank));
    }
  }
  
  return deck;
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Shuffles a deck of cards
 */
export function shuffleDeck(deck: Card[]): Card[] {
  return shuffleArray(deck);
}

/**
 * Deals cards to players from a deck
 */
export function dealCards(deck: Card[], numPlayers: number, cardsPerPlayer: number): {
  hands: Card[][];
  trumpCard: Card;
  remainingDeck: Card[];
} {
  const shuffledDeck = shuffleDeck(deck);
  const hands: Card[][] = [];
  
  // Initialize empty hands for each player
  for (let i = 0; i < numPlayers; i++) {
    hands[i] = [];
  }
  
  // Deal cards round-robin style
  let cardIndex = 0;
  for (let round = 0; round < cardsPerPlayer; round++) {
    for (let player = 0; player < numPlayers; player++) {
      if (cardIndex < shuffledDeck.length) {
        hands[player].push(shuffledDeck[cardIndex]);
        cardIndex++;
      }
    }
  }
  
  // Set trump card (next card after dealing)
  const trumpCard = shuffledDeck[cardIndex];
  cardIndex++;
  
  // Remaining deck
  const remainingDeck = shuffledDeck.slice(cardIndex);
  
  return { hands, trumpCard, remainingDeck };
}

/**
 * Determines if one card beats another in a trick
 */
export function cardBeats(
  card: Card, 
  currentWinner: Card, 
  trumpSuit: Suit, 
  leadingSuit: Suit
): boolean {
  // Trump always beats non-trump
  if (card.suit === trumpSuit && currentWinner.suit !== trumpSuit) {
    return true;
  }
  
  // Higher trump beats lower trump
  if (card.suit === trumpSuit && currentWinner.suit === trumpSuit) {
    return card.value > currentWinner.value;
  }
  
  // Non-trump cannot beat trump
  if (card.suit !== trumpSuit && currentWinner.suit === trumpSuit) {
    return false;
  }
  
  // Within leading suit, higher value wins
  if (card.suit === leadingSuit && currentWinner.suit === leadingSuit) {
    return card.value > currentWinner.value;
  }
  
  // Leading suit beats off-suit
  if (card.suit === leadingSuit && currentWinner.suit !== leadingSuit) {
    return true;
  }
  
  return false;
}

/**
 * Determines the winner of a trick
 */
export function getTrickWinner(
  cardsPlayed: Record<number, Card>,
  leadPlayerPosition: number,
  trumpSuit: Suit,
  leadingSuit: Suit
): number {
  let winnerPosition = leadPlayerPosition;
  let winningCard = cardsPlayed[leadPlayerPosition];
  
  for (const [position, card] of Object.entries(cardsPlayed)) {
    const playerPosition = parseInt(position);
    if (cardBeats(card, winningCard, trumpSuit, leadingSuit)) {
      winnerPosition = playerPosition;
      winningCard = card;
    }
  }
  
  return winnerPosition;
}

/**
 * Validates if a player can play a specific card
 */
export function canPlayCard(
  card: Card,
  hand: Card[],
  leadingSuit?: Suit
): boolean {
  // Check if player has the card
  if (!hand.some(c => c.suit === card.suit && c.rank === card.rank)) {
    return false;
  }
  
  // If no leading suit (first card), any card is valid
  if (!leadingSuit) {
    return true;
  }
  
  // Check if player must follow suit
  const hasLeadingSuit = hand.some(c => c.suit === leadingSuit);
  if (hasLeadingSuit && card.suit !== leadingSuit) {
    return false;
  }
  
  return true;
}

/**
 * Calculates score based on bid and tricks won
 */
export function calculateScore(
  bid: number,
  tricksWon: number,
  scoringSystem: 'classic' | 'modern'
): number {
  if (bid === tricksWon) {
    // Exact bid achieved
    if (scoringSystem === 'classic') {
      return 10 + bid;
    } else {
      return 5 * (bid + 1);
    }
  } else {
    // Missed bid
    return 0;
  }
}

/**
 * Determines how many cards each player gets in a section
 */
export function getCardsPerPlayer(sectionNumber: number, gameType: 'up' | 'up-and-down'): number {
  if (gameType === 'up') {
    return sectionNumber;
  } else {
    // up-and-down
    if (sectionNumber <= 10) {
      return sectionNumber;
    } else {
      return 21 - sectionNumber;
    }
  }
}

/**
 * Validates if a bid is valid for the current section
 */
export function isValidBid(bid: number, maxCards: number): boolean {
  return bid >= 0 && bid <= maxCards && Number.isInteger(bid);
}

/**
 * Generates a random session ID
 */
export function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Compares two cards for equality
 */
export function cardsEqual(card1: Card, card2: Card): boolean {
  return card1.suit === card2.suit && card1.rank === card2.rank;
}

/**
 * Gets the next player position in clockwise order
 */
export function getNextPlayer(currentPosition: number, totalPlayers: number): number {
  return (currentPosition + 1) % totalPlayers;
}

/**
 * Gets unicode symbol for a suit
 */
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case Suit.HEARTS:
      return '♥';
    case Suit.DIAMONDS:
      return '♦';
    case Suit.CLUBS:
      return '♣';
    case Suit.SPADES:
      return '♠';
    default:
      console.error(`Unknown suit: ${suit}`);
      return 'ERROR';
  }
}

/**
 * Converts a card to a string representation
 */
export function cardToString(card: Card): string {
  return `${card.rank}${getSuitSymbol(card.suit)}`;
}

/**
 * Sorts a hand of cards for display
 */
export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort((a, b) => {
    // Sort by suit first, then by value
    if (a.suit !== b.suit) {
      const suitOrder = [Suit.CLUBS, Suit.DIAMONDS, Suit.HEARTS, Suit.SPADES];
      return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
    }
    return a.value - b.value;
  });
}
