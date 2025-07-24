# Jøssing Card Game - Technical Specification

## 1. Database Schema

### Tables Overview

The application will use the following main entities:

#### game_sessions

```sql
CREATE TABLE game_sessions (
  id VARCHAR(8) PRIMARY KEY,           -- Short alphanumeric session code
  admin_player_id VARCHAR(36) NOT NULL,
  game_type ENUM('up', 'up-and-down') NOT NULL,
  scoring_system ENUM('classic', 'modern') NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 6,
  current_section INTEGER NOT NULL DEFAULT 0,
  game_phase ENUM('waiting', 'bidding', 'playing', 'scoring', 'finished') NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### players

```sql
CREATE TABLE players (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(8) NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  position INTEGER NOT NULL,
  total_score INTEGER NOT NULL DEFAULT 0,
  is_connected BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_name_per_session (session_id, name),
  UNIQUE KEY unique_position_per_session (session_id, position)
);
```

#### section_states

```sql
CREATE TABLE section_states (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(8) NOT NULL,
  section_number INTEGER NOT NULL,
  dealer_position INTEGER NOT NULL,
  lead_player_position INTEGER,
  trump_suit ENUM('hearts', 'diamonds', 'clubs', 'spades') NOT NULL,
  trump_card_rank VARCHAR(2) NOT NULL,
  phase ENUM('dealing', 'bidding', 'playing', 'completed') NOT NULL DEFAULT 'dealing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_section_per_session (session_id, section_number)
);
```

#### player_hands

```sql
CREATE TABLE player_hands (
  id VARCHAR(36) PRIMARY KEY,
  section_state_id VARCHAR(36) NOT NULL,
  player_id VARCHAR(36) NOT NULL,
  cards JSON NOT NULL,                 -- Array of card objects
  bid INTEGER,
  tricks_won INTEGER NOT NULL DEFAULT 0,
  section_score INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (section_state_id) REFERENCES section_states(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE KEY unique_hand_per_section_player (section_state_id, player_id)
);
```

#### tricks

```sql
CREATE TABLE tricks (
  id VARCHAR(36) PRIMARY KEY,
  section_state_id VARCHAR(36) NOT NULL,
  trick_number INTEGER NOT NULL,
  lead_player_position INTEGER NOT NULL,
  leading_suit ENUM('hearts', 'diamonds', 'clubs', 'spades'),
  winner_position INTEGER,
  completed_at TIMESTAMP,
  FOREIGN KEY (section_state_id) REFERENCES section_states(id) ON DELETE CASCADE,
  UNIQUE KEY unique_trick_per_section (section_state_id, trick_number)
);
```

#### trick_cards

```sql
CREATE TABLE trick_cards (
  id VARCHAR(36) PRIMARY KEY,
  trick_id VARCHAR(36) NOT NULL,
  player_position INTEGER NOT NULL,
  card_suit ENUM('hearts', 'diamonds', 'clubs', 'spades') NOT NULL,
  card_rank VARCHAR(2) NOT NULL,
  played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trick_id) REFERENCES tricks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_card_per_trick_player (trick_id, player_position)
);
```

## 2. API Specification

### REST Endpoints

#### Session Management

```typescript
// POST /api/sessions
interface CreateSessionRequest {
  adminName: string;
  gameType: "up" | "up-and-down";
  scoringSystem: "classic" | "modern";
  maxPlayers: number;
}

interface CreateSessionResponse {
  sessionId: string;
  playerId: string;
}

// POST /api/sessions/:sessionId/join
interface JoinSessionRequest {
  playerName: string;
}

interface JoinSessionResponse {
  playerId: string;
  position: number;
  gameState: GameState;
}

// GET /api/sessions/:sessionId/state
interface GameStateResponse {
  session: GameSession;
  players: Player[];
  currentSection?: SectionState;
  playerHand?: Card[];
  isPlayerTurn: boolean;
}
```

#### Game Actions

```typescript
// POST /api/sessions/:sessionId/start
interface StartGameRequest {
  playerId: string;
}

// POST /api/sessions/:sessionId/bid
interface PlaceBidRequest {
  playerId: string;
  bid: number;
}

// POST /api/sessions/:sessionId/play-card
interface PlayCardRequest {
  playerId: string;
  card: Card;
}
```

### WebSocket Events

#### Client → Server Events

```typescript
interface SocketEvents {
  "join-room": { sessionId: string; playerId: string };
  "leave-room": { sessionId: string; playerId: string };
  "player-ready": { sessionId: string; playerId: string };
  heartbeat: { playerId: string };
}
```

#### Server → Client Events

```typescript
interface SocketEmissions {
  "player-joined": { player: Player };
  "player-left": { playerId: string };
  "game-started": { gameState: GameState };
  "cards-dealt": { hand: Card[] };
  "bidding-started": { timeLimit: number };
  "all-bids-placed": { bids: Record<string, number> };
  "card-played": { playerId: string; card: Card };
  "trick-completed": { winner: string; nextLeader: string };
  "section-completed": { scores: Record<string, number> };
  "game-ended": { finalScores: Record<string, number>; winner: string };
  "player-disconnected": { playerId: string };
  "player-reconnected": { playerId: string };
  error: { message: string; code: string };
}
```

## 3. Core Game Logic Implementation

### Card System

```typescript
enum Suit {
  HEARTS = "hearts",
  DIAMONDS = "diamonds",
  CLUBS = "clubs",
  SPADES = "spades",
}

