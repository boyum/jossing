import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const [, sessionId] =
      request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/stats/) ?? [];

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

    console.debug("Getting game stats:", { sessionId, playerId });

    // TODO: Implement game stats functionality with database
    // For now, return placeholder stats
    const stats = {
      sessionId,
      playerId,
      totalSections: 0,
      sectionsCompleted: 0,
      successfulBids: 0,
      totalBids: 0,
      averageScore: 0,
      totalScore: 0,
      bidAccuracy: 0,
      favoriteCard: null,
      mostSuccessfulBid: null
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error getting game stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
