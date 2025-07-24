import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-implement game state functionality with database
    return NextResponse.json(
      { error: "Game state functionality temporarily disabled during migration" },
      { status: 501 }
    );
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
    // TODO: Re-implement game action functionality with database
    return NextResponse.json(
      { error: "Game action functionality temporarily disabled during migration" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error processing game action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