enum Rank {
  TWO = "2",
  THREE = "3",
  FOUR = "4",
  FIVE = "5",
  SIX = "6",
  SEVEN = "7",
  EIGHT = "8",
  NINE = "9",
  TEN = "10",
  JACK = "J",
  QUEEN = "Q",
  KING = "K",
  ACE = "A",
}

class Card {
  constructor(
    public suit: Suit,
    public rank: Rank,
    public value: number = RANK_VALUES[rank],
  ) {}

  toString(): string {
    return `${this.rank}${this.suit}`;
  }

  static fromString(cardString: string): Card {
    // Parse card string like "AH" or "10S"
  }
}

const RANK_VALUES = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};
```

### Game Engine

```typescript
class JossingGameEngine {
  private session: GameSession;
  private players: Player[];
  private deck: Card[];

  constructor(sessionId: string) {
    // Initialize game state
  }

  // Core game methods
  async startGame(): Promise<void> {
    this.shuffleDeck();
    this.setTrumpCard();
    await this.startSection(1);
  }

  async startSection(sectionNumber: number): Promise<void> {
    // Shuffle entire deck for new section
    this.shuffleDeck();

    // Set new trump card for this section
    this.setTrumpCard();

    const cardsPerPlayer = this.getCardsPerPlayer(sectionNumber);
    const hands = this.dealCards(cardsPerPlayer);

    // Store hands in database
    await this.savePlayerHands(sectionNumber, hands);

    // Start bidding phase
    this.session.gamePhase = "bidding";
    this.emitToAll("cards-dealt", {
      sectionNumber,
      cardsPerPlayer,
      trumpSuit: this.session.trumpSuit,
    });
  }

  async placeBid(playerId: string, bid: number): Promise<void> {
    // Validate bid
    if (!this.isValidBid(playerId, bid)) {
      throw new Error("Invalid bid");
    }

    // Store bid
    await this.storeBid(playerId, bid);

    // Check if all bids are placed
    if (await this.allBidsPlaced()) {
      await this.startTrickTaking();
    }
  }

  async playCard(playerId: string, card: Card): Promise<void> {
    // Validate card play
    if (!this.canPlayCard(playerId, card)) {
      throw new Error("Cannot play this card");
    }

    // Store card play
    await this.storeCardPlay(playerId, card);

    // Check if trick is complete
    if (await this.isTrickComplete()) {
      await this.completeTrick();
    }
  }

  private canPlayCard(playerId: string, card: Card): boolean {
    const currentTrick = this.getCurrentTrick();
    const playerHand = this.getPlayerHand(playerId);

    // Check if player has the card
    if (!playerHand.includes(card)) {
      return false;
    }

    // Check if it's player's turn
    if (!this.isPlayerTurn(playerId)) {
      return false;
    }

    // Check suit following rules
    if (currentTrick.leadingSuit) {
      const hasLeadingSuit = playerHand.some(
        (c) => c.suit === currentTrick.leadingSuit,
      );
      if (hasLeadingSuit && card.suit !== currentTrick.leadingSuit) {
        return false;
      }
    }

    return true;
  }

  private getTrickWinner(trick: Trick): string {
    const trumpSuit = this.session.trumpSuit;
    const leadingSuit = trick.leadingSuit;

    let winner = trick.leadPlayerId;
    let winningCard = trick.cardsPlayed[winner];

    for (const [playerId, card] of Object.entries(trick.cardsPlayed)) {
      if (this.cardBeats(card, winningCard, trumpSuit, leadingSuit)) {
        winner = playerId;
        winningCard = card;
      }
    }

    return winner;
  }

  private cardBeats(
    card: Card,
    currentWinner: Card,
    trumpSuit: Suit,
    leadingSuit: Suit,
  ): boolean {
    // Trump always beats non-trump
    if (card.suit === trumpSuit && currentWinner.suit !== trumpSuit) {
      return true;
    }

    // Higher trump beats lower trump
    if (card.suit === trumpSuit && currentWinner.suit === trumpSuit) {
      return card.value > currentWinner.value;
    }

    // Non-trump cannot beat trump
    if (card.suit !== trumpSuit && currentWinner.suit === trumpSuit) {
      return false;
    }

    // Within leading suit, higher value wins
    if (card.suit === leadingSuit && currentWinner.suit === leadingSuit) {
      return card.value > currentWinner.value;
    }

    // Leading suit beats off-suit
    if (card.suit === leadingSuit && currentWinner.suit !== leadingSuit) {
      return true;
    }

    return false;
  }

  calculateSectionScore(bid: number, tricksWon: number): number {
    const scoringSystem = this.session.scoringSystem;

    if (bid === tricksWon) {
      // Exact bid achieved
      if (scoringSystem === "classic") {
        return 10 + bid;
      } else {
        return 5 * (bid + 1);
      }
    } else {
      // Missed bid
      return 0;
    }
  }
}
```

## 4. Real-time Communication Architecture

### Polling-Based State Synchronization

**Note**: The application has migrated from Socket.IO to polling-based updates for Vercel/serverless compatibility.

Current implementation uses HTTP polling with a **1-second interval** for responsive real-time updates:

```typescript
// hooks/useGamePolling.ts - Default polling interval: 1000ms (1 second)
interface UseGamePollingOptions {
  sessionId: string;
  playerId: string;
  enabled?: boolean;
  pollingInterval?: number; // milliseconds (default: 1000ms)
}

