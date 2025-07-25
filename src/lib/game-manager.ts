import {
  GameType,
  ScoringSystem,
} from '@/types/game';
import * as dbService from './simple-db';

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
  static async createSession(
    adminPlayerName: string,
    gameType: GameType = "up",
    scoringSystem: ScoringSystem = "classic",
    maxPlayers: number = 6
  ): Promise<{ sessionId: string; playerId: string }> {
    return await dbService.createGameSession(
      adminPlayerName,
      gameType,
      scoringSystem,
      maxPlayers
    );
  }

  // Join an existing session
  static async joinSession(
    sessionId: string,
    playerName: string
  ): Promise<{ playerId: string; position: number } | null> {
    return await dbService.joinGameSession(sessionId, playerName);
  }

  // Get game state for a player
  static async getGameState(playerId: string) {
    return await dbService.getGameState(playerId);
  }

  // Start a game
  static async startGame(sessionId: string, adminPlayerId: string) {
    return await dbService.startGame(sessionId, adminPlayerId);
  }

  // Add AI player to session
  static async addAIPlayer(sessionId: string, difficulty: string = 'medium') {
    return await dbService.addAIPlayer(sessionId, difficulty);
  }

  // Remove AI player from session
  static async removeAIPlayer(sessionId: string, playerId: string, adminPlayerId: string) {
    return await dbService.removeAIPlayer(sessionId, playerId, adminPlayerId);
  }

  // Place a bid for a player
  static async placeBid(sessionId: string, playerId: string, bidAmount: number) {
    return await dbService.placeBid(sessionId, playerId, bidAmount);
  }

  // Start the playing phase (admin only)
  static async startPlayingPhase(sessionId: string, adminPlayerId: string) {
    return await dbService.startPlayingPhase(sessionId, adminPlayerId);
  }
}
