import { create } from 'zustand';
import { gameApiService } from '@/lib/game-api-service';
import type {
  Card,
  GamePhase,
  GameSession,
  Player,
  SectionState,
  TrickWithCards,
  Bid
} from '@/types/game';

interface GameStore {
  // Game state
  session: GameSession | null;
  playerId: string | null;
  players: Player[];
  currentSection: SectionState | null;
  playerHand: Card[];
  isPlayerTurn: boolean;
  currentTrick: TrickWithCards | null;
  sectionScores: Record<string, number>;
  totalScores: Record<string, number>;
  
  // Bidding state
  sectionBids: Bid[];
  playerBid: number | null;
  currentBidder: Player | null;
  allBidsPlaced: boolean;
  
  // Connection state (polling-based)
  isConnected: boolean;
  isPolling: boolean;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: GameSession | null) => void;
  setPlayerId: (id: string | null) => void;
  updatePlayers: (players: Player[]) => void;
  updateGamePhase: (phase: GamePhase) => void;
  setPlayerHand: (cards: Card[]) => void;
  updateCurrentSection: (section: SectionState | null) => void;
  updateCurrentTrick: (trick: TrickWithCards | null) => void;
  updateSectionScores: (scores: Record<string, number>) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Game actions (API-based)
  createSession: (adminName: string) => Promise<{ sessionId: string; playerId: string } | null>;
  joinSession: (sessionId: string, playerName: string) => Promise<{ playerId: string; position: number } | null>;
  startGame: (sessionId: string, adminPlayerId: string) => Promise<boolean>;
  placeBid: (sessionId: string, bid: number) => Promise<boolean>;
  playCard: (sessionId: string, card: Card) => Promise<boolean>;
  startPlayingPhase: (sessionId: string) => Promise<boolean>;
  addAI: (sessionId: string, difficulty?: string) => Promise<boolean>;
  removeAI: (sessionId: string, playerId: string) => Promise<boolean>;
  refreshGameState: (sessionId: string) => Promise<void>;
  
  // Polling control
  startPolling: (sessionId: string, interval?: number) => void;
  stopPolling: () => void;
  
  // Reset
  resetGameState: () => void;
}

