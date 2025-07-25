import { type NextRequest, NextResponse } from "next/server";
import { GameManager } from "@/lib/game-manager";
import { isValidGameType, isValidScoringSystem } from "@/lib/game-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminName, gameType, scoringSystem, maxPlayers } = body;

    // Validate input
    if (
      !adminName ||
      typeof adminName !== "string" ||
      adminName.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Admin name is required" },
        { status: 400 },
      );
    }

    if (!isValidGameType(gameType)) {
      return NextResponse.json({ error: "Invalid game type" }, { status: 400 });
    }

    if (!isValidScoringSystem(scoringSystem)) {
      return NextResponse.json(
        { error: "Invalid scoring system" },
        { status: 400 },
      );
    }

    if (!maxPlayers || maxPlayers < 2 || maxPlayers > 6) {
      return NextResponse.json(
        { error: "Max players must be between 2 and 6" },
        { status: 400 },
      );
    }

    // Create the session
    const result = await GameManager.createSession(
      adminName.trim(),
      gameType,
      scoringSystem,
      maxPlayers,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
