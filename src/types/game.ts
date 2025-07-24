// Core game types for Jøssing card game

export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A'
}

export const RANK_VALUES: Record<Rank, number> = {
  [Rank.TWO]: 2,
  [Rank.THREE]: 3,
  [Rank.FOUR]: 4,
  [Rank.FIVE]: 5,
  [Rank.SIX]: 6,
  [Rank.SEVEN]: 7,
  [Rank.EIGHT]: 8,
  [Rank.NINE]: 9,
  [Rank.TEN]: 10,
  [Rank.JACK]: 11,
  [Rank.QUEEN]: 12,
  [Rank.KING]: 13,
  [Rank.ACE]: 14
};

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

export enum GameType {
  UP = 'up',
  UP_AND_DOWN = 'up-and-down'
}

export enum ScoringSystem {
  CLASSIC = 'classic',
  MODERN = 'modern'
}

export enum GamePhase {
  WAITING = 'waiting',
  BIDDING = 'bidding',
  PLAYING = 'playing',
  SCORING = 'scoring',
  FINISHED = 'finished'
}

export enum SectionPhase {
  DEALING = 'dealing',
  BIDDING = 'bidding',
  PLAYING = 'playing',
  COMPLETED = 'completed'
}

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
