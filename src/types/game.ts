// Core game types for Jøssing card game

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14
};

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type GameType = 'up' | 'up_and_down';

export type ScoringSystem = 'classic' | 'modern';

export type GamePhase = 'waiting' | 'bidding' | 'playing' | 'scoring' | 'finished';

export type SectionPhase = 'dealing' | 'bidding' | 'bid_review' | 'playing' | 'completed';

export interface GameSession {
  id: string;
  adminPlayerId: string;
  gameType: GameType;
  scoringSystem: ScoringSystem;
  maxPlayers: number;
  currentSection: number;
  gamePhase: GamePhase;
  createdAt: Date;
  updatedAt: Date;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  sessionId: string;
  name: string;
  isAdmin: boolean;
  position: number;
  totalScore: number;
  isConnected: boolean;
  joinedAt: Date;
  isAI?: boolean; // Optional flag to identify AI players
  aiDifficulty?: AIDifficulty; // AI difficulty level
}

export interface Bid {
  playerId: string;
  playerName: string;
  bid: number;
  timestamp: Date;
}

export interface SectionState {
  id: string;
  sessionId: string;
  sectionNumber: number;
  dealerPosition: number;
  leadPlayerPosition?: number;
  currentBidderPosition?: number;
  trumpSuit: Suit;
  trumpCardRank: Rank;
  phase: SectionPhase;
  bids: Bid[];
  createdAt: Date;
}

export interface PlayerHand {
  id: string;
  sectionStateId: string;
  playerId: string;
  cards: Card[];
  bid?: number;
  tricksWon: number;
  sectionScore: number;
}

export interface Trick {
  id: string;
  sectionStateId: string;
  trickNumber: number;
  leadPlayerPosition: number;
  leadingSuit?: Suit;
  winnerPosition?: number;
  completedAt?: Date;
}

export interface TrickCard {
  id: string;
  trickId: string;
  playerPosition: number;
  cardSuit: Suit;
  cardRank: Rank;
  playedAt: Date;
}

export interface TrickWithCards extends Trick {
  cardsPlayed: TrickCard[];
}

// Client-side game state interfaces
export interface GameState {
  session: GameSession;
  players: Player[];
  currentSection?: SectionState;
  playerHand?: Card[];
  isPlayerTurn: boolean;
  currentTrick?: Trick;
  sectionScores: Record<string, number>;
  totalScores: Record<string, number>;
}

// API request/response types
export interface CreateSessionRequest {
  adminName: string;
  gameType: GameType;
  scoringSystem: ScoringSystem;
  maxPlayers: number;
}

export interface CreateSessionResponse {
  sessionId: string;
  playerId: string;
}

export interface JoinSessionRequest {
  playerName: string;
}

export interface JoinSessionResponse {
  playerId: string;
  position: number;
  gameState: GameState;
}

export interface PlaceBidRequest {
  playerId: string;
  bid: number;
}

export interface PlayCardRequest {
  playerId: string;
  card: Card;
}

// Socket event types
export interface SocketEvents {
  'join-room': { sessionId: string; playerId: string };
  'leave-room': { sessionId: string; playerId: string };
  'player-ready': { sessionId: string; playerId: string };
  'heartbeat': { playerId: string };
}

export interface SocketEmissions {
  'player-joined': { player: Player };
  'player-left': { playerId: string };
  'game-started': { gameState: GameState };
  'cards-dealt': { hand: Card[]; trumpSuit: Suit; trumpCard: Card };
  'bidding-started': { timeLimit: number };
  'all-bids-placed': { bids: Record<string, number> };
  'card-played': { playerId: string; card: Card };
  'trick-completed': { winner: string; nextLeader: string };
  'section-completed': { scores: Record<string, number> };
  'game-ended': { finalScores: Record<string, number>; winner: string };
  'player-disconnected': { playerId: string };
  'player-reconnected': { playerId: string };
  'error': { message: string; code: string };
}
