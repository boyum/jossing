import { v4 as uuidv4 } from "uuid";
import type { Player } from "@/types/game";
import { db } from "./db";
import { generateSessionId } from "./game-utils";

// Simple database functions to get started
export async function createGameSession(
  adminPlayerName: string,
  gameType: "UP" | "UP_AND_DOWN" = "UP_AND_DOWN",
  scoringSystem: "CLASSIC" | "MODERN" = "CLASSIC",
  maxPlayers: number = 6,
) {
  const sessionId = generateSessionId();
  const adminPlayerId = uuidv4();

  // Create session
  const session = await db.gameSession.create({
    data: {
      id: sessionId,
      adminPlayerId,
      gameType,
      scoringSystem,
      maxPlayers,
      currentSection: 0,
      gamePhase: "WAITING",
    },
  });

  // Create admin player
  const player = await db.player.create({
    data: {
      id: adminPlayerId,
      sessionId,
      name: adminPlayerName,
      isAdmin: true,
      position: 1,
      totalScore: 0,
      isConnected: true,
    },
  });

  return {
    sessionId: session.id,
    playerId: player.id,
  };
}

export async function joinGameSession(sessionId: string, playerName: string) {
  // Check if session exists and is waiting
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.gamePhase !== "WAITING") {
    return null;
  }

  // Count current players
  const playerCount = await db.player.count({
    where: { sessionId },
  });

  if (playerCount >= session.maxPlayers) {
    return null;
  }

  // Create new player
  const playerId = uuidv4();
  const player = await db.player.create({
    data: {
      id: playerId,
      sessionId,
      name: playerName,
      isAdmin: false,
      position: playerCount + 1,
      totalScore: 0,
      isConnected: true,
    },
  });

  return {
    playerId: player.id,
    position: player.position,
  };
}

export async function getGameState(playerId: string) {
  // Get player
  const player = await db.player.findUnique({
    where: { id: playerId },
  });

  if (!player) return null;

  // Get session
  const session = await db.gameSession.findUnique({
    where: { id: player.sessionId },
  });

  if (!session) return null;

  // Get all players in session
  const players = (await db.player.findMany({
    where: { sessionId: player.sessionId },
    orderBy: { position: "asc" },
  })) as Player[];

  return {
    session: {
      id: session.id,
      adminPlayerId: session.adminPlayerId,
      gameType: session.gameType,
      scoringSystem: session.scoringSystem,
      maxPlayers: session.maxPlayers,
      currentSection: session.currentSection,
      gamePhase: session.gamePhase.toLowerCase(),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
    players: players.map((p) => ({
      id: p.id,
      sessionId: p.sessionId,
      name: p.name,
      isAdmin: p.isAdmin,
      position: p.position,
      totalScore: p.totalScore,
      isConnected: p.isConnected,
      joinedAt: p.joinedAt,
      isAI: false,
      aiDifficulty: undefined,
    })),
    playerHand: [], // Will be populated when game starts
    isPlayerTurn: false, // Will be calculated based on game state
  };
}

export async function startGame(sessionId: string, adminPlayerId: string) {
  // Verify admin
  const admin = await db.player.findFirst({
    where: {
      id: adminPlayerId,
      sessionId,
      isAdmin: true,
    },
  });

  if (!admin) {
    throw new Error("Only admin can start the game");
  }

  // Check minimum players
  const playerCount = await db.player.count({
    where: { sessionId },
  });

  if (playerCount < 2) {
    throw new Error("Need at least 2 players to start");
  }

  // Update session to playing
  await db.gameSession.update({
    where: { id: sessionId },
    data: {
      gamePhase: "PLAYING",
      currentSection: 1,
    },
  });

  return { success: true };
}
