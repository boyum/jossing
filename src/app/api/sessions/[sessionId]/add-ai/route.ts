import { type NextRequest, NextResponse } from "next/server";

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

    // TODO: Implement AI player addition with GameManager
    // For now, return a placeholder response
    const result = {
      success: true,
      message: `${difficulty} AI player added successfully`,
      playerId: `ai-${difficulty}-${Date.now()}`,
      difficulty
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error adding AI players:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
