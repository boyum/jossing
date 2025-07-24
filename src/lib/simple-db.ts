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

  // Get current section state if game is playing
  let currentSection = null;
  let playerHand = [];
  
  if (session.gamePhase === "PLAYING" && session.currentSection > 0) {
    const sectionState = await db.sectionState.findFirst({
      where: {
        sessionId: player.sessionId,
        sectionNumber: session.currentSection,
      },
    });

    if (sectionState) {
      currentSection = {
        id: sectionState.id,
        sessionId: sectionState.sessionId,
        sectionNumber: sectionState.sectionNumber,
        dealerPosition: sectionState.dealerPosition,
        leadPlayerPosition: sectionState.leadPlayerPosition,
        trumpSuit: sectionState.trumpSuit.toLowerCase(),
        trumpCardRank: sectionState.trumpCardRank,
        phase: sectionState.phase.toLowerCase(),
        createdAt: sectionState.createdAt,
        bids: [], // Will be populated separately if needed
      };

      // Get player's hand for current section
      const playerHandRecord = await db.playerHand.findFirst({
        where: {
          sectionStateId: sectionState.id,
          playerId: player.id,
        },
      });

      if (playerHandRecord) {
        playerHand = JSON.parse(playerHandRecord.cards);
      }
    }
  }

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
      isAI: p.id.startsWith('ai-'),
      aiDifficulty: p.id.startsWith('ai-') ? p.id.split('-')[1] : undefined,
    })),
    currentSection,
    playerHand,
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

  // Initialize the first section
  await initializeSection(sessionId, 1);

  return { success: true };
}

async function initializeSection(sessionId: string, sectionNumber: number) {
  // Get players for this session
  const players = await db.player.findMany({
    where: { sessionId },
    orderBy: { position: "asc" },
  });

  // Determine dealer (rotate based on section number)
  const dealerPosition = ((sectionNumber - 1) % players.length) + 1;

  // Create a deck and shuffle
  const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  
  // Shuffle the deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Draw trump card
  const trumpCard = deck.pop();
  if (!trumpCard) {
    throw new Error("Not enough cards in deck");
  }
  
  // Create section state
  const sectionState = await db.sectionState.create({
    data: {
      sessionId,
      sectionNumber,
      dealerPosition,
      trumpSuit: trumpCard.suit as "HEARTS" | "DIAMONDS" | "CLUBS" | "SPADES",
      trumpCardRank: trumpCard.rank,
      phase: "DEALING",
    },
  });

  // Deal cards to each player
  const cardsPerPlayer = sectionNumber;
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const playerCards = deck.splice(0, cardsPerPlayer);
    
    await db.playerHand.create({
      data: {
        sectionStateId: sectionState.id,
        playerId: player.id,
        cards: JSON.stringify(playerCards),
        tricksWon: 0,
        sectionScore: 0,
      },
    });
  }

  // Update section to bidding phase
  await db.sectionState.update({
    where: { id: sectionState.id },
    data: { phase: "BIDDING" },
  });
}

export async function addAIPlayer(sessionId: string, difficulty: string = 'medium') {
  // Check if session exists and is in lobby
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.gamePhase !== "WAITING") {
    throw new Error("Session not found or not in lobby");
  }

  // Check if session is full
  const playerCount = await db.player.count({
    where: { sessionId },
  });

  if (playerCount >= session.maxPlayers) {
    throw new Error("Session is full");
  }

  // Generate AI player name and ID
  const aiNames = {
    easy: ['AI Bot', 'Simple Sam', 'Easy Eddie'],
    medium: ['Smart AI', 'Clever Clara', 'Medium Mike'],
    hard: ['Expert AI', 'Genius Gina', 'Hard Harry']
  };
  
  const names = aiNames[difficulty as keyof typeof aiNames] || aiNames.medium;
  const baseName = names[Math.floor(Math.random() * names.length)];
  const aiName = `${baseName} ${playerCount + 1}`;
  const aiPlayerId = `ai-${difficulty}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create AI player
  await db.player.create({
    data: {
      id: aiPlayerId,
      sessionId,
      name: aiName,
      isAdmin: false,
      position: playerCount + 1,
      totalScore: 0,
      isConnected: true,
    },
  });

  // Get updated players list
  const updatedPlayers = await db.player.findMany({
    where: { sessionId },
    orderBy: { position: "asc" },
  });

  return {
    success: true,
    playerId: aiPlayerId,
    name: aiName,
    difficulty,
    players: updatedPlayers.map((p) => ({
      id: p.id,
      sessionId: p.sessionId,
      name: p.name,
      isAdmin: p.isAdmin,
      position: p.position,
      totalScore: p.totalScore,
      isConnected: p.isConnected,
      joinedAt: p.joinedAt,
      isAI: p.id.startsWith('ai-'),
      aiDifficulty: p.id.startsWith('ai-') ? difficulty : undefined,
    }))
  };
}

export async function removeAIPlayer(sessionId: string, playerId: string, adminPlayerId: string) {
  // Verify admin
  const admin = await db.player.findFirst({
    where: {
      id: adminPlayerId,
      sessionId,
      isAdmin: true,
    },
  });

  if (!admin) {
    throw new Error("Only admin can remove AI players");
  }

  // Check if session is in lobby
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.gamePhase !== "WAITING") {
    throw new Error("Can only remove AI players in lobby");
  }

  // Check if player exists and is AI
  const player = await db.player.findFirst({
    where: {
      id: playerId,
      sessionId,
    },
  });

  if (!player) {
    throw new Error("Player not found");
  }

  if (!player.id.startsWith('ai-')) {
    throw new Error("Can only remove AI players");
  }

  // Remove the AI player
  await db.player.delete({
    where: { id: playerId },
  });

  // Get updated players list and reorder positions
  const remainingPlayers = await db.player.findMany({
    where: { sessionId },
    orderBy: { position: "asc" },
  });

  // Update positions to be sequential
  for (let i = 0; i < remainingPlayers.length; i++) {
    await db.player.update({
      where: { id: remainingPlayers[i].id },
      data: { position: i + 1 },
    });
  }

  // Get final updated players list
  const updatedPlayers = await db.player.findMany({
    where: { sessionId },
    orderBy: { position: "asc" },
  });

  return {
    success: true,
    removedPlayerId: playerId,
    players: updatedPlayers.map((p) => ({
      id: p.id,
      sessionId: p.sessionId,
      name: p.name,
      isAdmin: p.isAdmin,
      position: p.position,
      totalScore: p.totalScore,
      isConnected: p.isConnected,
      joinedAt: p.joinedAt,
      isAI: p.id.startsWith('ai-'),
      aiDifficulty: p.id.startsWith('ai-') ? p.id.split('-')[1] : undefined,
    }))
  };
}
