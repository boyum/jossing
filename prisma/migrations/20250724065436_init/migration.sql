-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminPlayerId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "scoringSystem" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 6,
    "currentSection" INTEGER NOT NULL DEFAULT 0,
    "gamePhase" TEXT NOT NULL DEFAULT 'WAITING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "players_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "game_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "section_states" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "sectionNumber" INTEGER NOT NULL,
    "dealerPosition" INTEGER NOT NULL,
    "leadPlayerPosition" INTEGER,
    "trumpSuit" TEXT NOT NULL,
    "trumpCardRank" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'DEALING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "section_states_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "game_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "player_hands" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionStateId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "cards" TEXT NOT NULL,
    "bid" INTEGER,
    "tricksWon" INTEGER NOT NULL DEFAULT 0,
    "sectionScore" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "player_hands_sectionStateId_fkey" FOREIGN KEY ("sectionStateId") REFERENCES "section_states" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_hands_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tricks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionStateId" TEXT NOT NULL,
    "trickNumber" INTEGER NOT NULL,
    "leadPlayerPosition" INTEGER NOT NULL,
    "leadingSuit" TEXT,
    "winnerPosition" INTEGER,
    "completedAt" DATETIME,
    CONSTRAINT "tricks_sectionStateId_fkey" FOREIGN KEY ("sectionStateId") REFERENCES "section_states" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trick_cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trickId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "playerPosition" INTEGER NOT NULL,
    "cardSuit" TEXT NOT NULL,
    "cardRank" TEXT NOT NULL,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trick_cards_trickId_fkey" FOREIGN KEY ("trickId") REFERENCES "tricks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "trick_cards_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "players_sessionId_name_key" ON "players"("sessionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "players_sessionId_position_key" ON "players"("sessionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "section_states_sessionId_sectionNumber_key" ON "section_states"("sessionId", "sectionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "player_hands_sectionStateId_playerId_key" ON "player_hands"("sectionStateId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "tricks_sectionStateId_trickNumber_key" ON "tricks"("sectionStateId", "trickNumber");

-- CreateIndex
CREATE UNIQUE INDEX "trick_cards_trickId_playerPosition_key" ON "trick_cards"("trickId", "playerPosition");
