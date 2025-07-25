'use client';

import type { Card } from '@/types/game';

interface GameActionResponse {
  success: boolean;
  gameState?: Record<string, unknown>;
  error?: string;
}

class GameApiService {
  private baseUrl = '/api';

  // Create a new game session
  async createSession(
    adminName: string,
    gameType: string = 'up',
    scoringSystem: string = 'classic',
    maxPlayers: number = 6
  ) {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminName,
        gameType,
        scoringSystem,
        maxPlayers
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    return response.json();
  }

  // Join an existing session
  async joinSession(sessionId: string, playerName: string) {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName })
    });

    if (!response.ok) {
      throw new Error(`Failed to join session: ${response.statusText}`);
    }

    return response.json();
  }

  // Start a game
  async startGame(sessionId: string, adminPlayerId: string) {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPlayerId })
    });

    if (!response.ok) {
      throw new Error(`Failed to start game: ${response.statusText}`);
    }

    return response.json();
  }

  // Get current game state
  async getGameState(sessionId: string, playerId: string) {
    const response = await fetch(
      `${this.baseUrl}/game/${sessionId}?playerId=${playerId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get game state: ${response.statusText}`);
    }

    return response.json();
  }

  // Place a bid
  async placeBid(sessionId: string, playerId: string, bid: number): Promise<GameActionResponse> {
    return this.performGameAction(sessionId, 'bid', playerId, { bid });
  }

  // Play a card
  async playCard(sessionId: string, playerId: string, card: Card): Promise<GameActionResponse> {
    return this.performGameAction(sessionId, 'playCard', playerId, { card });
  }

  // Start playing phase (admin only)
  async startPlayingPhase(sessionId: string, playerId: string): Promise<GameActionResponse> {
    return this.performGameAction(sessionId, 'startPlayingPhase', playerId, {});
  }

  // Generic game action handler
  private async performGameAction(
    sessionId: string,
    action: string,
    playerId: string,
    data: Record<string, unknown>
  ): Promise<GameActionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/game/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          playerId,
          data
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Action failed'
        };
      }

      return {
        success: true,
        gameState: result.gameState
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Add AI players to a session
  async addAIPlayers(sessionId: string, difficulty?: string) {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/add-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty })
    });

    if (!response.ok) {
      throw new Error(`Failed to add AI players: ${response.statusText}`);
    }

    return response.json();
  }

  // Remove AI player from a session
  async removeAIPlayer(sessionId: string, playerId: string, adminPlayerId: string) {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/remove-ai`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, adminPlayerId })
    });

    if (!response.ok) {
      throw new Error(`Failed to remove AI player: ${response.statusText}`);
    }

    return response.json();
  }
}

export const gameApiService = new GameApiService();