export function useGamePolling({
  sessionId,
  playerId,
  enabled = true,
  pollingInterval = 1000 // 1 second for responsive updates
}: UseGamePollingOptions): GamePollingResult {
  // Implementation fetches game state every 1 second
  useEffect(() => {
    const interval = setInterval(fetchGameState, pollingInterval);
    return () => clearInterval(interval);
  }, [pollingInterval, fetchGameState]);
}
```

### Legacy Socket.IO Architecture (Deprecated)

The following Socket.IO implementation has been replaced by polling:

```typescript
class GameSocketManager {
  private io: SocketIOServer;
  private connectedPlayers: Map<string, string> = new Map(); // playerId -> socketId

  constructor(server: http.Server) {
    this.io = new SocketIOServer(server, {
      cors: { origin: "*" },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      socket.on("join-room", async ({ sessionId, playerId }) => {
        await this.handleJoinRoom(socket, sessionId, playerId);
      });

      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });

      socket.on("heartbeat", ({ playerId }) => {
        this.updatePlayerActivity(playerId);
      });
    });
  }

  async handleJoinRoom(
    socket: Socket,
    sessionId: string,
    playerId: string,
  ): Promise<void> {
    // Validate session and player
    const isValid = await this.validatePlayerSession(sessionId, playerId);
    if (!isValid) {
      socket.emit("error", {
        message: "Invalid session or player",
        code: "INVALID_SESSION",
      });
      return;
    }

    // Join room and track connection
    socket.join(sessionId);
    this.connectedPlayers.set(playerId, socket.id);

    // Update player connection status
    await this.updatePlayerConnection(playerId, true);

    // Notify others
    socket.to(sessionId).emit("player-reconnected", { playerId });

    // Send current game state
    const gameState = await this.getGameState(sessionId, playerId);
    socket.emit("game-state", gameState);
  }

  handleDisconnect(socket: Socket): void {
    // Find player by socket ID
    const playerId = this.findPlayerBySocket(socket.id);
    if (playerId) {
      this.connectedPlayers.delete(playerId);
      this.updatePlayerConnection(playerId, false);

      // Notify room about disconnection
      socket.rooms.forEach((room) => {
        socket.to(room).emit("player-disconnected", { playerId });
      });
    }
  }

  emitToSession(sessionId: string, event: string, data: any): void {
    this.io.to(sessionId).emit(event, data);
  }

  emitToPlayer(playerId: string, event: string, data: any): void {
    const socketId = this.connectedPlayers.get(playerId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }
}
```

## 5. State Management (Client-side)

### Zustand Store Structure

```typescript
interface GameStore {
  // Session state
  sessionId: string | null;
  playerId: string | null;
  players: Player[];
  gamePhase: GamePhase;

  // Current section state
  currentSection: number;
  playerHand: Card[];
  playerBid: number | null;
  tricksWon: number;

  // Current trick state
  currentTrick: Trick | null;
  isPlayerTurn: boolean;

  // Scores
  sectionScores: Record<string, number>;
  totalScores: Record<string, number>;

  // Actions
  setSessionId: (id: string) => void;
  setPlayerId: (id: string) => void;
  updatePlayers: (players: Player[]) => void;
  updateGamePhase: (phase: GamePhase) => void;
  setPlayerHand: (cards: Card[]) => void;
  playCard: (card: Card) => void;
  placeBid: (bid: number) => void;
  updateTrick: (trick: Trick) => void;
  updateScores: (scores: Record<string, number>) => void;

  // Socket connection
  socket: SocketIOClient | null;
  isConnected: boolean;
  setSocket: (socket: SocketIOClient) => void;
  setConnectionStatus: (connected: boolean) => void;
}

const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  sessionId: null,
  playerId: null,
  players: [],
  gamePhase: "waiting",
  currentSection: 0,
  playerHand: [],
  playerBid: null,
  tricksWon: 0,
  currentTrick: null,
  isPlayerTurn: false,
  sectionScores: {},
  totalScores: {},
  socket: null,
  isConnected: false,

  // Actions
  setSessionId: (id) => set({ sessionId: id }),
  setPlayerId: (id) => set({ playerId: id }),
  updatePlayers: (players) => set({ players }),
  updateGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerHand: (cards) => set({ playerHand: cards }),

  playCard: (card) => {
    const { playerHand, socket, sessionId, playerId } = get();
    const newHand = playerHand.filter((c) => !cardsEqual(c, card));
    set({ playerHand: newHand });

    // Optimistic update - will be rolled back if invalid
    socket?.emit("play-card", { sessionId, playerId, card });
  },

  placeBid: (bid) => {
    const { socket, sessionId, playerId } = get();
    set({ playerBid: bid });
    socket?.emit("place-bid", { sessionId, playerId, bid });
  },

  // ... other actions
}));
```

## 6. Component Architecture

### Key React Components

```typescript
// Main game container
const GameContainer: React.FC = () => {
  const { sessionId, gamePhase } = useGameStore();

  if (!sessionId) return <HomePage />;

  switch (gamePhase) {
    case "waiting":
      return <SessionLobby />;
    case "bidding":
      return <BiddingPhase />;
    case "playing":
      return <GameBoard />;
    case "scoring":
      return <SectionScores />;
    case "finished":
      return <FinalScores />;
    default:
      return <LoadingScreen />;
  }
};

