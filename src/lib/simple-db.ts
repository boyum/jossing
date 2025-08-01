import { v4 as uuidv4 } from "uuid";
import type { GameType, Rank, ScoringSystem, Suit, Card } from "@/types/game";
import { db } from "./db";
import {
	allRanks,
	allSuits,
	generateSessionId,
	getTrickWinner,
} from "./game-utils";
import type * as PrismaSchema from ".prisma/client";

// Simple database functions to get started
export async function createGameSession(
	adminPlayerName: string,
	gameType: GameType = "up_and_down",
	scoringSystem: ScoringSystem = "classic",
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
			gamePhase: "waiting",
		} satisfies Omit<PrismaSchema.GameSession, "createdAt" | "updatedAt">,
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
		} satisfies Omit<PrismaSchema.Player, "joinedAt">,
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

	if (!session || session.gamePhase !== "waiting") {
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
	const players = await db.player.findMany({
		where: { sessionId: player.sessionId },
		orderBy: { position: "asc" },
	});

	// Get current section state if game is playing
	let currentSection = null;
	let playerHand = [];
	let currentTrick = null;

	const isInPlayingPhase =
		session.gamePhase === "playing" && session.currentSection > 0;
	if (isInPlayingPhase) {
		const sectionState = await db.sectionState.findFirst({
			where: {
				sessionId: player.sessionId,
				sectionNumber: session.currentSection,
			},
		});

		if (sectionState) {
			// Get bids for this section
			const playerHands = await db.playerHand.findMany({
				where: { sectionStateId: sectionState.id },
				include: { player: true },
			});

			// Check if all players have bid
			const allPlayers = await db.player.findMany({
				where: { sessionId: player.sessionId },
			});

			const handsWithBids = playerHands.filter((hand) => hand.bid !== null);
			const allPlayersHaveBid = handsWithBids.length === allPlayers.length;

			// Only show actual bid amounts if all players have bid, otherwise just show who has bid
			const bids = playerHands
				.filter((hand) => hand.bid !== null)
				.map((hand) => ({
					playerId: hand.playerId,
					playerName: hand.player.name,
					bid: allPlayersHaveBid ? (hand.bid as number) : -1, // Use -1 to indicate bid placed but hidden
					timestamp: new Date(), // We don't have timestamps in the schema, so use current time
				}));

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
				bids,
			};

			// Get current trick if in playing phase
			if (sectionState.phase === "playing") {
				console.debug(
					"[getGameState] In playing phase, looking for active trick",
				);
				const trick = await db.trick.findFirst({
					where: {
						sectionStateId: sectionState.id,
						completedAt: null, // Get the current active trick
					},
					include: {
						trickCards: {
							include: {
								player: true,
							},
						},
					},
					orderBy: {
						trickNumber: "desc",
					},
				});

				console.debug(
					"[getGameState] Found trick:",
					trick
						? {
								id: trick.id,
								trickNumber: trick.trickNumber,
								cardsPlayed: trick.trickCards.length,
							}
						: null,
				);

				if (trick) {
					currentTrick = {
						id: trick.id,
						sectionStateId: trick.sectionStateId,
						trickNumber: trick.trickNumber,
						leadPlayerPosition: trick.leadPlayerPosition,
						leadingSuit: trick.leadingSuit?.toLowerCase(),
						winnerPosition: trick.winnerPosition,
						completedAt: trick.completedAt,
						cardsPlayed: trick.trickCards.map((tc) => ({
							id: tc.id,
							trickId: tc.trickId,
							playerId: tc.playerId,
							playerName: tc.player.name,
							playerPosition: tc.playerPosition,
							cardSuit: tc.cardSuit.toLowerCase(),
							cardRank: tc.cardRank,
							playedAt: tc.playedAt,
						})),
					};
				}

				// Process AI turns if we're in playing phase and there's an active trick
				if (trick) {
					console.debug(
						"[getGameState] Processing AI turns for session:",
						player.sessionId,
					);
					try {
						await processAITurns(player.sessionId);
					} catch (error) {
						console.error("Error processing AI turns in getGameState:", error);
					}
				}
			} else {
				console.debug("[getGameState] Section phase:", sectionState.phase);
			}

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
			isAI: p.id.startsWith("ai-"),
			aiDifficulty: p.id.startsWith("ai-") ? p.id.split("-")[1] : undefined,
		})),
		currentSection,
		playerHand,
		currentTrick,
		sectionBids: currentSection?.bids || [],
		allBidsPlaced: currentSection
			? currentSection.bids.length >= players.length &&
				currentSection.bids.every((bid) => bid.bid >= 0)
			: false,
		isPlayerTurn: (() => {
			// Calculate if it's this player's turn
			if (currentTrick && currentSection?.phase === "playing") {
				const nextPlayerPosition = getNextPlayerToPlay(
					{
						leadPlayerPosition: currentTrick.leadPlayerPosition,
						trickCards: currentTrick.cardsPlayed.map((cp) => ({
							playerPosition: cp.playerPosition,
						})),
					},
					players,
				);
				return nextPlayerPosition === player.position;
			}
			return false;
		})(),
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
	const deck = [];

	for (const suit of allSuits) {
		for (const rank of allRanks) {
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
			trumpSuit: trumpCard.suit,
			trumpCardRank: mapCardRankToDb(trumpCard.rank),
			phase: "dealing",
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
		data: { phase: "bidding" },
	});
}

