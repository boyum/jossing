import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

interface GameActionResult {
  success: boolean;
  message: string;
  gameState?: unknown;
}

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

export async function POST(request: NextRequest) {
  try {
    const [, sessionId] =
      request.nextUrl.pathname.match(/\/game\/([^?]+)/) ?? [];

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, playerId, data } = body;

    if (!action || !playerId) {
      return NextResponse.json(
        { error: "Action and player ID are required" },
        { status: 400 }
      );
    }

    console.debug("Processing game action:", { sessionId, playerId, action });

    let result: GameActionResult;
    switch (action) {
      case 'bid':
        if (typeof data?.bid !== 'number') {
          return NextResponse.json(
            { error: "Bid value is required" },
            { status: 400 }
          );
        }
        result = await GameManager.placeBid(sessionId, playerId, data.bid);
        break;

      case 'playCard':
        if (!data?.card || !data.card.suit || !data.card.rank) {
          return NextResponse.json(
            { error: "Valid card is required" },
            { status: 400 }
          );
        }
        result = await GameManager.playCard(sessionId, playerId, data.card);
        break;

      case 'startPlayingPhase':
        result = await GameManager.startPlayingPhase(sessionId, playerId);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing game action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
