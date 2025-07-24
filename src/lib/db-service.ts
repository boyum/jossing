import {
  type AIDifficulty,
  type Card,
  type GamePhase,
  type GameSession,
  GameType,
  type Player,
  Rank,
  ScoringSystem,
  SectionPhase,
  type SectionState,
  Suit,
  type Trick,
  type TrickCard,
} from "@/types/game";
import * as PrismaSchema from "../../node_modules/.prisma/client/index";
import { db } from "./db";

// Session Management
export async function createSession(
  sessionId: string,
  adminPlayerId: string,
  gameType: GameType,
  scoringSystem: ScoringSystem,
  maxPlayers: number = 6,
): Promise<GameSession> {
  const session = (await db.gameSession.create({
    data: {
      id: sessionId,
      adminPlayerId,
      gameType: mapGameTypeToDb(gameType),
      scoringSystem: mapScoringSystemToDb(scoringSystem),
      maxPlayers,
      currentSection: 0,
      gamePhase: PrismaSchema.$Enums.GamePhase.WAITING,
    } satisfies Omit<PrismaSchema.GameSession, "createdAt" | "updatedAt">,
  })) as PrismaSchema.GameSession;

  return {
    id: session.id,
    adminPlayerId: session.adminPlayerId,
    gameType: session.gameType as GameType,
    scoringSystem: session.scoringSystem as ScoringSystem,
    maxPlayers: session.maxPlayers,
    currentSection: session.currentSection,
    gamePhase: session.gamePhase as GamePhase,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

const mapGameTypeToDb = (gameType: GameType): PrismaSchema.$Enums.GameType => {
  switch (gameType) {
    case GameType.UP:
      return PrismaSchema.$Enums.GameType.UP;
    case GameType.UP_AND_DOWN:
      return PrismaSchema.$Enums.GameType.UP_AND_DOWN;
    default:
      throw new Error(`Unknown game type: ${gameType}`);
  }
};

const mapScoringSystemToDb = (
  scoringSystem: ScoringSystem,
): PrismaSchema.$Enums.ScoringSystem => {
  switch (scoringSystem) {
    case ScoringSystem.CLASSIC:
      return PrismaSchema.$Enums.ScoringSystem.CLASSIC;
    case ScoringSystem.MODERN:
      return PrismaSchema.$Enums.ScoringSystem.MODERN;
    default:
      throw new Error(`Unknown scoring system: ${scoringSystem}`);
  }
};

export async function getSession(
  sessionId: string,
): Promise<GameSession | null> {
  const session = (await db.gameSession.findUnique({
    where: { id: sessionId },
  })) as PrismaSchema.GameSession;

  if (!session) return null;

  return {
    id: session.id,
    adminPlayerId: session.adminPlayerId,
    gameType: session.gameType as GameType,
    scoringSystem: session.scoringSystem as ScoringSystem,
    maxPlayers: session.maxPlayers,
    currentSection: session.currentSection,
    gamePhase: session.gamePhase as GamePhase,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
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
  const player = (await db.player.create({
    data: {
      id: playerId,
      sessionId,
      name,
      isAdmin,
      position,
      totalScore: 0,
      isConnected: true,
    },
  })) as PrismaSchema.Player;

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
  const player = (await db.player.findUnique({
    where: { id: playerId },
  })) as PrismaSchema.Player;

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
  trumpCardRank: string,
): Promise<SectionState> {
  const section = (await db.sectionState.create({
    data: {
      sessionId,
      sectionNumber,
      dealerPosition,
      trumpSuit: mapSuitToDb(trumpSuit),
      trumpCardRank,
      phase: mapPhaseToDb(SectionPhase.DEALING),
    } satisfies Omit<
      PrismaSchema.SectionState,
      "id" | "createdAt" | "updatedAt" | "leadPlayerPosition"
    >,
  })) as PrismaSchema.SectionState;

  return {
    id: section.id,
    sessionId: section.sessionId,
    sectionNumber: section.sectionNumber,
    dealerPosition: section.dealerPosition,
    leadPlayerPosition: section.leadPlayerPosition ?? undefined,
    trumpSuit: section.trumpSuit as Suit,
    trumpCardRank: mapRankFromDb(section.trumpCardRank),
    phase: section.phase as SectionPhase,
    createdAt: section.createdAt,
    bids: [], // Will be populated separately
  };
}

const mapRankFromDb = (rank: string): Rank => {
  switch (rank) {
    case "ACE":
      return Rank.ACE;
    case "KING":
      return Rank.KING;
    case "QUEEN":
      return Rank.QUEEN;
    case "JACK":
      return Rank.JACK;
    case "TEN":
      return Rank.TEN;
    case "NINE":
      return Rank.NINE;
    case "EIGHT":
      return Rank.EIGHT;
    case "SEVEN":
      return Rank.SEVEN;
    case "SIX":
      return Rank.SIX;
    case "FIVE":
      return Rank.FIVE;
    case "FOUR":
      return Rank.FOUR;
    case "THREE":
      return Rank.THREE;
    case "TWO":
      return Rank.TWO;
    default:
      throw new Error(`Unknown rank: ${rank}`);
  }
};

const mapSuitToDb = (suit: Suit): PrismaSchema.$Enums.Suit => {
  switch (suit) {
    case Suit.HEARTS:
      return PrismaSchema.$Enums.Suit.HEARTS;
    case Suit.DIAMONDS:
      return PrismaSchema.$Enums.Suit.DIAMONDS;
    case Suit.CLUBS:
      return PrismaSchema.$Enums.Suit.CLUBS;
    case Suit.SPADES:
      return PrismaSchema.$Enums.Suit.SPADES;
    default:
      throw new Error(`Unknown suit: ${suit}`);
  }
};

const mapPhaseToDb = (
  phase: SectionPhase,
): PrismaSchema.$Enums.SectionPhase => {
  switch (phase) {
    case SectionPhase.DEALING:
      return PrismaSchema.$Enums.SectionPhase.DEALING;
    case SectionPhase.BIDDING:
      return PrismaSchema.$Enums.SectionPhase.BIDDING;
    case SectionPhase.PLAYING:
      return PrismaSchema.$Enums.SectionPhase.PLAYING;
    case SectionPhase.COMPLETED:
      return PrismaSchema.$Enums.SectionPhase.COMPLETED;
    default:
      throw new Error(`Unknown section phase: ${phase}`);
  }
};

export async function getCurrentSection(
  sessionId: string,
): Promise<SectionState | null> {
  const session = (await db.gameSession.findUnique({
    where: { id: sessionId },
  })) as PrismaSchema.GameSession;

  if (!session || session.currentSection === 0) return null;

  const section = (await db.sectionState.findUnique({
    where: {
      sessionId_sectionNumber: {
        sessionId,
        sectionNumber: session.currentSection,
      },
    },
  })) as PrismaSchema.SectionState;

  if (!section) return null;

  return {
    id: section.id,
    sessionId: section.sessionId,
    sectionNumber: section.sectionNumber,
    dealerPosition: section.dealerPosition,
    leadPlayerPosition: section.leadPlayerPosition ?? undefined,
    trumpSuit: section.trumpSuit as Suit,
    trumpCardRank: mapRankFromDb(section.trumpCardRank),
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
      phase: mapPhaseToDb(phase),
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
  (await db.playerHand.create({
    data: {
      sectionStateId,
      playerId,
      cards: JSON.stringify(cards),
      tricksWon: 0,
      sectionScore: 0,
    } satisfies Omit<PrismaSchema.PlayerHand, "id" | "bid">,
  })) as PrismaSchema.PlayerHand;
}

export async function getPlayerHand(
  sectionStateId: string,
  playerId: string,
): Promise<Card[]> {
  const hand = (await db.playerHand.findUnique({
    where: {
      sectionStateId_playerId: {
        sectionStateId,
        playerId,
      },
    },
  })) as PrismaSchema.PlayerHand;

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
  const hand = (await db.playerHand.findUnique({
    where: {
      sectionStateId_playerId: {
        sectionStateId,
        playerId,
      },
    },
  })) as PrismaSchema.PlayerHand;

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
  const trick = (await db.trick.create({
    data: {
      sectionStateId,
      trickNumber,
      leadPlayerPosition,
    } satisfies Omit<
      PrismaSchema.Trick,
      "id" | "completedAt" | "leadingSuit" | "winnerPosition"
    >,
  })) as PrismaSchema.Trick;

  return {
    id: trick.id,
    sectionStateId: trick.sectionStateId,
    trickNumber: trick.trickNumber,
    leadPlayerPosition: trick.leadPlayerPosition,
    leadingSuit: trick.leadingSuit as Suit | undefined,
    winnerPosition: trick.winnerPosition ?? undefined,
    completedAt: trick.completedAt ?? undefined,
  };
}

export async function getCurrentTrick(
  sectionStateId: string,
): Promise<Trick | null> {
  const trick = (await db.trick.findFirst({
    where: {
      sectionStateId,
      completedAt: null,
    },
    orderBy: { trickNumber: "desc" },
  })) as PrismaSchema.Trick;

  if (!trick) return null;

  return {
    id: trick.id,
    sectionStateId: trick.sectionStateId,
    trickNumber: trick.trickNumber,
    leadPlayerPosition: trick.leadPlayerPosition,
    leadingSuit: trick.leadingSuit as Suit | undefined,
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
      leadingSuit: mapSuitToDb(leadingSuit),
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
  (await db.trickCard.create({
    data: {
      trickId,
      playerId,
      playerPosition,
      cardSuit: mapSuitToDb(card.suit),
      cardRank: card.rank,
    } satisfies Omit<
      PrismaSchema.TrickCard,
      "id" | "createdAt" | "updatedAt" | "leadPlayerPosition" | "playedAt"
    >,
  })) as PrismaSchema.TrickCard;
}

export async function getTrickCards(trickId: string): Promise<TrickCard[]> {
  const cards = (await db.trickCard.findMany({
    where: { trickId },
    orderBy: { playedAt: "asc" },
  })) as PrismaSchema.TrickCard[];

  return cards.map((card) => ({
    id: card.id,
    trickId: card.trickId,
    playerPosition: card.playerPosition,
    cardSuit: mapSuitFromDb(card.cardSuit),
    cardRank: mapRankFromDb(card.cardRank),
    playedAt: card.playedAt,
  }));
}

const mapSuitFromDb = (suit: PrismaSchema.$Enums.Suit): Suit => {
  switch (suit) {
    case PrismaSchema.$Enums.Suit.HEARTS:
      return Suit.HEARTS;
    case PrismaSchema.$Enums.Suit.DIAMONDS:
      return Suit.DIAMONDS;
    case PrismaSchema.$Enums.Suit.CLUBS:
      return Suit.CLUBS;
    case PrismaSchema.$Enums.Suit.SPADES:
      return Suit.SPADES;
    default:
      throw new Error(`Unknown suit: ${suit}`);
  }
};

// Utility Methods
export async function getAllSessionBids(
  sessionId: string,
): Promise<Record<string, number | null>> {
  const currentSection = await getCurrentSection(sessionId);
  if (!currentSection) return {};

  const hands = (await db.playerHand.findMany({
    where: { sectionStateId: currentSection.id },
    include: { player: true },
  })) as PrismaSchema.PlayerHand[];

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

  const hands = (await db.playerHand.findMany({
    where: { sectionStateId: currentSection.id },
  })) as PrismaSchema.PlayerHand[];

  const scores: Record<string, number> = {};
  for (const hand of hands) {
    scores[hand.playerId] = hand.sectionScore;
  }

  return scores;
}
