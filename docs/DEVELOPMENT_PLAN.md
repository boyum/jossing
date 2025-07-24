# Jøssing Card Game - Application Development Plan

## 1. Project Overview

### Objective
Create a web-based multiplayer Jøssing card game using Next.js that allows players to join sessions from their own devices with real-time synchronization.

### Core Requirements
- Multiplayer support (2-8 players)
- Real-time gameplay synchronization
- Session-based game management
- Mobile-responsive design
- Support for both Classic and Modern scoring systems
- Game state persistence

## 2. Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14+ with App Router
- **Backend**: Next.js API routes
- **Real-time Communication**: Socket.IO or Server-Sent Events (SSE)
- **Database**: SQLite with Prisma ORM (for simplicity) or PostgreSQL for production
- **State Management**: Zustand or React Context
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript throughout

### Deployment
- **Development**: Local development with hot reload
- **Production**: Vercel or similar platform
- **Database**: Railway, PlanetScale, or similar for production

## 3. Data Models

### Game Session
```typescript
interface GameSession {
  id: string
  adminPlayerId: string
  gameType: 'up' | 'up-and-down'
  scoringSystem: 'classic' | 'modern'
  maxPlayers: number
  currentSection: number
  gamePhase: 'waiting' | 'bidding' | 'playing' | 'scoring' | 'finished'
  createdAt: Date
  updatedAt: Date
}
```

### Player
```typescript
interface Player {
  id: string
  sessionId: string
  name: string
  isAdmin: boolean
  isAI: boolean  // Distinguishes AI from human players
  aiDifficulty?: 'easy' | 'medium' | 'hard'  // Only for AI players
  position: number // Seating order
  totalScore: number
  isConnected: boolean
  joinedAt: Date
}

// Extended AI Player interface for server-side logic
interface AIPlayerData extends Player {
  isAI: true
  aiDifficulty: 'easy' | 'medium' | 'hard'
  personality: AIPersonality
  memory: AIGameMemory
}

interface AIPersonality {
  aggressiveness: number    // 0-1: How likely to take risks
  consistency: number       // 0-1: How predictable the AI is  
  adaptability: number      // 0-1: How quickly AI learns opponent patterns
}

interface AIGameMemory {
  opponentBids: Record<string, number[]>     // Historical bidding patterns
  opponentPlays: Record<string, CardPlay[]>  // Historical card plays
  gamePatterns: GamePattern[]                // Learned strategic patterns
}
```

### Section State
```typescript
interface SectionState {
  sessionId: string
  sectionNumber: number
  dealerId: string
  leadPlayerId: string
  trumpSuit: Suit
  trumpCard: Card
  playerHands: Record<string, Card[]>
  playerBids: Record<string, number>
  playerTricksWon: Record<string, number>
  currentTrick: Trick
  completedTricks: Trick[]
  sectionScores: Record<string, number>
}
```

### Card & Trick
```typescript
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'
  value: number // For comparison
}

interface Trick {
  id: string
  leadPlayerId: string
  cardsPlayed: Record<string, Card>
  winnerId?: string
  leadingSuit?: Suit
}
```

## 4. Application Flow

### Session Management
1. **Create Session**
   - Admin player creates a new game session
   - Generates unique session code (6-digit alphanumeric)
   - Sets game parameters (type, scoring system, max players)

2. **Join Session**
   - Players enter session code to join
   - Name validation and duplicate checking
   - Automatic seating assignment

3. **Session Lobby**
   - View connected players
   - Admin can start the game when ready
   - Real-time player connection status

### Game Flow
1. **Game Initialization**
   - Assign dealer position
   - Navigate to first section

2. **Section Flow**
   - Shuffle deck completely
   - Set new trump card for this section
   - Deal cards to all players
   - Bidding phase (simultaneous)
   - Determine first player (highest bidder, closest to dealer)
   - Trick-taking phase
   - Score calculation and display
   - Proceed to next section or end game

3. **Trick Flow**
   - Current player plays a card
   - Validate card play (suit following rules)
   - Wait for all players to play
   - Determine trick winner
   - Update scores and proceed

## 5. User Interface Design

### Home Page Design
- **Simple Layout**: Clean title with "Jøssing" branding
- **Primary Actions**: 
  - Large "Create New Session" button
  - Quick join input field with session code + submit button
