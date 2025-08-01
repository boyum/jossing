import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

export async function DELETE(request: NextRequest) {
	try {
		const [, sessionId] =
			request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/remove-ai/) ?? [];

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 },
			);
		}

		const body = await request.json();
		const { playerId, adminPlayerId } = body;

		// Validate input
		if (!playerId || typeof playerId !== "string") {
			return NextResponse.json(
				{ error: "Player ID is required" },
				{ status: 400 },
			);
		}

		if (!adminPlayerId || typeof adminPlayerId !== "string") {
			return NextResponse.json(
				{ error: "Admin player ID is required" },
				{ status: 400 },
			);
		}

		console.debug("Removing AI player:", {
			sessionId,
			playerId,
			adminPlayerId,
		});

		// Remove AI player using GameManager
		const result = await GameManager.removeAIPlayer(
			sessionId.toUpperCase(),
			playerId,
			adminPlayerId,
		);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error removing AI player:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Internal server error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
