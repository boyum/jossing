import type * as PrismaSchema from ".prisma/client";
import type {
  AIDifficulty,
  Card,
  GameSession,
  GameType,
  Player,
  Rank,
  ScoringSystem,
  SectionPhase,
  SectionState,
  Suit,
  Trick,
  TrickCard
} from "@/types/game";
import { db } from "./db";

// Session Management
export async function createSession(
  sessionId: string,
  adminPlayerId: string,
  gameType: GameType,
  scoringSystem: ScoringSystem,
  maxPlayers: number = 6,
): Promise<GameSession> {
  const session = await db.gameSession.create({
    data: {
      id: sessionId,
      adminPlayerId,
      gameType,
      scoringSystem,
      maxPlayers,
      currentSection: 0,
      gamePhase: "waiting",
    },
  });

  return {
    id: session.id,
    adminPlayerId: session.adminPlayerId,
    gameType: session.gameType,
    scoringSystem: session.scoringSystem,
    maxPlayers: session.maxPlayers,
    currentSection: session.currentSection,
    gamePhase: session.gamePhase,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export async function getSession(
  sessionId: string,
): Promise<GameSession | null> {
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) return null;

  return {
    id: session.id,
    adminPlayerId: session.adminPlayerId,
    gameType: session.gameType,
    scoringSystem: session.scoringSystem,
    maxPlayers: session.maxPlayers,
    currentSection: session.currentSection,
    gamePhase: session.gamePhase,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
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
      gamePhase: "playing",
      currentSection: 1,
    },
  });

  return { success: true };
}

// Player Management
export async function createPlayer(
  playerId: string,
  sessionId: string,
  name: string,
  isAdmin: boolean,
  position: number,
  isAI: boolean = false,
  aiDifficulty?: AIDifficulty,
): Promise<Player> {
  const player = await db.player.create({
    data: {
      id: playerId,
      sessionId,
      name,
      isAdmin,
      position,
      totalScore: 0,
      isConnected: true,
    },
  });

  return {
    id: player.id,
    sessionId: player.sessionId,
    name: player.name,
    isAdmin: player.isAdmin,
    position: player.position,
    totalScore: player.totalScore,
    isConnected: player.isConnected,
    joinedAt: player.joinedAt,
    isAI,
    aiDifficulty,
  };
}

export async function getPlayer(playerId: string): Promise<Player | null> {
  const player = await db.player.findUnique({
    where: { id: playerId },
  });

  if (!player) return null;

  return {
    id: player.id,
    sessionId: player.sessionId,
    name: player.name,
    isAdmin: player.isAdmin,
    position: player.position,
    totalScore: player.totalScore,
    isConnected: player.isConnected,
    joinedAt: player.joinedAt,
    isAI: false,
    aiDifficulty: undefined,
  };
}

export async function getSessionPlayers(sessionId: string): Promise<Player[]> {
  const players = (await db.player.findMany({
    where: { sessionId },
    orderBy: { position: "asc" },
  })) as Player[];

  return players.map((player) => ({
    id: player.id,
    sessionId: player.sessionId,
    name: player.name,
    isAdmin: player.isAdmin,
    position: player.position,
    totalScore: player.totalScore,
    isConnected: player.isConnected,
    joinedAt: player.joinedAt,
    isAI: false,
    aiDifficulty: undefined,
  }));
}

export async function updatePlayerScore(
  playerId: string,
  totalScore: number,
): Promise<void> {
  await db.player.update({
    where: { id: playerId },
    data: { totalScore } satisfies Partial<PrismaSchema.Player>,
  });
}

export async function updatePlayerConnection(
  playerId: string,
  isConnected: boolean,
): Promise<void> {
  await db.player.update({
    where: { id: playerId },
    data: { isConnected } satisfies Partial<PrismaSchema.Player>,
  });
}

// Section Management
export async function createSection(
  sessionId: string,
  sectionNumber: number,
  dealerPosition: number,
  trumpSuit: Suit,
  trumpCardRank: Rank,
): Promise<SectionState> {
  const section = await db.sectionState.create({
    data: {
      sessionId,
      sectionNumber,
      dealerPosition,
      trumpSuit,
      trumpCardRank: mapCardRankToDb(trumpCardRank),
      phase: "dealing",
    } satisfies Omit<
      PrismaSchema.SectionState,
      "id" | "createdAt" | "updatedAt" | "leadPlayerPosition"
    >,
  });

  return {
    id: section.id,
    sessionId: section.sessionId,
    sectionNumber: section.sectionNumber,
    dealerPosition: section.dealerPosition,
    leadPlayerPosition: section.leadPlayerPosition ?? undefined,
    trumpSuit: section.trumpSuit,
    trumpCardRank: mapCardRankFromDb(section.trumpCardRank),
    phase: section.phase as SectionPhase,
    createdAt: section.createdAt,
    bids: [], // Will be populated separately
  };
}

