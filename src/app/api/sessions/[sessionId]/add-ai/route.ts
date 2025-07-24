import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

export async function POST(request: NextRequest) {
  try {
    const [, sessionId] =
      request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/add-ai/) ?? [];

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Validate session exists and is in waiting phase
    const session = GameManager.getSession(sessionId.toUpperCase());
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.gamePhase !== "waiting") {
      return NextResponse.json(
        { error: "Cannot add AI players to a game that has already started" },
        { status: 400 },
      );
    }

    // Add AI players to fill remaining slots
    const result = GameManager.addAIPlayers(sessionId.toUpperCase());

    if (!result) {
      return NextResponse.json(
        { error: "Failed to add AI players" },
        { status: 400 },
      );
    }

    // Get updated game state
    const players = GameManager.getSessionPlayers(sessionId.toUpperCase());

    return NextResponse.json({
      success: true,
      message: "AI players added successfully",
      players: players,
      aiPlayersAdded: players.filter((p) => p.isAI).length,
    });
  } catch (error) {
    console.error("Error adding AI players:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