- **Session Sharing**: Generate shareable links for easy session joining
- **Mobile-First**: Optimized for players joining on phones

### Screen Hierarchy
```
├── Home Page (Simple)
│   ├── Title & Branding
│   ├── Create New Session Button
│   ├── Quick Join (Input + Submit)
│   └── How to Play Link
├── How to Play Page
│   ├── Interactive Tutorial
│   ├── Game Rules Overview
│   ├── Scoring Examples
│   ├── Interactive Demos
│   └── Quick Start Guide
├── Session Lobby
│   ├── Player List
│   ├── Game Settings
│   ├── QR Code (pre-game only)
│   └── Start Game (Admin only)
├── Game Board
│   ├── Player's Hand
│   ├── Current Trick Area
│   ├── Score Display
│   ├── Game Status
│   └── Action Buttons
├── Display Mode (Admin Large Screen)
│   ├── Live Score Graph
│   ├── QR Code for Joining (pre-game)
│   ├── Trick Effects & Animations
│   └── Player Status Overview
├── Bidding Modal
└── Final Scores
```

### Display Mode Features (Large Screen)
- **Score Graph**: Real-time visual representation of player scores across sections
- **QR Code**: For easy mobile joining (only shown before first section starts)
- **Trick Effects**: 
  - **Positive**: When player gets trick they need for their bid (green checkmark, celebration)
  - **Negative**: When player gets unwanted trick that ruins their bid (red X, disappointed)
  - **Neutral**: When player gets 2+ tricks beyond their bid (yellow neutral face)
- **Admin Controls**: Toggle display mode, game management

### Client-Side Effects
- **Success Effects**: Randomized congratulations with fireworks/confetti when achieving bid
- **Failure Effects**: Randomized "too bad" messages with sympathetic animations
- **Neutral Effects**: Randomized neutral responses for over-bidding situations
- **Dynamic Feel**: Multiple effect variations to keep experience fresh

### Key UI Components
- **Card Component**: Responsive card display with suit symbols
- **Player Status Bar**: Shows player names, bids, tricks won, and scores
- **Hand Management**: Touch-friendly card selection and playing
- **Trick Display**: Visual representation of current trick
- **Score Table**: Real-time score tracking across sections
- **Game Status Indicator**: Current phase, whose turn, etc.
- **Effect System**: Animated feedback for game events
- **QR Code Generator**: For session sharing
- **Score Graph**: Interactive visualization for display mode

### Session Sharing & Joining
- **Shareable Links**: Generate URLs like `domain.com/join/ABC123`
- **QR Codes**: Automatically generated for easy mobile scanning
- **Quick Join**: Prominent input field on home page for session codes
- **Deep Linking**: Direct navigation to game from shared links

## 5.1. Interactive "How to Play" Page

### Overview
A comprehensive, engaging tutorial page that helps new players understand Jøssing quickly through interactive demonstrations and clear explanations.

### Core Features

#### Interactive Tutorial Sections
1. **Basic Card Game Concepts**
   - Interactive card deck visualization
   - Suit and rank explanations with hover effects
   - Trump card demonstration with visual highlighting

2. **Bidding Phase Demo**
   - Step-by-step interactive bidding scenario
   - Visual countdown timer demonstration
   - Bid validation examples (valid vs invalid bids)
   - Strategic bidding tips with animated examples

3. **Trick-Taking Simulator**
   - Interactive 4-player trick simulation
   - Click-to-play cards with immediate feedback
   - Suit-following rule demonstrations
   - Trump card override examples
   - Winner determination with highlighting

4. **Scoring Examples**
   - Side-by-side Classic vs Modern scoring comparison
   - Interactive scoring calculator
   - Sample scenarios with different bid outcomes
   - Progressive score visualization across sections

#### Game Flow Walkthrough
- **Section Progression**: Visual representation of "Up" and "Up-and-Down" game types
- **Card Distribution**: Animated dealing for different section numbers
- **Trump Suit Changes**: Visual demonstration of per-section trump changes
- **Complete Game Example**: Short 3-section demo game with scoring