export async function getCurrentSection(
  sessionId: string,
): Promise<SectionState | null> {
  const session = await db.gameSession.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.currentSection === 0) return null;

  const section = await db.sectionState.findUnique({
    where: {
      sessionId_sectionNumber: {
        sessionId,
        sectionNumber: session.currentSection,
      },
    },
  });

  if (!section) return null;

  return {
    id: section.id,
    sessionId: section.sessionId,
    sectionNumber: section.sectionNumber,
    dealerPosition: section.dealerPosition,
    leadPlayerPosition: section.leadPlayerPosition ?? undefined,
    trumpSuit: section.trumpSuit,
    trumpCardRank: mapCardRankFromDb(section.trumpCardRank),
    phase: section.phase as SectionPhase,
    createdAt: section.createdAt,
    bids: [], // Will be populated separately
  };
}

export async function updateSectionPhase(
  sectionId: string,
  phase: SectionPhase,
): Promise<void> {
  await db.sectionState.update({
    where: { id: sectionId },
    data: {
      phase,
    } satisfies Partial<PrismaSchema.SectionState>,
  });
}

export async function updateSectionLeadPlayer(
  sectionId: string,
  leadPlayerPosition: number,
): Promise<void> {
  await db.sectionState.update({
    where: { id: sectionId },
    data: {
      leadPlayerPosition,
    } satisfies Partial<PrismaSchema.SectionState>,
  });
}

// Player Hands Management
export async function createPlayerHand(
  sectionStateId: string,
  playerId: string,
  cards: Card[],
): Promise<void> {
  await db.playerHand.create({
    data: {
      sectionStateId,
      playerId,
      cards: JSON.stringify(cards),
      tricksWon: 0,
      sectionScore: 0,
    } satisfies Omit<PrismaSchema.PlayerHand, "id" | "bid">,
  });
}

export async function getPlayerHand(
  sectionStateId: string,
  playerId: string,
): Promise<Card[]> {
  const hand = await db.playerHand.findUnique({
    where: {
      sectionStateId_playerId: {
        sectionStateId,
        playerId,
      },
    },
  });

  if (!hand) return [];

  return JSON.parse(hand.cards) as Card[];
}

export async function updatePlayerHand(
  sectionStateId: string,
  playerId: string,
  cards: Card[],
): Promise<void> {
  await db.playerHand.update({
    where: {
      sectionStateId_playerId: {
        sectionStateId,
        playerId,
      },
    },
    data: {
      cards: JSON.stringify(cards),
    } satisfies Partial<PrismaSchema.PlayerHand>,
  });
}

export async function setPlayerBid(
  sectionStateId: string,
  playerId: string,
  bid: number,
): Promise<void> {
  await db.playerHand.update({
    where: {
      sectionStateId_playerId: {
        sectionStateId,
        playerId,
      },
    },
    data: {
      bid,
    } satisfies Partial<PrismaSchema.PlayerHand>,
  });
}

export async function getPlayerBid(
  sectionStateId: string,
  playerId: string,
): Promise<number | null> {
  const hand = await db.playerHand.findUnique({
    where: {
      sectionStateId_playerId: {
        sectionStateId,
        playerId,
      },
    },
  });

  return hand?.bid ?? null;
}

export async function updatePlayerTricks(
  sectionStateId: string,
  playerId: string,
  tricksWon: number,
): Promise<void> {
  await db.playerHand.update({
    where: {
      sectionStateId_playerId: {
        sectionStateId,
        playerId,
      },
    },
    data: { tricksWon } satisfies Partial<PrismaSchema.PlayerHand>,
  });
}

export async function updatePlayerSectionScore(
  sectionStateId: string,
  playerId: string,
  sectionScore: number,
): Promise<void> {
  await db.playerHand.update({
    where: {
      sectionStateId_playerId: {
        sectionStateId,
        playerId,
      },
    },
    data: { sectionScore } satisfies Partial<PrismaSchema.PlayerHand>,
  });
}

// Trick Management
export async function createTrick(
  sectionStateId: string,
  trickNumber: number,
  leadPlayerPosition: number,
): Promise<Trick> {
  const trick = await db.trick.create({
    data: {
      sectionStateId,
      trickNumber,
      leadPlayerPosition,
    } satisfies Omit<
      PrismaSchema.Trick,
      "id" | "completedAt" | "leadingSuit" | "winnerPosition"
    >,
  });

  return {
    id: trick.id,
    sectionStateId: trick.sectionStateId,
    trickNumber: trick.trickNumber,
    leadPlayerPosition: trick.leadPlayerPosition,
    leadingSuit: trick.leadingSuit ? trick.leadingSuit : undefined,
    winnerPosition: trick.winnerPosition ?? undefined,
    completedAt: trick.completedAt ?? undefined,
  };
}

