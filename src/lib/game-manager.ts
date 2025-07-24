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
    gameType: GameType = GameType.UP_AND_DOWN,
    scoringSystem: ScoringSystem = ScoringSystem.CLASSIC,
    maxPlayers: number = 6
  ): Promise<{ sessionId: string; playerId: string }> {
    return await dbService.createGameSession(
      adminPlayerName,
      gameType === GameType.UP ? 'UP' : 'UP_AND_DOWN',
      scoringSystem === ScoringSystem.CLASSIC ? 'CLASSIC' : 'MODERN',
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
}
