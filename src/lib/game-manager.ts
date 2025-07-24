import {
  type Card,
  GamePhase,
  type GameSession,
  type GameType,
  type Player,
  type ScoringSystem,
  SectionPhase,
  type SectionState
} from '@/types/game';
import { createDeck, dealCards } from './game-utils';
import { RandomAI, getAIPlayerName } from './ai-player';

// In-memory storage (in production, this would be a database)
const sessions = new Map<string, GameSession>();
const players = new Map<string, Player>();
const sectionStates = new Map<string, SectionState>();
const playerHands = new Map<string, Card[]>();

// biome-ignore lint/complexity/noStaticOnlyClass: This can be a class for now
export class GameManager {
  // Generate a unique session ID
  static generateSessionId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Generate a unique player ID
  static generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Create a new game session
  static createSession(
    adminName: string,
    gameType: GameType,
    scoringSystem: ScoringSystem,
    maxPlayers: number
  ): { sessionId: string; playerId: string } {
    const sessionId = GameManager.generateSessionId();
    const playerId = GameManager.generatePlayerId();

    // Create session
    const session: GameSession = {
      id: sessionId,
      adminPlayerId: playerId,
      gameType,
      scoringSystem,
      maxPlayers,
      currentSection: 1,
      gamePhase: GamePhase.WAITING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create admin player
    const adminPlayer: Player = {
      id: playerId,
      sessionId,
      name: adminName,
      isAdmin: true,
      position: 1,
      totalScore: 0,
      isConnected: true,
      joinedAt: new Date()
    };

    sessions.set(sessionId, session);
    players.set(playerId, adminPlayer);

    return { sessionId, playerId };
  }

  // Join an existing session
  static joinSession(
    sessionId: string,
    playerName: string
  ): { playerId: string; position: number } | null {
    const session = sessions.get(sessionId);
    if (!session || session.gamePhase !== GamePhase.WAITING) {
      return null;
    }

    // Count current players
    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    if (sessionPlayers.length >= session.maxPlayers) {
      return null;
    }

    const playerId = GameManager.generatePlayerId();
    const position = sessionPlayers.length + 1;

    const player: Player = {
      id: playerId,
      sessionId,
      name: playerName,
      isAdmin: false,
      position,
      totalScore: 0,
      isConnected: true,
      joinedAt: new Date()
    };

    players.set(playerId, player);

    return { playerId, position };
  }

  // Get all players in a session
  static getSessionPlayers(sessionId: string): Player[] {
    const sessionPlayers: Player[] = [];
    for (const player of players.values()) {
      if (player.sessionId === sessionId) {
        sessionPlayers.push(player);
      }
    }
    return sessionPlayers.sort((a, b) => a.position - b.position);
  }

  // Start the game
  static startGame(sessionId: string, adminPlayerId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session || session.adminPlayerId !== adminPlayerId || session.gamePhase !== GamePhase.WAITING) {
      return false;
    }

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    if (sessionPlayers.length < 3) {
      return false;
    }

    // Update session to start first section
    session.gamePhase = GamePhase.PLAYING;
    session.updatedAt = new Date();
    sessions.set(sessionId, session);

    // Start first section
    GameManager.startSection(sessionId, 1);

    return true;
  }

  // Start a new section (round)
  static startSection(sessionId: string, sectionNumber: number): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    const numPlayers = sessionPlayers.length;

    // Deal cards
    const deck = createDeck();
    const { hands, trumpCard } = dealCards(deck, numPlayers, sectionNumber);

    // Create section state
    const sectionStateId = `${sessionId}-${sectionNumber}`;
    const dealerPosition = ((sectionNumber - 1) % numPlayers) + 1;

    const sectionState: SectionState = {
      id: sectionStateId,
      sessionId,
      sectionNumber,
      dealerPosition,
      trumpSuit: trumpCard.suit,
      trumpCardRank: trumpCard.rank,
      phase: SectionPhase.BIDDING,
      createdAt: new Date()
    };

    sectionStates.set(sectionStateId, sectionState);

    // Store player hands
    sessionPlayers.forEach((player, index) => {
      playerHands.set(`${player.id}-${sectionNumber}`, hands[index]);
    });