export async function addAIPlayer(
	sessionId: string,
	difficulty: string = "medium",
) {
	// Check if session exists and is in lobby
	const session = await db.gameSession.findUnique({
		where: { id: sessionId },
	});

	const sessionDoesNotExist = !session;
	const sessionIsNotJoinable =
		sessionDoesNotExist || session.gamePhase !== "waiting";

	if (sessionIsNotJoinable) {
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
		easy: ["AI Bot", "Simple Sam", "Easy Eddie"],
		medium: ["Smart AI", "Clever Clara", "Medium Mike"],
		hard: ["Expert AI", "Genius Gina", "Hard Harry"],
	};

	const names = aiNames[difficulty as keyof typeof aiNames] || aiNames.medium;
	const baseName = names[Math.floor(Math.random() * names.length)];
	const aiName = `${baseName} ${playerCount + 1}`;
	const aiPlayerId = `ai-${difficulty}-${Date.now()}-${Math.random()
		.toString(36)
		.substr(2, 9)}`;

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
			isAI: p.id.startsWith("ai-"),
			aiDifficulty: p.id.startsWith("ai-") ? difficulty : undefined,
		})),
	};
}

export async function removeAIPlayer(
	sessionId: string,
	playerId: string,
	adminPlayerId: string,
) {
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

	if (!session || session.gamePhase !== "waiting") {
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

	if (!player.id.startsWith("ai-")) {
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
			isAI: p.id.startsWith("ai-"),
			aiDifficulty: p.id.startsWith("ai-") ? p.id.split("-")[1] : undefined,
		})),
	};
}

export async function placeBid(
	sessionId: string,
	playerId: string,
	bidAmount: number,
) {
	// Get the player
	const player = await db.player.findFirst({
		where: {
			id: playerId,
			sessionId,
		},
	});

	if (!player) {
		throw new Error("Player not found in session");
	}

	// Get the current section
	const session = await db.gameSession.findUnique({
		where: { id: sessionId },
	});

	if (!session || session.gamePhase !== "playing") {
		throw new Error("Game is not in playing phase");
	}

	const sectionState = await db.sectionState.findFirst({
		where: {
			sessionId,
			sectionNumber: session.currentSection,
		},
	});

	if (!sectionState || sectionState.phase !== "bidding") {
		throw new Error("Not in bidding phase");
	}

	// Validate bid amount
	if (bidAmount < 0 || bidAmount > sectionState.sectionNumber) {
		throw new Error(`Bid must be between 0 and ${sectionState.sectionNumber}`);
	}

	// Check if player already has a bid
	const playerHand = await db.playerHand.findFirst({
		where: {
			sectionStateId: sectionState.id,
			playerId,
		},
	});

	if (!playerHand) {
		throw new Error("Player hand not found for this section");
	}

	if (playerHand.bid !== null) {
		throw new Error("Player has already placed a bid for this section");
	}

	// Update the player's bid
	await db.playerHand.update({
		where: { id: playerHand.id },
		data: { bid: bidAmount },
	});

	// Check if all players have bid
	const allPlayers = await db.player.findMany({
		where: { sessionId },
	});

	const playerHands = await db.playerHand.findMany({
		where: { sectionStateId: sectionState.id },
	});

	const handsWithBids = playerHands.filter((hand) => hand.bid !== null);

	// If all players have bid, move to bid-review phase
	if (handsWithBids.length === allPlayers.length) {
		await db.sectionState.update({
			where: { id: sectionState.id },
			data: {
				phase: "bid_review",
			},
		});
	} else {
		// Generate AI bids if needed
		await processAIBids(sessionId, sectionState.id);
	}

	return { success: true, message: "Bid placed successfully" };
}