#### Quick Reference Tools
- **Rules Summary Card**: Collapsible reference sections
- **Scoring Cheat Sheet**: Quick lookup table
- **Valid Card Plays**: Interactive rule checker
- **Common Scenarios**: FAQ-style problem solving

#### Interactive Components
```typescript
// Example interactive components
- CardPlaySimulator: Click cards to see valid/invalid plays
- BiddingTrainer: Practice bidding in different scenarios  
- ScoreCalculator: Input bids/tricks to see point outcomes
- TrumpSuitDemo: Visual trump card effects
- SectionProgresser: See how game structure changes
```

#### Engagement Features
- **Progressive Disclosure**: Start simple, reveal complexity gradually
- **Immediate Feedback**: Visual confirmation of understanding
- **Practice Mode**: Safe environment to try concepts
- **Mobile Optimized**: Touch-friendly on all devices
- **Accessibility**: Screen reader friendly, keyboard navigation

#### Technical Implementation
- **React Components**: Reusable game logic components
- **Animation Library**: Smooth transitions and effects (Framer Motion)
- **State Management**: Local state for tutorial progress
- **Responsive Design**: Adapts to screen size
- **Performance**: Lightweight, fast loading

## 6. Real-time Features

### Socket Events
```typescript
// Client to Server
'join-session'
'leave-session'
'start-game'
'place-bid'
'play-card'
'ready-next-section'

// Server to Client
'player-joined'
'player-left'
'game-started'
'cards-dealt'
'bidding-phase'
'card-played'
'trick-completed'
'section-completed'
'game-ended'
'error'
```

### State Synchronization
- Optimistic updates for own actions
- Server validation and rollback if necessary
- Graceful handling of disconnections
- Reconnection with state restoration

## 7. Core Game Logic

### Card Game Engine
```typescript
class JossingGame {
  // Core game state
  session: GameSession
  players: Player[]
  currentSection: SectionState
  
  // Game actions
  dealCards(sectionNumber: number): void
  validateCardPlay(playerId: string, card: Card): boolean
  processCardPlay(playerId: string, card: Card): TrickResult
  calculateSectionScores(): Record<string, number>
  determineGameWinner(): Player
  
  // Validation logic
  canPlayCard(playerId: string, card: Card): boolean
  mustFollowSuit(hand: Card[], leadingSuit: Suit): boolean
  getTrickWinner(trick: Trick, trumpSuit: Suit): string
}
```

### Validation Rules
- Ensure players follow suit when possible
- Validate turn order
- Prevent playing out of turn
- Card availability checking
- Bid range validation (0 to n cards)

## 8. API Endpoints

### REST Endpoints
```
POST   /api/sessions          - Create new game session
GET    /api/sessions/:id      - Get session details
POST   /api/sessions/:id/join - Join existing session
DELETE /api/sessions/:id/leave - Leave session
GET    /api/sessions/:id/state - Get current game state
```

### WebSocket Events
- Real-time game state updates
- Player action broadcasting
- Connection management
- Error handling and recovery

## 9. Mobile Responsiveness

### Key Considerations
- **Card Display**: Stack/fan cards appropriately for small screens
- **Touch Interactions**: Easy card selection and playing
- **Orientation Support**: Both portrait and landscape modes
- **Performance**: Efficient rendering for older mobile devices
- **Accessibility**: Screen reader support, high contrast mode

### Responsive Breakpoints
- Mobile: < 768px (focus on vertical layout)
- Tablet: 768px - 1024px (hybrid layout)
- Desktop: > 1024px (full horizontal layout)

## 10. Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js project with TypeScript ✅
- [ ] Configure database and Prisma schema ✅
- [ ] Implement simplified home page with quick join
- [ ] Create interactive "How to Play" page with demos
- [ ] Create core UI components ✅
- [ ] Set up Socket.IO integration
- [ ] Implement session creation and joining APIs
- [ ] Add shareable session links

### Phase 2: Core Game Logic (Week 3-4)
- [ ] Implement card dealing and shuffling ✅
- [ ] Build bidding system
- [ ] Create trick-taking mechanics
- [ ] Implement scoring systems (Classic & Modern) ✅
- [ ] Add game state validation

### Phase 3: Real-time Features (Week 5)
- [ ] Complete Socket.IO event system
- [ ] Implement real-time state synchronization
- [ ] Add connection management
- [ ] Handle player disconnections gracefully

