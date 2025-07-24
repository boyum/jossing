import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";

export async function POST(request: NextRequest) {
  try {
    const [, sessionId] =
      request.nextUrl.pathname.match(/\/sessions\/([^/]+)\/ai-turn/) ?? [];

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Validate session exists
    const session = GameManager.getSession(sessionId.toUpperCase());
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Process AI turn (now async)
    const result = await GameManager.processAITurn(sessionId.toUpperCase());
    
    if (!result) {
      return NextResponse.json(
        { error: "No AI action was taken. Either it's not an AI's turn or the game state doesn't allow it." },
        { status: 400 }
      );
    }

    // Get updated game state for response
    const currentSection = GameManager.getCurrentSection(sessionId.toUpperCase());
    const sectionBids = GameManager.getSectionBids(sessionId.toUpperCase());
    const currentBidder = GameManager.getCurrentBidder(sessionId.toUpperCase());
    const allBidsPlaced = GameManager.areAllBidsPlaced(sessionId.toUpperCase());

    return NextResponse.json({
      success: true,
      message: "AI turn processed successfully",
      gameState: {
        currentSection,
        sectionBids,
        currentBidder,
        allBidsPlaced
      }
    });

  } catch (error) {
    console.error("Error processing AI turn:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
