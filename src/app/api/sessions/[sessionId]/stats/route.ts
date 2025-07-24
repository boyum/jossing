import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-implement game stats functionality with database
    return NextResponse.json(
      { error: "Game stats functionality temporarily disabled during migration" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error getting game stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