### Phase 4: UI/UX & Effects (Week 6)
- [ ] Responsive design implementation
- [ ] Create effect system for trick outcomes
- [ ] Implement client-side success/failure animations
- [ ] Add randomized effect variations
- [ ] Mobile optimization
- [ ] QR code generation for session joining

### Phase 5: Display Mode (Week 7)
- [ ] Implement admin display mode toggle
- [ ] Create live score graph visualization
- [ ] Add large-screen trick effect animations
- [ ] Implement QR code display (pre-game only)
- [ ] Add admin controls for display management

### Phase 6: Testing & Deployment (Week 8)
- [ ] Unit tests for game logic
- [ ] Integration tests for multiplayer scenarios
- [ ] Performance optimization
- [ ] Production deployment setup

### Phase 7: Advanced Features (Week 9+)
- [ ] AI player system (Easy, Medium, Hard difficulty)
- [ ] Game replay system
- [ ] Statistics tracking
- [ ] Tournament mode
- [ ] Spectator mode
- [ ] Enhanced effect system with sound
- [ ] Progressive Web App (PWA) features
- [ ] Create trick-taking mechanics
- [ ] Implement scoring systems (Classic & Modern)
- [ ] Add game state validation

### Phase 3: Real-time Features (Week 5)
- [ ] Complete Socket.IO event system
- [ ] Implement real-time state synchronization
- [ ] Add connection management
- [ ] Handle player disconnections gracefully

### Phase 4: UI/UX Polish (Week 6)
- [ ] Responsive design implementation
- [ ] Animation and transitions
- [ ] Error handling and user feedback
- [ ] Mobile optimization

### Phase 5: Testing & Deployment (Week 7)
- [ ] Unit tests for game logic
- [ ] Integration tests for multiplayer scenarios
- [ ] Performance optimization
- [ ] Production deployment setup

### Phase 6: Advanced Features (Week 8+)
- [ ] Game replay system
- [ ] Statistics tracking
- [ ] Tournament mode
- [ ] Spectator mode
- [ ] Chat system

## 11. Technical Challenges & Solutions

### Challenge 1: Real-time State Synchronization
**Problem**: Keeping all players' game states synchronized
**Solution**: 
- Single source of truth on server
- Optimistic updates with rollback capability
- Periodic state reconciliation

### Challenge 2: Network Disconnections
**Problem**: Players may lose connection during gameplay
**Solution**:
- Store game state persistently
- Implement reconnection logic
- Graceful degradation (pause game for brief disconnections)

### Challenge 3: Mobile Card Interface
**Problem**: Playing cards on small screens
**Solution**:
- Intuitive gesture controls
- Clear visual feedback
- Adaptive UI based on hand size

### Challenge 4: Game Rule Validation
**Problem**: Ensuring all game rules are properly enforced
**Solution**:
- Comprehensive validation on server side
- Clear error messages for invalid actions
- Extensive test coverage for edge cases

## 11.1. AI Player System

### Overview
An intelligent computer player system that provides practice opponents and fills empty seats when there aren't enough human players. The AI uses strategic decision-making algorithms that simulate realistic human-like play patterns.

### AI Difficulty Levels

#### Easy AI (Beginner Friendly)
**Bidding Strategy:**
- Conservative bidding approach
- Bids slightly under what hand analysis suggests
- 15% randomness factor to simulate uncertainty
- Considers only basic card strength (high cards, trump cards)
- No advanced position analysis

**Card Playing Strategy:**
- Follows suit correctly but doesn't optimize
- Plays high cards when winning tricks needed
- Plays low cards when avoiding tricks
- No complex trump management
- 20% random suboptimal play for realism

```typescript
class EasyAI extends AIPlayer {
  calculateBid(hand: Card[], trumpSuit: Suit): number {
    const basicStrength = this.countHighCards(hand) + this.countTrumpCards(hand, trumpSuit);
    const estimatedTricks = Math.floor(basicStrength / 3);
    const conservativeBid = Math.max(0, estimatedTricks - 1);
    return this.addRandomness(conservativeBid, 0.15);
  }

  selectCard(hand: Card[], currentTrick: Trick, trumpSuit: Suit): Card {
    const validCards = this.getValidCards(hand, currentTrick);
    if (this.shouldTryToWin(currentTrick)) {
      return this.playHighestValidCard(validCards, currentTrick, trumpSuit);
    } else {
      return this.playLowestValidCard(validCards);
    }
  }
}
```