// Individual components
const GameBoard: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <GameHeader />
      <PlayersStatus />
      <TrickArea />
      <PlayerHand />
      <GameActions />
    </div>
  );
};

const PlayerHand: React.FC = () => {
  const { playerHand, isPlayerTurn } = useGameStore();

  return (
    <div className="flex justify-center p-4 bg-green-800">
      <div className="flex space-x-2">
        {playerHand.map((card, index) => (
          <PlayableCard
            key={`${card.suit}-${card.rank}`}
            card={card}
            disabled={!isPlayerTurn}
            onPlay={() => handlePlayCard(card)}
          />
        ))}
      </div>
    </div>
  );
};

const PlayableCard: React.FC<{
  card: Card;
  disabled: boolean;
  onPlay: () => void;
}> = ({ card, disabled, onPlay }) => {
  return (
    <button
      onClick={onPlay}
      disabled={disabled}
      className={`
        w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center
        transition-all duration-200 transform hover:scale-105
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow-lg cursor-pointer"
        }
        ${
          card.suit === "hearts" || card.suit === "diamonds"
            ? "text-red-600"
            : "text-black"
        }
        bg-white border-gray-300
      `}
    >
      <span className="text-xs font-bold">{card.rank}</span>
      <span className="text-lg">{getSuitSymbol(card.suit)}</span>
    </button>
  );
};
```

### Tutorial & Learning Components

```typescript
// Interactive "How to Play" page components
const HowToPlayPage: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <TutorialNavigation
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      <TutorialContent section={currentSection} />
    </div>
  );
};

const CardPlaySimulator: React.FC = () => {
  const [currentTrick, setCurrentTrick] = useState<Trick | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>(generateSampleHand());
  const [feedback, setFeedback] = useState<string>("");

  const handleCardClick = (card: Card) => {
    const validation = validateCardPlay(
      card,
      playerHand,
      currentTrick,
      "hearts",
    );
    if (validation) {
      setFeedback(`❌ ${validation}`);
      // Show error animation
      showErrorAnimation(card);
    } else {
      setFeedback(`✅ Valid play!`);
      // Show success animation and update trick
      showSuccessAnimation(card);
      playCardInTrick(card);
    }
  };

  return (
    <div className="tutorial-simulator p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Practice Card Playing</h3>
      <div className="trick-area mb-4">
        <TrickDisplay trick={currentTrick} />
      </div>
      <div className="player-hand">
        <div className="flex space-x-2">
          {playerHand.map((card) => (
            <InteractiveCard
              key={`${card.suit}-${card.rank}`}
              card={card}
              onClick={() => handleCardClick(card)}
              showValidation={true}
            />
          ))}
        </div>
      </div>
      <div className="feedback-area mt-4">
        <p
          className={`text-lg font-medium ${
            feedback.includes("❌") ? "text-red-600" : "text-green-600"
          }`}
        >
          {feedback}
        </p>
      </div>
    </div>
  );
};

const BiddingTrainer: React.FC = () => {
  const [scenario, setScenario] = useState<BiddingScenario>(
    generateRandomScenario(),
  );
  const [userBid, setUserBid] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className="bidding-trainer p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Bidding Practice</h3>
      <ScenarioDisplay scenario={scenario} />
      <BidInput
        value={userBid}
        onChange={setUserBid}
        maxBid={scenario.handSize}
      />
      <button
        onClick={() => setShowExplanation(true)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Check My Bid
      </button>
      {showExplanation && (
        <BidExplanation
          scenario={scenario}
          userBid={userBid}
          optimalBid={calculateOptimalBid(scenario)}
        />
      )}
    </div>
  );
};

