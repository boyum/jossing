import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";
import { AIDifficulty } from "@/types/game";

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

    // Parse request body for AI difficulty
    let difficulty = AIDifficulty.EASY; // Default to easy
    try {
      const body = await request.json();
      if (body.difficulty && Object.values(AIDifficulty).includes(body.difficulty)) {
        difficulty = body.difficulty;
      }
    } catch {
      // Use default difficulty if no body or invalid JSON
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

    // Add AI players to fill remaining slots with specified difficulty
    const result = GameManager.addAIPlayers(sessionId.toUpperCase(), difficulty);

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
      message: `AI players added successfully with ${difficulty} difficulty`,
      players: players,
      aiPlayersAdded: players.filter((p) => p.isAI).length,
      difficulty: difficulty,
    });
  } catch (error) {
    console.error("Error adding AI players:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