#### Medium AI (Intermediate Challenge)
**Bidding Strategy:**
- Analyzes hand strength more comprehensively
- Considers position relative to dealer
- Factors in trump suit distribution
- 10% randomness factor
- Basic opponent modeling (remembers previous bids)

**Card Playing Strategy:**
- Tracks which cards have been played
- Basic trump management (saves trump for important tricks)
- Considers trick count vs bid requirements
- Attempts to set opponents when profitable
- 10% random play for unpredictability

```typescript
class MediumAI extends AIPlayer {
  private cardMemory: Card[] = [];
  private opponentBids: Record<string, number> = {};

  calculateBid(hand: Card[], trumpSuit: Suit, position: number): number {
    const handStrength = this.analyzeHandStrength(hand, trumpSuit);
    const positionAdjustment = this.getPositionAdjustment(position);
    const opponentFactor = this.estimateOpponentStrength();
    
    const estimatedTricks = handStrength + positionAdjustment - opponentFactor;
    return this.addRandomness(Math.max(0, estimatedTricks), 0.1);
  }

  selectCard(hand: Card[], currentTrick: Trick, trumpSuit: Suit): Card {
    const gameState = this.analyzeGameState();
    const validCards = this.getValidCards(hand, currentTrick);
    
    if (this.shouldConserveTrump(gameState)) {
      return this.selectNonTrumpCard(validCards, currentTrick);
    }
    
    if (this.canSetOpponent(currentTrick, gameState)) {
      return this.selectSettingCard(validCards, currentTrick);
    }
    
    return this.selectOptimalCard(validCards, currentTrick, trumpSuit, gameState);
  }
}
```

#### Hard AI (Expert Level)
**Bidding Strategy:**
- Advanced statistical analysis of hand
- Position-aware bidding with complex adjustments
- Opponent modeling and bid history analysis
- Trump suit strength evaluation
- 5% randomness factor only
- Considers section number and game type

**Card Playing Strategy:**
- Complete card counting and memory
- Advanced trump management and timing
- Opponent hand reconstruction
- Strategic setting and defensive play
- End-game optimization
- Minimal randomness (3% for unpredictability)

```typescript
class HardAI extends AIPlayer {
  private gameHistory: GameState[] = [];
  private opponentProfiles: Record<string, PlayerProfile> = {};
  private cardTracker: CardTracker = new CardTracker();

  calculateBid(hand: Card[], trumpSuit: Suit, gameContext: GameContext): number {
    const handAnalysis = this.performDeepHandAnalysis(hand, trumpSuit);
    const positionStrategy = this.calculatePositionalAdvantage(gameContext);
    const opponentModeling = this.modelOpponentHands(gameContext);
    const metaGameFactors = this.analyzeMetaGame(gameContext);
    
    const weightedEstimate = (
      handAnalysis.strength * 0.4 +
      positionStrategy.adjustment * 0.2 +
      opponentModeling.expectedCompetition * 0.3 +
      metaGameFactors.sectionBias * 0.1
    );
    
    return this.addMinimalRandomness(Math.max(0, weightedEstimate), 0.05);
  }

  selectCard(hand: Card[], currentTrick: Trick, gameState: GameState): Card {
    const analysis = this.performCompleteGameAnalysis(gameState);
    const validCards = this.getValidCards(hand, currentTrick);
    
    // Multi-factor decision engine
    const decisions = [
      this.evaluateImmediateTrickValue(validCards, currentTrick, analysis),
      this.evaluateTrumpConservation(validCards, analysis),
      this.evaluateOpponentSetting(validCards, currentTrick, analysis),
      this.evaluateEndgamePositioning(validCards, analysis),
      this.evaluateRiskManagement(validCards, analysis)
    ];
    
    return this.selectOptimalCardFromAnalysis(decisions, validCards);
  }
}
```

### Core AI Components

