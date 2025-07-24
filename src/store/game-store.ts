import { create } from 'zustand';
import type { Socket } from 'socket.io-client';
import type { 
  Card, 
  GameSession, 
  Player, 
  SectionState, 
  Trick, 
  GamePhase 
} from '@/types/game';

interface GameStore {
  // Game state
  session: GameSession | null;
  playerId: string | null;
  players: Player[];
  currentSection: SectionState | null;
  playerHand: Card[];
  isPlayerTurn: boolean;
  currentTrick: Trick | null;
  sectionScores: Record<string, number>;
  totalScores: Record<string, number>;
  
  // Socket connection
  socket: Socket | null;
  isConnected: boolean;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: GameSession | null) => void;
  setPlayerId: (id: string | null) => void;
  updatePlayers: (players: Player[]) => void;
  updateGamePhase: (phase: GamePhase) => void;
  setPlayerHand: (cards: Card[]) => void;
  playCard: (card: Card) => void;
  placeBid: (bid: number) => void;
  updateCurrentSection: (section: SectionState | null) => void;
  updateCurrentTrick: (trick: Trick | null) => void;
  updateSectionScores: (scores: Record<string, number>) => void;
  updateTotalScores: (scores: Record<string, number>) => void;
  
  // Socket management
  setSocket: (socket: Socket | null) => void;
  setConnectionStatus: (connected: boolean) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset state
  resetGame: () => void;
}

const initialState = {
  session: null,
  playerId: null,
  players: [],
  currentSection: null,
  playerHand: [],
  isPlayerTurn: false,
  currentTrick: null,
  sectionScores: {},
  totalScores: {},
  
  socket: null,
  isConnected: false,
  isLoading: false,
  error: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setSession: (session: GameSession | null) => {
    set({ session });
  },

  setPlayerId: (playerId: string | null) => {
    set({ playerId });
  },

  updatePlayers: (players: Player[]) => {
    set({ players });
  },

  updateGamePhase: (phase: GamePhase) => {
    set(state => ({
      session: state.session ? { ...state.session, gamePhase: phase } : null
    }));
  },

  setPlayerHand: (cards: Card[]) => {
    set({ playerHand: cards });
  },

  playCard: (card: Card) => {
    const { playerHand, socket, session, playerId } = get();
    
    // Optimistic update - remove card from hand
    const newHand = playerHand.filter(c => !(c.suit === card.suit && c.rank === card.rank));
    set({ playerHand: newHand, isPlayerTurn: false });
    
    // Emit to server
    if (socket && session && playerId) {
      socket.emit('play-card', { sessionId: session.id, playerId, card });
    }
  },

  placeBid: (bid: number) => {
    const { socket, session, playerId } = get();
    
    // Emit to server
    if (socket && session && playerId) {
      socket.emit('place-bid', { sessionId: session.id, playerId, bid });
    }
  },

  updateCurrentSection: (section: SectionState | null) => {
    set({ currentSection: section });
  },

  updateCurrentTrick: (trick: Trick | null) => {
    set({ currentTrick: trick });
  },

  updateSectionScores: (scores: Record<string, number>) => {
    set({ sectionScores: scores });
  },

  updateTotalScores: (scores: Record<string, number>) => {
    set({ totalScores: scores });
  },

  setSocket: (socket: Socket | null) => {
    set({ socket });
  },

  setConnectionStatus: (connected: boolean) => {
    set({ isConnected: connected });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  resetGame: () => {
    const { socket } = get();
    set({
      ...initialState,
      socket, // Keep socket connection
    });
  },
}));

// Selector hooks for better performance
export const useSession = () => useGameStore(state => state.session);
export const usePlayers = () => useGameStore(state => state.players);
export const usePlayerHand = () => useGameStore(state => state.playerHand);
export const useCurrentTrick = () => useGameStore(state => state.currentTrick);
export const useIsPlayerTurn = () => useGameStore(state => state.isPlayerTurn);
export const useGamePhase = () => useGameStore(state => state.session?.gamePhase);
export const useSocket = () => useGameStore(state => state.socket);
export const useIsConnected = () => useGameStore(state => state.isConnected);
export const useError = () => useGameStore(state => state.error);
export const useIsLoading = () => useGameStore(state => state.isLoading);
