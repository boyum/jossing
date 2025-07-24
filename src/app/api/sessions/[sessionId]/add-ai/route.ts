import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

export async function POST(request: NextRequest) {
  try {
    const [, sessionId] =
      request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/add-ai/) ?? [];

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { difficulty = "medium" } = body;

    // Validate difficulty
    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Must be easy, medium, or hard" },
        { status: 400 }
      );
    }

    console.debug("Adding AI player:", { sessionId, difficulty });

    // Add AI player using GameManager
    const result = await GameManager.addAIPlayer(
      sessionId.toUpperCase(),
      difficulty
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error adding AI players:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
