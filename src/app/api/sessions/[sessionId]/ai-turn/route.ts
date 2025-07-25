import { type NextRequest, NextResponse } from "next/server";
import { processAITurns } from "@/lib/simple-db";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const [, sessionId] =
      request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/ai-turn/) ?? [];

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    console.debug("Processing AI turn:", { sessionId, action });

    let result: {
      success: boolean;
      message: string;
      action: string;
    };

    switch (action) {
      case "playCard": {
        // Check if the session exists and is in playing phase
        const session = await db.gameSession.findUnique({
          where: { id: sessionId },
        });
        
        if (!session) {
          return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
          );
        }

        if (session.gamePhase !== "playing") {
          return NextResponse.json(
            { error: `Game is in ${session.gamePhase} phase, not playing` },
            { status: 400 }
          );
        }

        // Process AI turns for this session
        await processAITurns(sessionId);
        
        result = {
          success: true,
          message: "AI turn processing triggered successfully",
          action
        };
        break;
      }

      case "bid": {
        // For future implementation - AI bidding logic
        result = {
          success: false,
          message: "AI bidding not yet implemented",
          action
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing AI turn:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