export async function getCurrentTrick(
  sectionStateId: string,
): Promise<Trick | null> {
  const trick = await db.trick.findFirst({
    where: {
      sectionStateId,
      completedAt: null,
    },
    orderBy: { trickNumber: "desc" },
  });

  if (!trick) return null;

  return {
    id: trick.id,
    sectionStateId: trick.sectionStateId,
    trickNumber: trick.trickNumber,
    leadPlayerPosition: trick.leadPlayerPosition,
    leadingSuit: trick.leadingSuit ? trick.leadingSuit : undefined,
    winnerPosition: trick.winnerPosition ?? undefined,
    completedAt: trick.completedAt ?? undefined,
  };
}

export async function updateTrickLeadingSuit(
  trickId: string,
  leadingSuit: Suit,
): Promise<void> {
  await db.trick.update({
    where: { id: trickId },
    data: {
      leadingSuit: leadingSuit,
    } satisfies Partial<PrismaSchema.Trick>,
  });
}

export async function completeTrick(
  trickId: string,
  winnerPosition: number,
): Promise<void> {
  await db.trick.update({
    where: { id: trickId },
    data: {
      winnerPosition,
      completedAt: new Date(),
    } satisfies Partial<PrismaSchema.Trick>,
  });
}

// Trick Cards Management
export async function playCard(
  trickId: string,
  playerId: string,
  playerPosition: number,
  card: Card,
): Promise<void> {
  await db.trickCard.create({
    data: {
      trickId,
      playerId,
      playerPosition,
      cardSuit: card.suit,
      cardRank: mapCardRankToDb(card.rank),
    } satisfies Omit<
      PrismaSchema.TrickCard,
      "id" | "createdAt" | "updatedAt" | "leadPlayerPosition" | "playedAt"
    >,
  });
}

export async function getTrickCards(trickId: string): Promise<TrickCard[]> {
  const cards = await db.trickCard.findMany({
    where: { trickId },
    orderBy: { playedAt: "asc" },
  });

  return cards.map(
    (card) =>
      ({
        id: card.id,
        trickId: card.trickId,
        playerPosition: card.playerPosition,
        cardSuit: card.cardSuit,
        cardRank: mapCardRankFromDb(card.cardRank),
        playedAt: card.playedAt,
      } satisfies TrickCard),
  );
}

// Utility Methods
export async function getAllSessionBids(
  sessionId: string,
): Promise<Record<string, number | null>> {
  const currentSection = await getCurrentSection(sessionId);
  if (!currentSection) return {};

  const hands = await db.playerHand.findMany({
    where: { sectionStateId: currentSection.id },
    include: { player: true },
  });

  const bids: Record<string, number | null> = {};
  for (const hand of hands) {
    bids[hand.playerId] = hand.bid;
  }

  return bids;
}

export async function getSectionScores(
  sessionId: string,
): Promise<Record<string, number>> {
  const currentSection = await getCurrentSection(sessionId);
  if (!currentSection) return {};

  const hands = await db.playerHand.findMany({
    where: { sectionStateId: currentSection.id },
  });

  const scores: Record<string, number> = {};
  for (const hand of hands) {
    scores[hand.playerId] = hand.sectionScore;
  }

  return scores;
}

function mapCardRankFromDb(rank: PrismaSchema.$Enums.Rank): Rank {
  switch (rank) {
    case "ace":
      return "A";
    case "king":
      return "K";
    case "queen":
      return "Q";
    case "jack":
      return "J";
    case "ten":
      return "10";
    case "nine":
      return "9";
    case "eight":
      return "8";
    case "seven":
      return "7";
    case "six":
      return "6";
    case "five":
      return "5";
    case "four":
      return "4";
    case "three":
      return "3";
    case "two":
      return "2";
    default:
      throw new Error(`Unknown card rank: ${rank}`);
  }
}

function mapCardRankToDb(rank: Rank): PrismaSchema.$Enums.Rank {
  switch (rank) {
    case "A":
      return "ace";
    case "K":
      return "king";
    case "Q":
      return "queen";
    case "J":
      return "jack";
    case "10":
      return "ten";
    case "9":
      return "nine";
    case "8":
      return "eight";
    case "7":
      return "seven";
    case "6":
      return "six";
    case "5":
      return "five";
    case "4":
      return "four";
    case "3":
      return "three";
    case "2":
      return "two";
    default:
      throw new Error(`Unknown card rank: ${rank}`);
  }
}