export async function startPlayingPhase(
	sessionId: string,
	adminPlayerId: string,
) {
	// Get the admin player to verify permissions
	const admin = await db.player.findFirst({
		where: {
			id: adminPlayerId,
			sessionId,
			isAdmin: true,
		},
	});

	if (!admin) {
		throw new Error("Only admin can start the playing phase");
	}

	// Get the current session and section
	const session = await db.gameSession.findUnique({
		where: { id: sessionId },
	});

	if (!session || session.gamePhase !== "playing") {
		throw new Error("Game is not in playing phase");
	}

	const sectionState = await db.sectionState.findFirst({
		where: {
			sessionId,
			sectionNumber: session.currentSection,
		},
	});

	if (!sectionState || sectionState.phase !== "bid_review") {
		throw new Error("Not in bid-review phase");
	}

	// Get all players to calculate lead position correctly
	const allPlayers = await db.player.findMany({
		where: { sessionId },
		orderBy: { position: "asc" },
	});

	// Transition to playing phase
	await db.sectionState.update({
		where: { id: sectionState.id },
		data: {
			phase: "playing",
			leadPlayerPosition: (sectionState.dealerPosition % allPlayers.length) + 1, // Player after dealer leads
		},
	});

	// Create the first trick for this section
	await db.trick.create({
		data: {
			sectionStateId: sectionState.id,
			trickNumber: 1,
			leadPlayerPosition: (sectionState.dealerPosition % allPlayers.length) + 1,
		},
	});

	// Process AI turns if needed
	await processAITurns(sessionId);

	return { success: true, message: "Playing phase started successfully" };
}

export async function playCard(
	sessionId: string,
	playerId: string,
	card: Card,
) {
	// Get the player
	const player = await db.player.findFirst({
		where: {
			id: playerId,
			sessionId,
		},
	});

	if (!player) {
		throw new Error("Player not found in session");
	}

	// Get the current session and section
	const session = await db.gameSession.findUnique({
		where: { id: sessionId },
	});

	if (!session || session.gamePhase !== "playing") {
		throw new Error("Game is not in playing phase");
	}

	const sectionState = await db.sectionState.findFirst({
		where: {
			sessionId,
			sectionNumber: session.currentSection,
		},
	});

	if (!sectionState || sectionState.phase !== "playing") {
		throw new Error("Not in playing phase");
	}

	// Get the current trick
	const currentTrick = await db.trick.findFirst({
		where: {
			sectionStateId: sectionState.id,
			completedAt: null,
		},
		include: {
			trickCards: true,
		},
	});

	if (!currentTrick) {
		throw new Error("No active trick found");
	}

	// Check if it's the player's turn
	const expectedPlayerPosition = getNextPlayerToPlay(
		currentTrick,
		await getPlayersInSession(sessionId),
	);
	if (player.position !== expectedPlayerPosition) {
		throw new Error("Not your turn to play");
	}

	// Get player's hand
	const playerHand = await db.playerHand.findFirst({
		where: {
			sectionStateId: sectionState.id,
			playerId,
		},
	});

	if (!playerHand) {
		throw new Error("Player hand not found");
	}

	const hand: Array<{ suit: string; rank: string }> = JSON.parse(
		playerHand.cards,
	);

	// Validate the card is in the player's hand
	const cardInHand = hand.find(
		(c) => c.suit === card.suit && c.rank === card.rank,
	);
	if (!cardInHand) {
		throw new Error("Card not in player's hand");
	}

	// Validate card play according to rules (must follow suit if possible)
	const leadingSuit = currentTrick.leadingSuit;
	if (leadingSuit && card.suit !== leadingSuit) {
		const hasSuit = hand.some((c) => c.suit === leadingSuit);
		if (hasSuit) {
			throw new Error("Must follow suit");
		}
	}

	// Play the card
	await db.trickCard.create({
		data: {
			trickId: currentTrick.id,
			playerId,
			playerPosition: player.position,
			cardSuit: card.suit,
			cardRank: mapCardRankToDb(card.rank as Rank),
		},
	});

	// Remove card from player's hand
	const updatedHand = hand.filter(
		(c) => !(c.suit === card.suit && c.rank === card.rank),
	);
	await db.playerHand.update({
		where: { id: playerHand.id },
		data: {
			cards: JSON.stringify(updatedHand),
		},
	});

	// Set leading suit if this is the first card
	if (!leadingSuit) {
		await db.trick.update({
			where: { id: currentTrick.id },
			data: {
				leadingSuit: card.suit,
			},
		});
	}

	// Check if trick is complete
	const allPlayers = await getPlayersInSession(sessionId);
	const trickCardsCount = await db.trickCard.count({
		where: { trickId: currentTrick.id },
	});

	if (trickCardsCount === allPlayers.length) {
		// Complete the trick
		await completeTrick(currentTrick.id, sectionState.trumpSuit);

		// Check if section is complete
		const playerHandsWithCards = await db.playerHand.findMany({
			where: { sectionStateId: sectionState.id },
		});

		const anyPlayerHasCards = playerHandsWithCards.some((hand) => {
			const cards = JSON.parse(hand.cards);
			return cards.length > 0;
		});

		if (!anyPlayerHasCards) {
			// Section is complete - calculate scores and move to next section
			await completeSection(sectionState.id);
		} else {
			// Create next trick
			const winner = await getCurrentTrickWinner(currentTrick.id);
			if (winner) {
				await db.trick.create({
					data: {
						sectionStateId: sectionState.id,
						trickNumber: currentTrick.trickNumber + 1,
						leadPlayerPosition: winner.playerPosition,
					},
				});
			}
		}
	}

	// Process AI turns if needed
	await processAITurns(sessionId);

	return { success: true, message: "Card played successfully" };
}