#### Hand Analysis Engine
```typescript
interface HandAnalysis {
  highCardPoints: number;
  trumpStrength: number;
  suitDistribution: Record<Suit, number>;
  defensiveCapability: number;
  trickPotential: { min: number, max: number, expected: number };
}

class HandAnalyzer {
  analyzeHand(hand: Card[], trumpSuit: Suit, position: number): HandAnalysis {
    return {
      highCardPoints: this.calculateHighCardPoints(hand),
      trumpStrength: this.evaluateTrumpHolding(hand, trumpSuit),
      suitDistribution: this.analyzeSuitDistribution(hand),
      defensiveCapability: this.assessDefensiveCards(hand, trumpSuit),
      trickPotential: this.estimateTrickRange(hand, trumpSuit, position)
    };
  }
}
```

#### Card Memory System
```typescript
class CardTracker {
  private playedCards: Set<string> = new Set();
  private playerHands: Record<string, Set<string>> = {};
  
  recordCardPlay(playerId: string, card: Card): void {
    this.playedCards.add(card.toString());
    this.playerHands[playerId]?.delete(card.toString());
  }
  
  getRemainingCards(suit?: Suit): Card[] {
    // Returns cards not yet played
  }
  
  estimateOpponentHolding(playerId: string, suit: Suit): number {
    // Estimates how many cards of suit opponent likely has
  }
}
```

#### Decision Engine
```typescript
interface PlayDecision {
  card: Card;
  confidence: number;
  reasoning: string;
  expectedOutcome: string;
}

class AIDecisionEngine {
  evaluatePlay(
    card: Card, 
    gameState: GameState, 
    objectives: PlayObjective[]
  ): PlayDecision {
    const outcomes = this.simulateCardPlay(card, gameState);
    const score = this.scoreOutcomes(outcomes, objectives);
    
    return {
      card,
      confidence: score.confidence,
      reasoning: score.reasoning,
      expectedOutcome: score.mostLikelyOutcome
    };
  }
}
```

### AI Integration Features

#### Session Management
- Admin can add AI players during lobby phase
- AI players have distinctive names (e.g., "AI-Alice (Medium)")
- AI difficulty can be changed before game starts
- Up to 4 AI players maximum per session

#### Real-time Behavior
- AI players make decisions with realistic timing delays
- Easy: 2-4 seconds, Medium: 3-5 seconds, Hard: 4-6 seconds
- Simulated "thinking" indicators for human players
- AI players respond to game events appropriately

#### Learning & Adaptation
- AI tracks opponent patterns over multiple sections
- Adjusts strategy based on opponent behavior
- Remembers successful tactics from previous games
- Adapts bidding strategy to scoring system (Classic vs Modern)

### Technical Implementation

#### AI Player Data Model
```typescript
interface AIPlayer extends Player {
  aiDifficulty: 'easy' | 'medium' | 'hard';
  isAI: true;
  personality: AIPersonality;
  memory: AIMemory;
  decisionEngine: AIDecisionEngine;
}

interface AIPersonality {
  aggressiveness: number; // 0-1 scale
  riskTolerance: number;  // 0-1 scale  
  bluffPropensity: number; // 0-1 scale
  adaptability: number;   // 0-1 scale
}
```

#### Performance Optimization
- AI calculations run in Web Workers to avoid UI blocking
- Cached decision trees for common scenarios
- Incremental game state updates rather than full recalculation
- Tunable thinking time for different difficulty levels

#### Testing & Balancing
- Automated AI vs AI tournaments for balance testing
- Human vs AI win rate tracking
- Difficulty curve validation through statistical analysis
- A/B testing of different AI strategies

## 12. Future Enhancements

### Potential Features
- **AI Players**: Add computer opponents for practice
- **Tournament System**: Multi-session tournaments with brackets
- **Game Variants**: Support for different house rules
- **Statistics Dashboard**: Player performance tracking
- **Social Features**: Friend lists, messaging, game history
- **Custom Themes**: Different card designs and table themes
- **Sound Effects**: Audio feedback for actions
- **Replay System**: Review completed games

### Scalability Considerations
- Database optimization for concurrent games
- Horizontal scaling with load balancers
- CDN for static assets
- Caching strategies for frequent data
- Rate limiting for API endpoints

This plan provides a comprehensive roadmap for developing a robust, scalable Jøssing card game application that delivers an excellent multiplayer experience across all devices.
