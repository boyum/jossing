import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

export async function GET(request: NextRequest) {
  try {
    const [, sessionId] =
      request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/stats/) ?? [];

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    const stats = GameManager.getFinalGameStats(sessionId);

    if (!stats) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error getting final game stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