    return true;
  }

  // Get session by ID
  static getSession(sessionId: string): GameSession | null {
    return sessions.get(sessionId) || null;
  }

  // Get player by ID
  static getPlayer(playerId: string): Player | null {
    return players.get(playerId) || null;
  }

  // Get current section state
  static getCurrentSection(sessionId: string): SectionState | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const sectionStateId = `${sessionId}-${session.currentSection}`;
    return sectionStates.get(sectionStateId) || null;
  }

  // Get player's hand for current section
  static getPlayerHand(playerId: string, sectionNumber: number): Card[] {
    return playerHands.get(`${playerId}-${sectionNumber}`) || [];
  }

  // Place a bid
  static placeBid(playerId: string, bid: number): boolean {
    const player = players.get(playerId);
    if (!player) return false;

    const session = sessions.get(player.sessionId);
    if (!session) return false;

    const sectionState = GameManager.getCurrentSection(player.sessionId);
    if (!sectionState || sectionState.phase !== SectionPhase.BIDDING) return false;

    // In a real implementation, we'd store bids and check if all players have bid
    // For now, just log the bid and return true
    console.log(`Player ${player.name} bids ${bid}`);
    return true;
  }

  // Play a card
  static playCard(playerId: string, card: Card): boolean {
    const player = players.get(playerId);
    if (!player) return false;

    const session = sessions.get(player.sessionId);
    if (!session) return false;

    const sectionState = GameManager.getCurrentSection(player.sessionId);
    if (!sectionState || sectionState.phase !== SectionPhase.PLAYING) return false;

    // Remove card from player's hand
    const handKey = `${playerId}-${session.currentSection}`;
    const hand = playerHands.get(handKey) || [];
    const newHand = hand.filter(c => !(c.suit === card.suit && c.rank === card.rank));
    playerHands.set(handKey, newHand);

    return true;
  }

  // Add AI players to fill empty slots
  static addAIPlayers(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session || session.gamePhase !== GamePhase.WAITING) {
      return false;
    }

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    const spotsToFill = session.maxPlayers - sessionPlayers.length;

    for (let i = 0; i < spotsToFill; i++) {
      const playerId = GameManager.generatePlayerId();
      const position = sessionPlayers.length + i + 1;
      const aiName = getAIPlayerName(i);

      const aiPlayer: Player = {
        id: playerId,
        sessionId,
        name: aiName,
        isAdmin: false,
        position,
        totalScore: 0,
        isConnected: true,
        joinedAt: new Date(),
        isAI: true // Add this flag to identify AI players
      };

      players.set(playerId, aiPlayer);
    }

    return true;
  }

  // Make AI players take their turns
  static processAITurn(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const sectionState = GameManager.getCurrentSection(sessionId);
    if (!sectionState) return false;

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    const aiPlayers = sessionPlayers.filter(p => p.isAI);

    // Process AI bids during bidding phase
    if (sectionState.phase === SectionPhase.BIDDING) {
      for (const aiPlayer of aiPlayers) {
        const hand = GameManager.getPlayerHand(aiPlayer.id, session.currentSection);
        const ai = new RandomAI(aiPlayer.name);
        const bid = ai.makeBid(hand, session.currentSection, sectionState.trumpSuit);
        
        // Store the bid (in a real implementation, you'd track all bids)
        console.log(`${aiPlayer.name} bids ${bid}`);
      }
      return true;
    }

    // Process AI card plays during playing phase
    if (sectionState.phase === SectionPhase.PLAYING) {
      for (const aiPlayer of aiPlayers) {
        const hand = GameManager.getPlayerHand(aiPlayer.id, session.currentSection);
        if (hand.length > 0) {
          const ai = new RandomAI(aiPlayer.name);
          const card = ai.playCard(hand, [], sectionState.trumpSuit);
          
          // Play the card
          GameManager.playCard(aiPlayer.id, card);
          console.log(`${aiPlayer.name} plays ${card.rank} of ${card.suit}`);
        }
      }
      return true;
    }

    return false;
  }

  // Remove player from session
  static removePlayer(playerId: string): boolean {
    const player = players.get(playerId);
    if (!player) return false;

    players.delete(playerId);

    // If this was the admin and there are other players, make someone else admin
    if (player.isAdmin) {
      const sessionPlayers = GameManager.getSessionPlayers(player.sessionId);
      if (sessionPlayers.length > 0) {
        const newAdmin = sessionPlayers[0];
        newAdmin.isAdmin = true;
        players.set(newAdmin.id, newAdmin);

        // Update session admin
        const session = sessions.get(player.sessionId);
        if (session) {
          session.adminPlayerId = newAdmin.id;
          sessions.set(player.sessionId, session);
        }
      }
    }

    return true;
  }

  // Get game state for a player
  static getGameState(playerId: string) {
    const player = players.get(playerId);
    if (!player) return null;

    const session = sessions.get(player.sessionId);
    if (!session) return null;

    const sessionPlayers = GameManager.getSessionPlayers(player.sessionId);
    const currentSection = GameManager.getCurrentSection(player.sessionId);
    const playerHand = currentSection ? GameManager.getPlayerHand(playerId, session.currentSection) : [];

    return {
      session,
      players: sessionPlayers,
      currentSection,
      playerHand,
      isPlayerTurn: false, // TODO: Implement turn logic
      currentTrick: null, // TODO: Implement trick tracking
      sectionScores: {}, // TODO: Implement scoring
      totalScores: sessionPlayers.reduce((acc, p) => {
        acc[p.id] = p.totalScore;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