// Polling interval state
let pollingInterval: NodeJS.Timeout | null = null;

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  session: null,
  playerId: null,
  players: [],
  currentSection: null,
  playerHand: [],
  isPlayerTurn: false,
  currentTrick: null,
  sectionScores: {},
  totalScores: {},
  sectionBids: [],
  playerBid: null,
  currentBidder: null,
  allBidsPlaced: false,
  isConnected: true, // Assume connected unless API fails
  isPolling: false,
  isLoading: false,
  error: null,

  // Basic setters
  setSession: (session) => set({ session }),
  setPlayerId: (playerId) => set({ playerId }),
  updatePlayers: (players) => set({ players }),
  updateGamePhase: (phase) => set((state) => 
    state.session ? { session: { ...state.session, gamePhase: phase } } : {}
  ),
  setPlayerHand: (playerHand) => set({ playerHand }),
  updateCurrentSection: (currentSection) => set({ currentSection }),
  updateCurrentTrick: (currentTrick) => set({ currentTrick }),
  updateSectionScores: (sectionScores) => set({ sectionScores }),
  setError: (error) => set({ error, isConnected: !error }),
  setLoading: (isLoading) => set({ isLoading }),

  // API Actions
  createSession: async (adminName: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await gameApiService.createSession(adminName);
      
      // Set the playerId from the create response
      if (result?.playerId) {
        set({ 
          playerId: result.playerId,
          isLoading: false,
          error: null,
          isConnected: true
        });
      } else {
        set({ 
          isLoading: false,
          error: null,
          isConnected: true
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      set({ 
        isLoading: false, 
        error: errorMessage,
        isConnected: false
      });
      return null;
    }
  },

  joinSession: async (sessionId: string, playerName: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await gameApiService.joinSession(sessionId, playerName);
      
      // Set the playerId from the join response
      if (result?.playerId) {
        set({ 
          playerId: result.playerId,
          isLoading: false,
          error: null,
          isConnected: true
        });
      } else {
        set({ 
          isLoading: false,
          error: null,
          isConnected: true
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join session';
      set({ 
        isLoading: false, 
        error: errorMessage,
        isConnected: false
      });
      return null;
    }
  },

  startGame: async (sessionId: string, adminPlayerId: string) => {
    set({ isLoading: true, error: null });
    try {
      await gameApiService.startGame(sessionId, adminPlayerId);
      set({ 
        isLoading: false,
        error: null,
        isConnected: true
      });
      
      // Immediately refresh the game state after starting
      get().refreshGameState(sessionId);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start game';
      set({ 
        isLoading: false, 
        error: errorMessage,
        isConnected: false
      });
      return false;
    }
  },

  placeBid: async (sessionId: string, bid: number) => {
    const { playerId } = get();
    if (!playerId) return false;

    try {
      const result = await gameApiService.placeBid(sessionId, playerId, bid);
      if (result.success && result.gameState) {
        // Update store with new game state
        set({ 
          error: null,
          isConnected: true
        });
        // Trigger a refresh to get updated state
        get().refreshGameState(sessionId);
      }
      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place bid';
      set({ 
        error: errorMessage,
        isConnected: false
      });
      return false;
    }
  },

  playCard: async (sessionId: string, card: Card) => {
    const { playerId } = get();
    if (!playerId) return false;

    try {
      const result = await gameApiService.playCard(sessionId, playerId, card);
      if (result.success && result.gameState) {
        // Update store with new game state
        set({ 
          error: null,
          isConnected: true
        });
        // Trigger a refresh to get updated state
        get().refreshGameState(sessionId);
      }
      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play card';
      set({ 
        error: errorMessage,
        isConnected: false
      });
      return false;
    }
  },

  startPlayingPhase: async (sessionId: string) => {
    const { playerId } = get();
    if (!playerId) return false;

    try {
      const result = await gameApiService.startPlayingPhase(sessionId, playerId);
      if (result.success) {
        // Update store state
        set({ 
          error: null,
          isConnected: true
        });
        // Trigger a refresh to get updated state
        get().refreshGameState(sessionId);
      }
      return result.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start playing phase';
      set({ 
        error: errorMessage,
        isConnected: false
      });
      return false;
    }
  },

  addAI: async (sessionId: string, difficulty?: string) => {
    try {
      set({ isLoading: true, error: null });
      const result = await gameApiService.addAIPlayers(sessionId, difficulty);
      if (result.success) {
        // Update store with new players
        set({ 
          players: result.players || [],
          error: null,
          isConnected: true,
          isLoading: false
        });
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add AI players';
      set({ 
        error: errorMessage,
        isConnected: false,
        isLoading: false
      });
      return false;
    }
  },

  removeAI: async (sessionId: string, playerId: string) => {
    const { playerId: adminPlayerId } = get();
    if (!adminPlayerId) return false;

    try {
      set({ isLoading: true, error: null });
      const result = await gameApiService.removeAIPlayer(sessionId, playerId, adminPlayerId);
      if (result.success) {
        // Update store with new players list
        set({ 
          players: result.players || [],
          error: null,
          isConnected: true,
          isLoading: false
        });
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove AI player';
      set({ 
        error: errorMessage,
        isConnected: false,
        isLoading: false
      });
      return false;
    }
  },

  refreshGameState: async (sessionId: string) => {
    const { playerId } = get();
    if (!playerId) return;

    try {
      const gameState = await gameApiService.getGameState(sessionId, playerId);
      
      // Update store with fresh game state
      set({
        session: gameState.session,
        players: gameState.players || [],
        currentSection: gameState.currentSection,
        playerHand: gameState.playerHand || [],
        isPlayerTurn: gameState.isPlayerTurn || false,
        currentTrick: gameState.currentTrick,
        sectionScores: gameState.sectionScores || {},
        totalScores: gameState.totalScores || {},
        // Update bidding state
        sectionBids: gameState.sectionBids || [],
        playerBid: gameState.playerBid,
        currentBidder: gameState.currentBidder,
        allBidsPlaced: gameState.allBidsPlaced || false,
        error: null,
        isConnected: true
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh game state';
      set({ 
        error: errorMessage,
        isConnected: false
      });
    }
  },

  // Polling control
  startPolling: (sessionId: string, interval = 1000) => {
    const { stopPolling, refreshGameState } = get();
    
    // Stop any existing polling
    stopPolling();
    
    set({ isPolling: true });
    
    // Start new polling interval
    pollingInterval = setInterval(() => {
      refreshGameState(sessionId);
    }, interval);
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({ isPolling: false });
  },

  // Reset game state (for new games)
  resetGameState: () => {
    get().stopPolling();
    set({
      session: null,
      playerId: null,
      players: [],
      currentSection: null,
      playerHand: [],
      isPlayerTurn: false,
      currentTrick: null,
      sectionScores: {},
      totalScores: {},
      sectionBids: [],
      playerBid: null,
      currentBidder: null,
      allBidsPlaced: false,
      isConnected: false,
      isPolling: false,
      isLoading: false,
      error: null
    });
  }
}));