const ScoreCalculator: React.FC = () => {
  const [bid, setBid] = useState<number>(0);
  const [tricksWon, setTricksWon] = useState<number>(0);
  const [scoringSystem, setScoringSystem] = useState<"classic" | "modern">(
    "classic",
  );

  const calculatedScore = useMemo(() => {
    return calculateSectionScore(bid, tricksWon, scoringSystem);
  }, [bid, tricksWon, scoringSystem]);

  return (
    <div className="score-calculator p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Score Calculator</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Bid</label>
          <input
            type="number"
            min="0"
            max="13"
            value={bid}
            onChange={(e) => setBid(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tricks Won</label>
          <input
            type="number"
            min="0"
            max="13"
            value={tricksWon}
            onChange={(e) => setTricksWon(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Scoring System</label>
        <select
          value={scoringSystem}
          onChange={(e) =>
            setScoringSystem(e.target.value as "classic" | "modern")
          }
          className="w-full p-2 border rounded"
        >
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
        </select>
      </div>
      <div className="result bg-gray-100 p-4 rounded">
        <p className="text-lg font-bold">
          Score: <span className="text-blue-600">{calculatedScore} points</span>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {bid === tricksWon
            ? "✅ Perfect! You achieved your bid exactly."
            : `❌ Missed bid by ${Math.abs(bid - tricksWon)} trick${
                Math.abs(bid - tricksWon) !== 1 ? "s" : ""
              }.`}
        </p>
      </div>
    </div>
  );
};

const TrumpSuitDemo: React.FC = () => {
  const [currentExample, setCurrentExample] = useState(0);
  const examples = useTrumpExamples();

  return (
    <div className="trump-demo p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Trump Suit Effects</h3>
      <div className="example-selector mb-4">
        <div className="flex space-x-2">
          {examples.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentExample(index)}
              className={`px-3 py-1 rounded ${
                currentExample === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Example {index + 1}
            </button>
          ))}
        </div>
      </div>
      <TrumpExampleDisplay example={examples[currentExample]} animated={true} />
    </div>
  );
};

// Helper interfaces for tutorial components
interface BiddingScenario {
  handSize: number;
  playerHand: Card[];
  trumpSuit: Suit;
  playerPosition: number;
  dealerPosition: number;
  description: string;
}

interface TrumpExample {
  cards: Card[];
  trumpSuit: Suit;
  leadingSuit: Suit;
  winner: Card;
  explanation: string;
}
```

## 7. Error Handling & Validation

### Client-side Validation

```typescript
class GameValidator {
  static validateBid(bid: number, maxBid: number): string | null {
    if (bid < 0) return "Bid cannot be negative";
    if (bid > maxBid) return `Bid cannot exceed ${maxBid}`;
    if (!Number.isInteger(bid)) return "Bid must be a whole number";
    return null;
  }

  static validateCardPlay(
    card: Card,
    hand: Card[],
    trick: Trick,
    trumpSuit: Suit,
  ): string | null {
    if (!hand.some((c) => cardsEqual(c, card))) {
      return "You do not have this card";
    }

    if (trick.leadingSuit) {
      const hasLeadingSuit = hand.some((c) => c.suit === trick.leadingSuit);
      if (hasLeadingSuit && card.suit !== trick.leadingSuit) {
        return `You must follow suit (${trick.leadingSuit})`;
      }
    }

    return null;
  }

  static validateSessionCode(code: string): string | null {
    if (!code) return "Session code is required";
    if (code.length !== 6) return "Session code must be 6 characters";
    if (!/^[A-Z0-9]+$/.test(code))
      return "Session code must contain only letters and numbers";
    return null;
  }

  static validatePlayerName(name: string): string | null {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (name.length > 20) return "Name must be less than 20 characters";
    if (!/^[a-zA-Z0-9\s]+$/.test(name))
      return "Name can only contain letters, numbers, and spaces";
    return null;
  }
}
```

## 8. UI Enhancement Features

### Effect System

```typescript
enum EffectType {
  SUCCESS = "success",
  FAILURE = "failure",
  NEUTRAL = "neutral",
}

interface GameEffect {
  type: EffectType;
  message: string;
  animation: string;
  duration: number;
  sound?: string;
}

class EffectManager {
  private successEffects: GameEffect[] = [
    {
      type: EffectType.SUCCESS,
      message: "Perfect!",
      animation: "fireworks",
      duration: 3000,
    },
    {
      type: EffectType.SUCCESS,
      message: "Excellent!",
      animation: "confetti",
      duration: 3000,
    },
    {
      type: EffectType.SUCCESS,
      message: "Fantastic!",
      animation: "celebration",
      duration: 3000,
    },
    {
      type: EffectType.SUCCESS,
      message: "Well done!",
      animation: "sparkles",
      duration: 3000,
    },
  ];

  private failureEffects: GameEffect[] = [
    {
      type: EffectType.FAILURE,
      message: "Too bad!",
      animation: "disappointed",
      duration: 2000,
    },
    {
      type: EffectType.FAILURE,
      message: "Almost!",
      animation: "sympathetic",
      duration: 2000,
    },
    {
      type: EffectType.FAILURE,
      message: "Better luck next time!",
      animation: "encouraging",
      duration: 2000,
    },
  ];

  private neutralEffects: GameEffect[] = [
    {
      type: EffectType.NEUTRAL,
      message: "Interesting...",
      animation: "neutral",
      duration: 2000,
    },
    {
      type: EffectType.NEUTRAL,
      message: "Hmm...",
      animation: "thinking",
      duration: 2000,
    },
    {
      type: EffectType.NEUTRAL,
      message: "Okay then!",
      animation: "shrug",
      duration: 2000,
    },
  ];

  getRandomEffect(type: EffectType): GameEffect {
    const effects = {
      [EffectType.SUCCESS]: this.successEffects,
      [EffectType.FAILURE]: this.failureEffects,
      [EffectType.NEUTRAL]: this.neutralEffects,
    };

    const typeEffects = effects[type];
    return typeEffects[Math.floor(Math.random() * typeEffects.length)];
  }

  triggerTrickEffect(
    playerId: string,
    bid: number,
    currentTricks: number,
    isLastTrick: boolean,
  ): EffectType {
    if (!isLastTrick) {
      // Mid-section trick evaluation
      const tricksNeeded = bid - currentTricks;
      if (tricksNeeded === 0) return EffectType.SUCCESS; // Got exactly what they needed
      if (tricksNeeded < 0 && Math.abs(tricksNeeded) === 1)
        return EffectType.FAILURE; // One too many
      return EffectType.NEUTRAL; // Two or more over
    } else {
      // Final evaluation
      return currentTricks === bid ? EffectType.SUCCESS : EffectType.FAILURE;
    }
  }
}
```

### Display Mode Features

```typescript
interface DisplayModeState {
  isEnabled: boolean;
  showQRCode: boolean;
  scoreGraphVisible: boolean;
  effectsEnabled: boolean;
}

class DisplayModeManager {
  private qrCodeGenerator = new QRCodeGenerator();
  private scoreGraph = new ScoreGraphManager();

  generateSessionQR(sessionId: string): string {
    const joinUrl = `${window.location.origin}/join/${sessionId}`;
    return this.qrCodeGenerator.generate(joinUrl);
  }

  updateScoreGraph(
    players: Player[],
    sectionScores: Record<string, number[]>,
  ): void {
    this.scoreGraph.updateData(players, sectionScores);
  }

  hideQRCode(): void {
    // Hide QR code when first section starts
    this.setState({ showQRCode: false });
  }

  showLargeTrickEffect(effect: GameEffect, playerName: string): void {
    // Display prominent effect on large screen
    const effectElement = document.createElement("div");
    effectElement.className = `large-effect ${effect.animation}`;
    effectElement.innerHTML = `
      <div class="player-name">${playerName}</div>
      <div class="effect-message">${effect.message}</div>
    `;

    document.body.appendChild(effectElement);

    setTimeout(() => {
      effectElement.remove();
    }, effect.duration);
  }
}
```

### Session Sharing & QR Codes

```typescript
class SessionSharingManager {
  generateShareableLink(sessionId: string): string {
    return `${window.location.origin}/join/${sessionId}`;
  }

  generateQRCode(sessionId: string): Promise<string> {
    const joinUrl = this.generateShareableLink(sessionId);

    // Using QR code library
    return QRCode.toDataURL(joinUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  }

  copyLinkToClipboard(sessionId: string): Promise<boolean> {
    const link = this.generateShareableLink(sessionId);

    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    }
  }
}
```

### Score Graph Implementation

```typescript
interface ScoreDataPoint {
  section: number;
  score: number;
  totalScore: number;
}

class ScoreGraphManager {
  private chartInstance: Chart | null = null;

  initializeGraph(canvasElement: HTMLCanvasElement): void {
    this.chartInstance = new Chart(canvasElement, {
      type: "line",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Total Score",
            },
          },
          x: {
            title: {
              display: true,
              text: "Section",
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          title: {
            display: true,
            text: "Score Progress",
          },
        },
      },
    });
  }

  updateData(
    players: Player[],
    sectionHistory: Record<string, number[]>,
  ): void {
    if (!this.chartInstance) return;

    const sections = Object.values(sectionHistory)[0]?.length || 0;
    const labels = Array.from(
      { length: sections },
      (_, i) => `Section ${i + 1}`,
    );

    const datasets = players.map((player, index) => ({
      label: player.name,
      data: this.calculateCumulativeScores(sectionHistory[player.id] || []),
      borderColor: this.getPlayerColor(index),
      backgroundColor: this.getPlayerColor(index, 0.1),
      tension: 0.1,
    }));

    this.chartInstance.data.labels = labels;
    this.chartInstance.data.datasets = datasets;
    this.chartInstance.update();
  }

  private calculateCumulativeScores(sectionScores: number[]): number[] {
    let cumulative = 0;
    return sectionScores.map((score) => (cumulative += score));
  }

  private getPlayerColor(index: number, alpha = 1): string {
    const colors = [
      `rgba(255, 99, 132, ${alpha})`, // Red
      `rgba(54, 162, 235, ${alpha})`, // Blue
      `rgba(255, 205, 86, ${alpha})`, // Yellow
      `rgba(75, 192, 192, ${alpha})`, // Green
      `rgba(153, 102, 255, ${alpha})`, // Purple
      `rgba(255, 159, 64, ${alpha})`, // Orange
      `rgba(199, 199, 199, ${alpha})`, // Grey
      `rgba(83, 102, 255, ${alpha})`, // Indigo
    ];
    return colors[index % colors.length];
  }
}
```

### Error Recovery

```typescript
class ErrorRecoveryManager {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async handleSocketDisconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.showCriticalError("Unable to reconnect to game server");
      return;
    }

    this.reconnectAttempts++;

    setTimeout(async () => {
      try {
        await this.attemptReconnection();
        this.reconnectAttempts = 0;
      } catch (error) {
        await this.handleSocketDisconnection();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  async handleGameStateDesync(): Promise<void> {
    // Request fresh game state from server
    const gameState = await this.fetchGameState();
    useGameStore.getState().syncGameState(gameState);
  }

  showCriticalError(message: string): void {
    // Show modal with option to refresh or return to home
    useGameStore.getState().setError(message, "critical");
  }
}
```

## 9. AI Player System

### AI Architecture Overview

```typescript
abstract class AIPlayer {
  protected difficulty: "easy" | "medium" | "hard";
  protected personality: AIPersonality;
  protected memory: AIMemory;
  protected decisionEngine: AIDecisionEngine;

  abstract calculateBid(hand: Card[], gameContext: GameContext): number;
  abstract selectCard(hand: Card[], gameState: GameState): Card;

  protected addRandomness(value: number, factor: number): number {
    const variance = value * factor;
    return Math.round(value + (Math.random() - 0.5) * variance);
  }
}
```

### Difficulty Implementation

#### Easy AI Strategy

```typescript
class EasyAI extends AIPlayer {
  calculateBid(hand: Card[], trumpSuit: Suit): number {
    let estimatedTricks = 0;

    // Count obvious winners
    for (const card of hand) {
      if (card.suit === trumpSuit && card.value >= 12) estimatedTricks++; // High trump
      if (card.value === 14) estimatedTricks += 0.8; // Aces
      if (card.value === 13) estimatedTricks += 0.4; // Kings
    }

    // Conservative adjustment
    const conservativeBid = Math.max(0, Math.floor(estimatedTricks * 0.8));
    return this.addRandomness(conservativeBid, 0.15);
  }

  selectCard(hand: Card[], currentTrick: Trick, trumpSuit: Suit): Card {
    const validCards = this.getValidCards(hand, currentTrick);

    // Simple heuristic: play high when trying to win, low when trying to lose
    const needsToWin = this.shouldTryToWinTrick(currentTrick);

    if (needsToWin) {
      return this.getHighestCard(
        validCards,
        currentTrick.leadingSuit,
        trumpSuit,
      );
    } else {
      return this.getLowestCard(validCards);
    }
  }

  private shouldTryToWinTrick(trick: Trick): boolean {
    // Simple logic: try to win if we're not already over our bid
    return this.tricksWon < this.bid;
  }
}
```

#### Medium AI Strategy

```typescript
class MediumAI extends AIPlayer {
  private opponentProfiles: Map<string, OpponentProfile> = new Map();
  private playedCards: Set<string> = new Set();

  calculateBid(hand: Card[], gameContext: GameContext): number {
    const analysis = this.analyzeHand(hand, gameContext.trumpSuit);
    const positionFactor = this.calculatePositionAdvantage(
      gameContext.position,
    );
    const opponentFactor = this.estimateOpponentStrength(gameContext);

    const estimatedTricks =
      analysis.expectedTricks + positionFactor - opponentFactor;
    return this.addRandomness(Math.max(0, estimatedTricks), 0.1);
  }

  selectCard(hand: Card[], gameState: GameState): Card {
    const validCards = this.getValidCards(hand, gameState.currentTrick);
    const gameAnalysis = this.analyzeGameSituation(gameState);

    // Prioritized decision making
    if (gameAnalysis.canSetOpponent) {
      return this.selectSettingCard(validCards, gameState);
    }

    if (gameAnalysis.shouldConserveTrump) {
      return this.selectNonTrumpCard(validCards, gameState);
    }

    if (gameAnalysis.desperateForTricks) {
      return this.selectAggressiveCard(validCards, gameState);
    }

    return this.selectBalancedCard(validCards, gameState);
  }

  private analyzeHand(hand: Card[], trumpSuit: Suit): HandAnalysis {
    return {
      trumpCount: hand.filter((c) => c.suit === trumpSuit).length,
      highCards: hand.filter((c) => c.value >= 12).length,
      longSuits: this.findLongSuits(hand),
      expectedTricks: this.calculateExpectedTricks(hand, trumpSuit),
    };
  }
}
```

#### Hard AI Strategy

```typescript
class HardAI extends AIPlayer {
  private gameHistory: GameHistory = new GameHistory();
  private cardTracker: CardTracker = new CardTracker();
  private opponentModeler: OpponentModeler = new OpponentModeler();

  calculateBid(hand: Card[], gameContext: GameContext): number {
    const deepAnalysis = this.performDeepAnalysis(hand, gameContext);
    const simulationResults = this.runBidSimulations(hand, gameContext, 1000);
    const opponentModeling =
      this.opponentModeler.predictOpponentBids(gameContext);

    const optimalBid = this.optimizeBidBasedOnSimulations(
      deepAnalysis,
      simulationResults,
      opponentModeling,
    );

    return this.addRandomness(optimalBid, 0.05);
  }

  selectCard(hand: Card[], gameState: GameState): Card {
    const possiblePlays = this.getValidCards(hand, gameState.currentTrick);
    const evaluations = possiblePlays.map((card) => {
      return {
        card,
        evaluation: this.evaluateCardPlay(card, gameState),
        simulations: this.runPlaySimulations(card, gameState, 500),
      };
    });

    const bestPlay = this.selectOptimalPlay(evaluations);
    this.updateGameKnowledge(bestPlay, gameState);

    return bestPlay.card;
  }

  private performDeepAnalysis(
    hand: Card[],
    context: GameContext,
  ): DeepAnalysis {
    return {
      cardCombinations: this.analyzeCardCombinations(hand),
      suitStrengths: this.analyzeSuitStrengths(hand, context.trumpSuit),
      positionalAdvantage: this.calculateDetailedPosition(context),
      trumpTiming: this.optimizeTrumpUsage(hand, context),
      defensiveCapability: this.assessDefensiveOptions(hand, context),
    };
  }

  private runBidSimulations(
    hand: Card[],
    context: GameContext,
    iterations: number,
  ): SimulationResult {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const simulatedOpponentHands =
        this.generatePlausibleOpponentHands(context);
      const gameSimulation = new GameSimulation(
        hand,
        simulatedOpponentHands,
        context,
      );
      results.push(gameSimulation.run());
    }

    return this.aggregateSimulationResults(results);
  }
}
```

### Core AI Components

#### Game State Analysis

```typescript
class GameAnalyzer {
  analyzePosition(gameState: GameState, playerId: string): PositionAnalysis {
    const player = gameState.players.find((p) => p.id === playerId);
    const tricksNeeded = player.bid - player.tricksWon;
    const tricksRemaining = this.calculateRemainingTricks(gameState);

    return {
      isOnTrack: tricksNeeded === tricksRemaining,
      isAhead: player.tricksWon > player.bid,
      isBehind: tricksNeeded > tricksRemaining,
      canStillMakeBid: tricksNeeded <= tricksRemaining,
      shouldPlayDefensively: player.tricksWon >= player.bid,
    };
  }

  identifyThreats(gameState: GameState, playerId: string): ThreatAnalysis {
    const threats = [];

    for (const opponent of gameState.players) {
      if (opponent.id === playerId) continue;

      const opponentNeeds = opponent.bid - opponent.tricksWon;
      const remainingTricks = this.calculateRemainingTricks(gameState);

      if (opponentNeeds === remainingTricks) {
        threats.push({
          playerId: opponent.id,
          type: "exact_bid",
          priority: "high",
          canDisrupt: this.assessDisruptionPotential(opponent, gameState),
        });
      }
    }

    return { threats, overallThreatLevel: this.calculateThreatLevel(threats) };
  }
}
```

#### Card Tracking System

```typescript
class CardTracker {
  private playedCards: Set<string> = new Set();
  private suitDistributions: Map<string, SuitDistribution> = new Map();

  recordCardPlay(playerId: string, card: Card): void {
    this.playedCards.add(`${card.suit}${card.rank}`);
    this.updateSuitDistribution(playerId, card.suit);
  }

  getRemainingCards(suit?: Suit): Card[] {
    const allCards = this.generateFullDeck();
    return allCards.filter((card) => {
      const cardKey = `${card.suit}${card.rank}`;
      return (
        !this.playedCards.has(cardKey) &&
        (suit === undefined || card.suit === suit)
      );
    });
  }

  estimateOpponentHolding(playerId: string, suit: Suit): number {
    const distribution = this.suitDistributions.get(playerId);
    if (!distribution) return 3; // Default estimate

    const knownPlays = distribution.suits[suit] || 0;
    const estimatedTotal = this.estimateOriginalSuitLength(playerId, suit);
    return Math.max(0, estimatedTotal - knownPlays);
  }
}
```

#### Decision Engine

```typescript
class AIDecisionEngine {
  evaluateCardPlay(card: Card, gameState: GameState): PlayEvaluation {
    const immediateValue = this.calculateImmediateValue(card, gameState);
    const strategicValue = this.calculateStrategicValue(card, gameState);
    const riskFactor = this.calculateRiskFactor(card, gameState);

    return {
      totalScore: immediateValue + strategicValue - riskFactor,
      breakdown: {
        immediate: immediateValue,
        strategic: strategicValue,
        risk: riskFactor,
      },
      confidence: this.calculateConfidence(card, gameState),
      reasoning: this.generateReasoning(card, gameState),
    };
  }

  private calculateImmediateValue(card: Card, gameState: GameState): number {
    const currentTrick = gameState.currentTrick;
    let value = 0;

    // Value for winning/losing the trick
    if (this.wouldWinTrick(card, currentTrick, gameState.trumpSuit)) {
      value += this.needsTrick(gameState) ? 10 : -5;
    }

    // Value for trump conservation
    if (card.suit === gameState.trumpSuit) {
      value -= this.shouldConserveTrump(gameState) ? 3 : 0;
    }

    return value;
  }
}
```

### AI Integration with Game Engine

#### Server-Side AI Management

```typescript
class AIPlayerManager {
  private aiPlayers: Map<string, AIPlayer> = new Map();
  private decisionQueue: AIDecisionQueue = new AIDecisionQueue();

  async addAIPlayer(
    sessionId: string,
    difficulty: AIDifficulty,
  ): Promise<Player> {
    const aiPlayer = this.createAIPlayer(difficulty);
    const playerData = await this.registerPlayerInSession(sessionId, aiPlayer);

    this.aiPlayers.set(playerData.id, aiPlayer);
    return playerData;
  }

  async processAITurn(playerId: string, gameState: GameState): Promise<void> {
    const aiPlayer = this.aiPlayers.get(playerId);
    if (!aiPlayer) return;

    // Add realistic thinking delay
    const thinkingTime = this.calculateThinkingTime(aiPlayer.difficulty);
    await this.delay(thinkingTime);

    const decision = await aiPlayer.makeDecision(gameState);
    await this.executePlayerAction(playerId, decision);
  }

  private calculateThinkingTime(difficulty: AIDifficulty): number {
    const baseTimes = { easy: 2000, medium: 3500, hard: 5000 };
    const variance = 1000;
    return baseTimes[difficulty] + (Math.random() - 0.5) * variance;
  }
}
```

#### Client-Side AI Indicators

```typescript
const AIPlayerIndicator: React.FC<{ player: Player }> = ({ player }) => {
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (player.isAI && player.isCurrentTurn) {
      setIsThinking(true);
      const timer = setTimeout(() => setIsThinking(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [player.isCurrentTurn]);

  return (
    <div className={`player-indicator ${player.isAI ? "ai-player" : ""}`}>
      <span className="player-name">
        {player.name} {player.isAI && `(${player.aiDifficulty})`}
      </span>
      {player.isAI && isThinking && (
        <div className="thinking-indicator">
          <span className="thinking-dots">🤔</span>
        </div>
      )}
    </div>
  );
};
```

This technical specification provides a comprehensive foundation for implementing the Jøssing card game application with robust multiplayer functionality, real-time synchronization, intelligent AI opponents, and excellent user experience.
