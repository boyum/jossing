import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

export async function POST(request: NextRequest) {
	try {
		const [, sessionId] =
			request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/start/) ?? [];

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 },
			);
		}

		const body = await request.json();
		const { adminPlayerId } = body;

		// Validate input
		if (!adminPlayerId || typeof adminPlayerId !== "string") {
			return NextResponse.json(
				{ error: "Admin player ID is required" },
				{ status: 400 },
			);
		}

		if (!sessionId || typeof sessionId !== "string") {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 },
			);
		}

		// Try to start the game
		const success = await GameManager.startGame(
			sessionId.toUpperCase(),
			adminPlayerId,
		);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to start game" },
				{ status: 400 },
			);
		}

		// Get the updated game state
		const gameState = await GameManager.getGameState(adminPlayerId);

		return NextResponse.json({
			success: true,
			gameState,
		});
	} catch (error) {
		console.error("Error starting game:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
