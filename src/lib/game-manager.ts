import {
  type Card,
  GamePhase,
  type GameSession,
  type GameType,
  type Player,
  type ScoringSystem,
  SectionPhase,
  type SectionState,
  type Bid,
  type Trick,
  type TrickCard,
  type TrickWithCards
} from '@/types/game';
import { createDeck, dealCards, getTrickWinner, canPlayCard } from './game-utils';
import { RandomAI, getAIPlayerName } from './ai-player';

// In-memory storage (in production, this would be a database)
const sessions = new Map<string, GameSession>();
const players = new Map<string, Player>();
const sectionStates = new Map<string, SectionState>();
const playerHands = new Map<string, Card[]>();
const tricks = new Map<string, Trick>();
const trickCards = new Map<string, TrickCard[]>();

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
  static createSession(
    adminName: string,
    gameType: GameType,
    scoringSystem: ScoringSystem,
    maxPlayers: number
  ): { sessionId: string; playerId: string } {
    const sessionId = GameManager.generateSessionId();
    const playerId = GameManager.generatePlayerId();

    // Create session
    const session: GameSession = {
      id: sessionId,
      adminPlayerId: playerId,
      gameType,
      scoringSystem,
      maxPlayers,
      currentSection: 1,
      gamePhase: GamePhase.WAITING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create admin player
    const adminPlayer: Player = {
      id: playerId,
      sessionId,
      name: adminName,
      isAdmin: true,
      position: 1,
      totalScore: 0,
      isConnected: true,
      joinedAt: new Date()
    };

    sessions.set(sessionId, session);
    players.set(playerId, adminPlayer);

    return { sessionId, playerId };
  }

  // Join an existing session
  static joinSession(
    sessionId: string,
    playerName: string
  ): { playerId: string; position: number } | null {
    const session = sessions.get(sessionId);
    if (!session || session.gamePhase !== GamePhase.WAITING) {
      return null;
    }

    // Count current players
    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    if (sessionPlayers.length >= session.maxPlayers) {
      return null;
    }

    const playerId = GameManager.generatePlayerId();
    const position = sessionPlayers.length + 1;

    const player: Player = {
      id: playerId,
      sessionId,
      name: playerName,
      isAdmin: false,
      position,
      totalScore: 0,
      isConnected: true,
      joinedAt: new Date()
    };

    players.set(playerId, player);

    return { playerId, position };
  }

  // Get all players in a session
  static getSessionPlayers(sessionId: string): Player[] {
    const sessionPlayers: Player[] = [];
    for (const player of players.values()) {
      if (player.sessionId === sessionId) {
        sessionPlayers.push(player);
      }
    }
    return sessionPlayers.sort((a, b) => a.position - b.position);
  }

  // Start the game
  static startGame(sessionId: string, adminPlayerId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session || session.adminPlayerId !== adminPlayerId || session.gamePhase !== GamePhase.WAITING) {
      return false;
    }

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    if (sessionPlayers.length < 3) {
      return false;
    }

    // Update session to start first section
    session.gamePhase = GamePhase.PLAYING;
    session.updatedAt = new Date();
    sessions.set(sessionId, session);

    // Start first section
    GameManager.startSection(sessionId, 1);

    return true;
  }

  // Start a new section (round)
  static startSection(sessionId: string, sectionNumber: number): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    const numPlayers = sessionPlayers.length;

    // Deal cards
    const deck = createDeck();
    const { hands, trumpCard } = dealCards(deck, numPlayers, sectionNumber);

    // Create section state
    const sectionStateId = `${sessionId}-${sectionNumber}`;
    const dealerPosition = ((sectionNumber - 1) % numPlayers) + 1;
    const firstBidderPosition = dealerPosition === numPlayers ? 1 : dealerPosition + 1;

    const sectionState: SectionState = {
      id: sectionStateId,
      sessionId,
      sectionNumber,
      dealerPosition,
      currentBidderPosition: firstBidderPosition,
      trumpSuit: trumpCard.suit,
      trumpCardRank: trumpCard.rank,
      phase: SectionPhase.BIDDING,
      bids: [],
      createdAt: new Date()
    };

    sectionStates.set(sectionStateId, sectionState);

    // Store player hands
    sessionPlayers.forEach((player, index) => {
      playerHands.set(`${player.id}-${sectionNumber}`, hands[index]);
    });

    return true;
  }

  // Get session by ID
  static getSession(sessionId: string): GameSession | null {
    return sessions.get(sessionId) || null;
  }

  // Get player by ID
  static getPlayer(playerId: string): Player | null {
    return players.get(playerId) || null;
  }

  // Get current section state
  static getCurrentSection(sessionId: string): SectionState | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const sectionStateId = `${sessionId}-${session.currentSection}`;
    return sectionStates.get(sectionStateId) || null;
  }

  // Get player's hand for current section
  static getPlayerHand(playerId: string, sectionNumber: number): Card[] {
    return playerHands.get(`${playerId}-${sectionNumber}`) || [];
  }

  // Place a bid
  static placeBid(playerId: string, bid: number): boolean {
    const player = players.get(playerId);
    if (!player) return false;

    const session = sessions.get(player.sessionId);
    if (!session) return false;

    const sectionState = GameManager.getCurrentSection(player.sessionId);
    if (!sectionState || sectionState.phase !== SectionPhase.BIDDING) return false;

    // Check if it's this player's turn to bid
    if (sectionState.currentBidderPosition !== player.position) return false;

    // Check if player has already bid
    if (sectionState.bids.some(b => b.playerId === playerId)) return false;

    // Validate bid range (0 to number of cards in section)
    if (bid < 0 || bid > session.currentSection) return false;

    // Add the bid
    const newBid: Bid = {
      playerId,
      playerName: player.name,
      bid,
      timestamp: new Date()
    };

    sectionState.bids.push(newBid);

    // Move to next bidder
    const sessionPlayers = GameManager.getSessionPlayers(player.sessionId);
    const numPlayers = sessionPlayers.length;
    
    if (sectionState.bids.length < numPlayers) {
      // More players need to bid
      sectionState.currentBidderPosition = sectionState.currentBidderPosition === numPlayers 
        ? 1 
        : sectionState.currentBidderPosition + 1;
    } else {
      // All players have bid, move to playing phase
      sectionState.phase = SectionPhase.PLAYING;
      sectionState.currentBidderPosition = undefined;
      sectionState.leadPlayerPosition = sectionState.dealerPosition === numPlayers ? 1 : sectionState.dealerPosition + 1;
    }

    // Update the section state
    sectionStates.set(sectionState.id, sectionState);

    console.log(`Player ${player.name} bids ${bid}`);
    
    // If all bids are placed, log the summary
    if (sectionState.bids.length === numPlayers) {
      const bidSummary = sectionState.bids.map(b => `${b.playerName}: ${b.bid}`).join(', ');
      console.log(`All bids placed: ${bidSummary}. Starting play phase.`);
    }

    return true;
  }

  // Get current bidder for a section
  static getCurrentBidder(sessionId: string): Player | null {
    const sectionState = GameManager.getCurrentSection(sessionId);
    if (!sectionState || sectionState.phase !== SectionPhase.BIDDING || !sectionState.currentBidderPosition) {
      return null;
    }

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    return sessionPlayers.find(p => p.position === sectionState.currentBidderPosition) || null;
  }

  // Get all bids for current section
  static getSectionBids(sessionId: string): Bid[] {
    const sectionState = GameManager.getCurrentSection(sessionId);
    return sectionState?.bids || [];
  }

  // Get a player's bid for current section
  static getPlayerBid(sessionId: string, playerId: string): number | null {
    const bids = GameManager.getSectionBids(sessionId);
    const playerBid = bids.find(b => b.playerId === playerId);
    return playerBid?.bid ?? null;
  }

  // Check if all players have bid
  static areAllBidsPlaced(sessionId: string): boolean {
    const sectionState = GameManager.getCurrentSection(sessionId);
    if (!sectionState) return false;

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    return sectionState.bids.length === sessionPlayers.length;
  }

  // Play a card
  static playCard(playerId: string, card: Card): boolean {
    const player = players.get(playerId);
    if (!player) return false;

    const session = sessions.get(player.sessionId);
    if (!session) return false;

    const sectionState = GameManager.getCurrentSection(player.sessionId);
    if (!sectionState || sectionState.phase !== SectionPhase.PLAYING) return false;

    // Get player's hand and validate card
    const handKey = `${playerId}-${session.currentSection}`;
    const hand = playerHands.get(handKey) || [];
    
    // Check if player has the card
    if (!hand.some(c => c.suit === card.suit && c.rank === card.rank)) {
      return false;
    }

    // Get current trick or create new one
    let currentTrick = GameManager.getCurrentTrick(player.sessionId);
    if (!currentTrick) {
      currentTrick = GameManager.createNewTrick(player.sessionId);
      if (!currentTrick) return false;
    }

    // Validate the card play against game rules
    if (!GameManager.validateCardPlay(playerId, card, currentTrick, hand)) {
      return false;
    }

    // Remove card from player's hand
    const newHand = hand.filter(c => !(c.suit === card.suit && c.rank === card.rank));
    playerHands.set(handKey, newHand);

    // Add card to trick
    const sessionPlayers = GameManager.getSessionPlayers(player.sessionId);
    const playerPosition = sessionPlayers.findIndex(p => p.id === playerId) + 1;

    const trickCard: TrickCard = {
      id: `${currentTrick.id}-${playerPosition}`,
      trickId: currentTrick.id,
      playerPosition,
      cardSuit: card.suit,
      cardRank: card.rank,
      playedAt: new Date()
    };

    // Store the trick card
    const existingCards = trickCards.get(currentTrick.id) || [];
    existingCards.push(trickCard);
    trickCards.set(currentTrick.id, existingCards);

    // Set leading suit if this is the first card
    if (existingCards.length === 1) {
      currentTrick.leadingSuit = card.suit;
      tricks.set(currentTrick.id, currentTrick);
    }

    // Check if trick is complete
    if (existingCards.length === sessionPlayers.length) {
      GameManager.completeTrick(currentTrick, sessionPlayers);
      
      // Check if section is complete
      if (GameManager.isSectionComplete(player.sessionId)) {
        GameManager.completeSection(player.sessionId);
      }
    }

    return true;
  }

  // Get current trick
  static getCurrentTrick(sessionId: string): Trick | null {
    const sectionState = GameManager.getCurrentSection(sessionId);
    if (!sectionState) return null;

    // Find incomplete trick
    for (const [, trick] of tricks.entries()) {
      if (trick.sectionStateId === sectionState.id && !trick.completedAt) {
        return trick;
      }
    }

    return null;
  }

  // Create a new trick
  static createNewTrick(sessionId: string): Trick | null {
    const sectionState = GameManager.getCurrentSection(sessionId);
    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    if (!sectionState || sessionPlayers.length === 0) return null;

    // Calculate trick number
    const existingTricks = Array.from(tricks.values())
      .filter(t => t.sectionStateId === sectionState.id);
    const trickNumber = existingTricks.length + 1;

    // Determine lead player position
    let leadPlayerPosition: number;
    if (trickNumber === 1) {
      // First trick: player after dealer leads (or dealer if they won bid determination)
      leadPlayerPosition = GameManager.getFirstTrickLeader(sessionId);
    } else {
      // Subsequent tricks: winner of previous trick leads
      const lastTrick = existingTricks
        .filter(t => t.completedAt)
        .sort((a, b) => b.trickNumber - a.trickNumber)[0];
      leadPlayerPosition = lastTrick?.winnerPosition || 1;
    }

    const trick: Trick = {
      id: `${sectionState.id}-trick-${trickNumber}`,
      sectionStateId: sectionState.id,
      trickNumber,
      leadPlayerPosition,
      leadingSuit: undefined,
      winnerPosition: undefined,
      completedAt: undefined
    };

    tricks.set(trick.id, trick);
    return trick;
  }

  // Validate card play according to game rules
  static validateCardPlay(playerId: string, card: Card, currentTrick: Trick, hand: Card[]): boolean {
    const sessionPlayers = GameManager.getSessionPlayers(playerId);
    const playerPosition = sessionPlayers.findIndex(p => p.id === playerId) + 1;
    
    // Check if it's the player's turn
    const cardsPlayed = trickCards.get(currentTrick.id) || [];
    const expectedNextPosition = GameManager.getNextPlayerPosition(currentTrick, cardsPlayed, sessionPlayers.length);
    
    if (playerPosition !== expectedNextPosition) {
      return false; // Not the player's turn
    }

    // Use the existing card validation from game-utils
    return canPlayCard(card, hand, currentTrick.leadingSuit);
  }

  // Get the next player position in turn order
  static getNextPlayerPosition(trick: Trick, cardsPlayed: TrickCard[], numPlayers: number): number {
    const cardsInTrick = cardsPlayed.length;
    if (cardsInTrick === 0) {
      return trick.leadPlayerPosition;
    }
    
    const nextPosition = ((trick.leadPlayerPosition - 1 + cardsInTrick) % numPlayers) + 1;
    return nextPosition;
  }

  // Complete a trick and determine winner
  static completeTrick(trick: Trick, sessionPlayers: Player[]): void {
    const cardsPlayed = trickCards.get(trick.id) || [];
    const sectionState = GameManager.getCurrentSection(sessionPlayers[0].sessionId);
    if (!sectionState || cardsPlayed.length !== sessionPlayers.length) return;

    // Convert trick cards to format expected by getTrickWinner
    const cardsRecord: Record<number, Card> = {};
    for (const trickCard of cardsPlayed) {
      cardsRecord[trickCard.playerPosition] = {
        suit: trickCard.cardSuit,
        rank: trickCard.cardRank,
        value: GameManager.getCardValue(trickCard.cardRank)
      };
    }

    // Determine winner
    const winnerPosition = getTrickWinner(
      cardsRecord,
      trick.leadPlayerPosition,
      sectionState.trumpSuit,
      trick.leadingSuit || sectionState.trumpSuit
    );

    // Update trick
    trick.winnerPosition = winnerPosition;
    trick.completedAt = new Date();
    tricks.set(trick.id, trick);

    // Update player tricks won count (calculated dynamically)
    GameManager.incrementPlayerTricksWon();
  }

  // Get card value for comparison
  static getCardValue(rank: string): number {
    const values: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank] || 0;
  }

  // Increment player's tricks won for current section
  static incrementPlayerTricksWon(): void {
    // This would typically update the database
    // For now, we'll track it in memory as part of the game state
    // The tricks won count is calculated dynamically in getPlayerTricksWon
  }

  // Check if section is complete (all tricks played)
  static isSectionComplete(sessionId: string): boolean {
    const sectionState = GameManager.getCurrentSection(sessionId);
    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    if (!sectionState || sessionPlayers.length === 0) return false;

    const completedTricks = Array.from(tricks.values())
      .filter(t => t.sectionStateId === sectionState.id && t.completedAt);

    return completedTricks.length === sectionState.sectionNumber;
  }

  // Complete section and calculate scores
  static completeSection(sessionId: string): void {
    const sectionState = GameManager.getCurrentSection(sessionId);
    if (!sectionState) return;

    // Calculate section scores
    const sectionScores = GameManager.calculateSectionScores(sessionId);
    
    // Update player total scores
    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    for (const player of sessionPlayers) {
      const sectionScore = sectionScores[player.id] || 0;
      player.totalScore += sectionScore;
      players.set(player.id, player);
    }

    // Mark section as complete
    sectionState.phase = SectionPhase.COMPLETED;
    sectionStates.set(sectionState.id, sectionState);

    // Check if game is complete or start next section
    const session = sessions.get(sessionId);
    if (session) {
      const maxSections = session.gameType === 'up' ? 10 : 20;
      if (session.currentSection >= maxSections) {
        // Game complete
        session.gamePhase = GamePhase.FINISHED;
      } else {
        // Start next section
        session.currentSection += 1;
        GameManager.startSection(sessionId, session.currentSection);
      }
      sessions.set(sessionId, session);
    }
  }

  // Calculate section scores based on bids and tricks won
  static calculateSectionScores(sessionId: string): Record<string, number> {
    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    const sectionBids = GameManager.getSectionBids(sessionId);
    const scores: Record<string, number> = {};

    for (const player of sessionPlayers) {
      const playerBid = sectionBids.find(b => b.playerId === player.id)?.bid || 0;
      const tricksWon = GameManager.getPlayerTricksWon(player.id, sessionId);
      
      // Score calculation: exact bid gives points, otherwise 0
      if (tricksWon === playerBid) {
        scores[player.id] = 10 + playerBid; // Base 10 points + bid amount
      } else {
        scores[player.id] = 0;
      }
    }

    return scores;
  }

  // Get player's tricks won in current section
  static getPlayerTricksWon(playerId: string, sessionId: string): number {
    const sectionState = GameManager.getCurrentSection(sessionId);
    if (!sectionState) return 0;

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    const playerPosition = sessionPlayers.findIndex(p => p.id === playerId) + 1;

    let tricksWon = 0;
    for (const trick of tricks.values()) {
      if (trick.sectionStateId === sectionState.id && trick.winnerPosition === playerPosition) {
        tricksWon++;
      }
    }

    return tricksWon;
  }

  // Get first trick leader (highest bidder closest to dealer)
  static getFirstTrickLeader(sessionId: string): number {
    const sectionBids = GameManager.getSectionBids(sessionId);
    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    const sectionState = GameManager.getCurrentSection(sessionId);
    
    if (!sectionState || sectionBids.length === 0) {
      // Default to player after dealer
      return sectionState?.dealerPosition === sessionPlayers.length ? 1 : (sectionState?.dealerPosition || 0) + 1;
    }

    // Find highest bid
    const maxBid = Math.max(...sectionBids.map(b => b.bid));
    const highestBidders = sectionBids.filter(b => b.bid === maxBid);

    if (highestBidders.length === 1) {
      const winnerPlayer = sessionPlayers.find(p => p.id === highestBidders[0].playerId);
      return winnerPlayer ? sessionPlayers.indexOf(winnerPlayer) + 1 : 1;
    }

    // Multiple highest bidders: choose closest to dealer in clockwise order
    const dealerPosition = sectionState.dealerPosition;
    let closestDistance = Infinity;
    let winner = highestBidders[0];

    for (const bidder of highestBidders) {
      const bidderPlayer = sessionPlayers.find(p => p.id === bidder.playerId);
      if (bidderPlayer) {
        const bidderPosition = sessionPlayers.indexOf(bidderPlayer) + 1;
        const distance = bidderPosition > dealerPosition 
          ? bidderPosition - dealerPosition 
          : (sessionPlayers.length - dealerPosition) + bidderPosition;
        
        if (distance < closestDistance) {
          closestDistance = distance;
          winner = bidder;
        }
      }
    }

    const winnerPlayer = sessionPlayers.find(p => p.id === winner.playerId);
    return winnerPlayer ? sessionPlayers.indexOf(winnerPlayer) + 1 : 1;
  }

  // Add AI players to fill empty slots
  static addAIPlayers(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session || session.gamePhase !== GamePhase.WAITING) {
      return false;
    }

    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    const spotsToFill = session.maxPlayers - sessionPlayers.length;

    for (let i = 0; i < spotsToFill; i++) {
      const playerId = GameManager.generatePlayerId();
      const position = sessionPlayers.length + i + 1;
      const aiName = getAIPlayerName(i);

      const aiPlayer: Player = {
        id: playerId,
        sessionId,
        name: aiName,
        isAdmin: false,
        position,
        totalScore: 0,
        isConnected: true,
        joinedAt: new Date(),
        isAI: true // Add this flag to identify AI players
      };

      players.set(playerId, aiPlayer);
    }

    return true;
  }

  // Make AI players take their turns
  static processAITurn(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const sectionState = GameManager.getCurrentSection(sessionId);
    if (!sectionState) return false;

    // Process AI bid during bidding phase
    if (sectionState.phase === SectionPhase.BIDDING) {
      const currentBidder = GameManager.getCurrentBidder(sessionId);
      if (currentBidder?.isAI) {
        const hand = GameManager.getPlayerHand(currentBidder.id, session.currentSection);
        const ai = new RandomAI(currentBidder.name);
        const bid = ai.makeBid(hand, session.currentSection, sectionState.trumpSuit);
        
        // Place the bid through the proper system
        GameManager.placeBid(currentBidder.id, bid);
        return true;
      }
      return false;
    }

    // Process AI card plays during playing phase
    if (sectionState.phase === SectionPhase.PLAYING) {
      const sessionPlayers = GameManager.getSessionPlayers(sessionId);
      const currentTrick = GameManager.getCurrentTrick(sessionId);
      
      if (!currentTrick) {
        // No trick exists, create one if it's time to start playing
        const newTrick = GameManager.createNewTrick(sessionId);
        if (!newTrick) return false;
      }
      
      // Check whose turn it is
      const activeTrick = GameManager.getCurrentTrick(sessionId);
      if (!activeTrick) return false;
      
      const cardsPlayed = trickCards.get(activeTrick.id) || [];
      const expectedPosition = GameManager.getNextPlayerPosition(activeTrick, cardsPlayed, sessionPlayers.length);
      const currentPlayer = sessionPlayers[expectedPosition - 1];
      
      if (currentPlayer?.isAI) {
        const hand = GameManager.getPlayerHand(currentPlayer.id, session.currentSection);
        const ai = new RandomAI(currentPlayer.name);
        
        // Convert TrickCard[] to Card[] for AI
        const trickCardsForAI: Card[] = cardsPlayed.map(tc => ({
          suit: tc.cardSuit,
          rank: tc.cardRank,
          value: GameManager.getCardValue(tc.cardRank)
        }));
        
        const cardToPlay = ai.playCard(hand, trickCardsForAI, sectionState.trumpSuit, activeTrick.leadingSuit);
        if (cardToPlay) {
          GameManager.playCard(currentPlayer.id, cardToPlay);
          return true;
        }
      }
      return false;
    }

    return false;
  }

  // Remove player from session
  static removePlayer(playerId: string): boolean {
    const player = players.get(playerId);
    if (!player) return false;

    players.delete(playerId);

    // If this was the admin and there are other players, make someone else admin
    if (player.isAdmin) {
      const sessionPlayers = GameManager.getSessionPlayers(player.sessionId);
      if (sessionPlayers.length > 0) {
        const newAdmin = sessionPlayers[0];
        newAdmin.isAdmin = true;
        players.set(newAdmin.id, newAdmin);

        // Update session admin
        const session = sessions.get(player.sessionId);
        if (session) {
          session.adminPlayerId = newAdmin.id;
          sessions.set(player.sessionId, session);
        }
      }
    }

    return true;
  }

  // Get game state for a player
  static getGameState(playerId: string) {
    const player = players.get(playerId);
    if (!player) return null;

    const session = sessions.get(player.sessionId);
    if (!session) return null;

    const sessionPlayers = GameManager.getSessionPlayers(player.sessionId);
    const currentSection = GameManager.getCurrentSection(player.sessionId);
    const playerHand = currentSection ? GameManager.getPlayerHand(playerId, session.currentSection) : [];
    const currentBidder = currentSection ? GameManager.getCurrentBidder(player.sessionId) : null;
    const sectionBids = GameManager.getSectionBids(player.sessionId);
    const playerBid = GameManager.getPlayerBid(player.sessionId, playerId);
    const currentTrick = currentSection ? GameManager.getCurrentTrickWithCards(player.sessionId) : null;

    // Determine if it's player's turn based on phase
    let isPlayerTurn = false;
    if (currentSection) {
      if (currentSection.phase === SectionPhase.BIDDING) {
        isPlayerTurn = currentBidder?.id === playerId;
      } else if (currentSection.phase === SectionPhase.PLAYING && currentTrick) {
        const cardsPlayed = trickCards.get(currentTrick.id) || [];
        const expectedPosition = GameManager.getNextPlayerPosition(currentTrick, cardsPlayed, sessionPlayers.length);
        const playerPosition = sessionPlayers.findIndex(p => p.id === playerId) + 1;
        isPlayerTurn = playerPosition === expectedPosition;
      }
    }

    // Calculate section scores
    const sectionScores: Record<string, number> = {};
    if (currentSection && currentSection.phase === SectionPhase.COMPLETED) {
      Object.assign(sectionScores, GameManager.calculateSectionScores(player.sessionId));
    }

    return {
      session,
      players: sessionPlayers,
      currentSection,
      playerHand,
      isPlayerTurn,
      currentBidder,
      sectionBids,
      playerBid,
      allBidsPlaced: GameManager.areAllBidsPlaced(player.sessionId),
      currentTrick,
      sectionScores,
      totalScores: sessionPlayers.reduce((acc, p) => {
        acc[p.id] = p.totalScore;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Get current trick with played cards for game state
  static getCurrentTrickWithCards(sessionId: string): TrickWithCards | null {
    const trick = GameManager.getCurrentTrick(sessionId);
    if (!trick) return null;

    const cardsPlayed = trickCards.get(trick.id) || [];
    return {
      ...trick,
      cardsPlayed
    };
  }

  // Get final game statistics
  static getFinalGameStats(sessionId: string) {
    const session = sessions.get(sessionId);
    const sessionPlayers = GameManager.getSessionPlayers(sessionId);
    
    if (!session || !sessionPlayers.length) return null;

    // Calculate final rankings
    const finalRankings = sessionPlayers
      .map(player => ({ 
        player, 
        totalScore: player.totalScore 
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    const winner = finalRankings[0];

    return {
      session,
      players: sessionPlayers,
      finalRankings,
      winner: winner.player,
      gameComplete: session.gamePhase === GamePhase.FINISHED,
      totalSections: session.gameType === 'up' ? 10 : 20
    };
  }
}