async function processAIBids(sessionId: string, sectionStateId: string) {
	// Get all AI players in session who haven't bid yet
	const allPlayers = await db.player.findMany({
		where: { sessionId },
	});

	const playerHands = await db.playerHand.findMany({
		where: { sectionStateId },
	});

	const handsWithBids = new Set(
		playerHands
			.filter((hand) => hand.bid !== null)
			.map((hand) => hand.playerId),
	);
	const aiPlayersWithoutBids = allPlayers.filter(
		(p) => p.id.startsWith("ai-") && !handsWithBids.has(p.id),
	);

	// Get section info for max bid
	const sectionState = await db.sectionState.findUnique({
		where: { id: sectionStateId },
	});

	if (!sectionState) return;

	// Generate AI bids
	for (const aiPlayer of aiPlayersWithoutBids) {
		const difficulty = aiPlayer.id.split("-")[1] || "medium";
		const maxBid = sectionState.sectionNumber;

		// Simple AI bidding logic based on difficulty
		let aiBid: number;

		switch (difficulty) {
			case "easy":
				// Easy AI bids randomly
				aiBid = Math.floor(Math.random() * (maxBid + 1));
				break;
			case "hard":
				// Hard AI bids more strategically (simplified)
				aiBid = Math.min(
					maxBid,
					Math.floor(maxBid * 0.6) + Math.floor(Math.random() * 2),
				);
				break;
			default: // medium
				// Medium AI bids somewhat strategically
				aiBid =
					Math.floor(Math.random() * Math.max(1, maxBid * 0.8)) +
					Math.floor(Math.random() * 2);
				aiBid = Math.min(aiBid, maxBid);
		}

		// Find the AI player's hand and update their bid
		const aiPlayerHand = await db.playerHand.findFirst({
			where: {
				sectionStateId,
				playerId: aiPlayer.id,
			},
		});

		if (aiPlayerHand) {
			await db.playerHand.update({
				where: { id: aiPlayerHand.id },
				data: { bid: aiBid },
			});
		}
	}

	// After AI bids, check if all players have now bid and transition to playing phase
	const updatedPlayerHands = await db.playerHand.findMany({
		where: { sectionStateId },
	});

	const updatedHandsWithBids = updatedPlayerHands.filter(
		(hand) => hand.bid !== null,
	);

	// If all players have now bid, move to bid-review phase
	if (updatedHandsWithBids.length === allPlayers.length) {
		await db.sectionState.update({
			where: { id: sectionStateId },
			data: {
				phase: "bid_review",
			},
		});
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

export async function processAITurns(sessionId: string) {
	console.debug(
		"[processAITurns] Starting AI turn processing for session:",
		sessionId,
	);

	// Get current section and trick
	const session = await db.gameSession.findUnique({
		where: { id: sessionId },
	});

	if (!session || session.gamePhase !== "playing") {
		console.debug(
			"[processAITurns] Session not in playing phase:",
			session?.gamePhase,
		);
		return;
	}

	const sectionState = await db.sectionState.findFirst({
		where: {
			sessionId,
			sectionNumber: session.currentSection,
		},
	});

	if (!sectionState || sectionState.phase !== "playing") {
		console.debug(
			"[processAITurns] Section not in playing phase:",
			sectionState?.phase,
		);
		return;
	}

	const currentTrick = await db.trick.findFirst({
		where: {
			sectionStateId: sectionState.id,
			completedAt: null,
		},
		include: {
			trickCards: {
				include: { player: true },
			},
		},
	});

	if (!currentTrick) {
		console.debug("[processAITurns] No active trick found");
		return;
	}

	// Get all players
	const allPlayers = await getPlayersInSession(sessionId);

	// Check if it's an AI player's turn
	const nextPlayerPosition = getNextPlayerToPlay(currentTrick, allPlayers);
	const nextPlayer = allPlayers.find((p) => p.position === nextPlayerPosition);

	console.debug("[processAITurns] Next player to play:", {
		position: nextPlayerPosition,
		playerId: nextPlayer?.id,
		isAI: nextPlayer?.id.startsWith("ai-"),
	});

	if (!nextPlayer || !nextPlayer.id.startsWith("ai-")) {
		console.debug("[processAITurns] Not an AI's turn, skipping");
		return; // Not an AI's turn
	}

	console.debug(
		"[processAITurns] Processing AI turn for player:",
		nextPlayer.id,
	);

	// Get AI's hand
	const playerHand = await db.playerHand.findFirst({
		where: {
			sectionStateId: sectionState.id,
			playerId: nextPlayer.id,
		},
	});

	if (!playerHand) {
		console.debug(
			"[processAITurns] Player hand not found for AI:",
			nextPlayer.id,
		);
		return;
	}

	const hand: Card[] = JSON.parse(playerHand.cards);
	if (hand.length === 0) {
		console.debug("[processAITurns] AI has no cards left:", nextPlayer.id);
		return;
	}

	console.debug("[processAITurns] AI hand:", hand);

	// Import AI manager and create AI
	const { AIManager } = await import("./ai/ai-manager");
	const aiManager = new AIManager();

	// Extract difficulty from AI player ID and register the AI
	const difficulty = nextPlayer.id.split("-")[1] as "easy" | "medium" | "hard";
	aiManager.addAIPlayer(nextPlayer.id, difficulty, nextPlayer.name);

	// Get current trick cards
	const currentTrickCards: Card[] = currentTrick.trickCards.map((tc) => ({
		suit: tc.cardSuit.toLowerCase() as Suit,
		rank: tc.cardRank as Rank,
	}));

	const trumpSuit = sectionState.trumpSuit.toLowerCase() as Suit;
	const leadingSuit = currentTrick.leadingSuit?.toLowerCase() as
		| Suit
		| undefined;

	console.debug("[processAITurns] Game context:", {
		trumpSuit,
		leadingSuit,
		currentTrickCards: currentTrickCards.length,
	});

	// Create game context
	const gameContext: {
		currentSection: number;
		totalSections: number;
		playerBids: Record<string, number>;
		tricksPlayed: number;
		totalTricks: number;
		scores: Record<string, number>;
	} = {
		currentSection: sectionState.sectionNumber,
		totalSections: session.gameType === "up" ? 13 : 20,
		playerBids: {},
		tricksPlayed: currentTrick.trickNumber - 1,
		totalTricks: sectionState.sectionNumber,
		scores: {},
	};

	// Get player bids and tricks won
	const playerHands = await db.playerHand.findMany({
		where: { sectionStateId: sectionState.id },
		include: { player: true },
	});

	for (const ph of playerHands) {
		gameContext.playerBids[ph.player.name] = ph.bid || 0;
		gameContext.scores[ph.player.name] = ph.player.totalScore;
	}

	// Make AI play a card
	const cardToPlay = await aiManager.playAICard(
		nextPlayer.id,
		hand,
		currentTrickCards,
		trumpSuit,
		leadingSuit,
		gameContext,
	);

	console.debug("[processAITurns] AI chose card:", cardToPlay);

	if (cardToPlay) {
		console.debug(
			"[processAITurns] Playing card for AI:",
			nextPlayer.id,
			cardToPlay,
		);
		// Play the card for the AI
		await playCard(sessionId, nextPlayer.id, cardToPlay);
		console.debug("[processAITurns] AI card played successfully");
	} else {
		console.debug("[processAITurns] AI did not return a valid card");
	}
}

async function getPlayersInSession(sessionId: string) {
	return await db.player.findMany({
		where: { sessionId },
		orderBy: { position: "asc" },
	});
}

function getNextPlayerToPlay(
	trick: {
		leadPlayerPosition: number;
		trickCards: Array<{ playerPosition: number }>;
	},
	allPlayers: Array<{ position: number }>,
) {
	if (!trick.trickCards || trick.trickCards.length === 0) {
		// First card - lead player plays
		return trick.leadPlayerPosition;
	}

	// Find the next player after the last one who played
	const playedPositions = new Set(
		trick.trickCards.map((tc) => tc.playerPosition),
	);

	// Start from lead player and find next player who hasn't played
	let currentPos = trick.leadPlayerPosition;
	for (let i = 0; i < allPlayers.length; i++) {
		if (!playedPositions.has(currentPos)) {
			return currentPos;
		}
		currentPos = (currentPos % allPlayers.length) + 1;
	}

	return trick.leadPlayerPosition; // Fallback
}

async function completeTrick(trickId: string, trumpSuit: string) {
	const trick = await db.trick.findUnique({
		where: { id: trickId },
		include: {
			trickCards: {
				include: { player: true },
			},
		},
	});

	if (!trick) return;

	// Find the winner
	const cardsPlayed: Record<number, Card> = {};

	for (const tc of trick.trickCards) {
		cardsPlayed[tc.playerPosition] = {
			suit: tc.cardSuit.toLowerCase() as Suit,
			rank: tc.cardRank as Rank,
		};
	}

	const leadingSuit = trick.leadingSuit?.toLowerCase() as Suit | undefined;
	if (!leadingSuit) {
		throw new Error("No leading suit found for completed trick");
	}
	const winnerPosition = getTrickWinner(
		cardsPlayed,
		trick.leadPlayerPosition,
		trumpSuit.toLowerCase() as Suit,
		leadingSuit,
	);

	// Update trick as completed
	await db.trick.update({
		where: { id: trickId },
		data: {
			winnerPosition,
			completedAt: new Date(),
		},
	});

	// Update winner's tricks won count
	const winnerCard = trick.trickCards.find(
		(tc) => tc.playerPosition === winnerPosition,
	);
	if (winnerCard) {
		const playerHand = await db.playerHand.findFirst({
			where: {
				sectionStateId: trick.sectionStateId,
				playerId: winnerCard.playerId,
			},
		});

		if (playerHand) {
			await db.playerHand.update({
				where: { id: playerHand.id },
				data: {
					tricksWon: playerHand.tricksWon + 1,
				},
			});
		}
	}

	return { winnerPosition };
}

async function getCurrentTrickWinner(trickId: string) {
	const trick = await db.trick.findUnique({
		where: { id: trickId },
		include: {
			trickCards: {
				include: { player: true },
			},
		},
	});

	if (!trick || !trick.winnerPosition) return null;

	return trick.trickCards.find(
		(tc) => tc.playerPosition === trick.winnerPosition,
	);
}

async function completeSection(sectionStateId: string) {
	// Calculate scores for each player
	const playerHands = await db.playerHand.findMany({
		where: { sectionStateId },
		include: { player: true },
	});

	for (const hand of playerHands) {
		const bid = hand.bid || 0;
		const tricksWon = hand.tricksWon;

		// Scoring: 10 + bid if exact, 0 otherwise
		const sectionScore = bid === tricksWon ? 10 + bid : 0;

		await db.playerHand.update({
			where: { id: hand.id },
			data: { sectionScore },
		});

		// Update player's total score
		await db.player.update({
			where: { id: hand.playerId },
			data: {
				totalScore: {
					increment: sectionScore,
				},
			},
		});
	}

	// Mark section as completed
	await db.sectionState.update({
		where: { id: sectionStateId },
		data: { phase: "completed" },
	});

	// Check if game is complete or start next section
	const sectionState = await db.sectionState.findUnique({
		where: { id: sectionStateId },
		include: { session: true },
	});

	if (!sectionState) return;

	const session = sectionState.session;
	const maxSections = session.gameType === "up" ? 13 : 20;

	if (session.currentSection >= maxSections) {
		// Game is complete
		await db.gameSession.update({
			where: { id: session.id },
			data: { gamePhase: "finished" },
		});
	} else {
		// Start next section
		const nextSectionNumber = session.currentSection + 1;
		await db.gameSession.update({
			where: { id: session.id },
			data: { currentSection: nextSectionNumber },
		});

		// Initialize next section
		await initializeSection(session.id, nextSectionNumber);
	}
}
