import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // TODO: Re-implement AI functionality with database
    return NextResponse.json(
      { error: "AI functionality temporarily disabled during migration" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error processing AI turn:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
