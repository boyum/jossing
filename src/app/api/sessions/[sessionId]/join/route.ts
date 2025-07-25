import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

export async function POST(request: NextRequest) {
  try {
    console.debug("Joining session...");

    const [, sessionId] =
      request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/join/) ?? [];

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    console.debug("Session ID:", sessionId);

    const body = await request.json();
    const { playerName } = body;

    // Validate input
    if (
      !playerName ||
      typeof playerName !== "string" ||
      playerName.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 },
      );
    }

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Try to join the session
    const result = await GameManager.joinSession(
      sessionId.toUpperCase(),
      playerName.trim(),
    );

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Unable to join session. Session may be full, not found, or already started.",
        },
        { status: 400 },
      );
    }

    // Get the game state for the new player
    const gameState = await GameManager.getGameState(result.playerId);

    return NextResponse.json({
      playerId: result.playerId,
      position: result.position,
      gameState,
    });
  } catch (error) {
    console.error("Error joining session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
