import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

export async function GET(request: NextRequest) {
  try {
    const [, sessionId] =
      request.nextUrl.pathname.match(/\/game\/([^?]+)/) ?? [];

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const playerId = request.nextUrl.searchParams.get("playerId");
    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    console.debug("Getting game state for:", { sessionId, playerId });

    // Get the game state
    const gameState = await GameManager.getGameState(playerId);

    if (!gameState) {
      return NextResponse.json(
        { error: "Game not found or player not in session" },
        { status: 404 }
      );
    }

    return NextResponse.json(gameState);
  } catch (error) {
    console.error("Error getting game state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // TODO: Re-implement game action functionality with database
    return NextResponse.json(
      { error: "Game action functionality temporarily disabled during migration" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error processing game action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
