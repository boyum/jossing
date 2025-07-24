import { type NextRequest, NextResponse } from 'next/server';
import { GameManager } from '@/lib/game-manager';
import { GameType, ScoringSystem } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminName, gameType, scoringSystem, maxPlayers } = body;

    // Validate input
    if (!adminName || typeof adminName !== 'string' || adminName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Admin name is required' },
        { status: 400 }
      );
    }

    if (!Object.values(GameType).includes(gameType)) {
      return NextResponse.json(
        { error: 'Invalid game type' },
        { status: 400 }
      );
    }

    if (!Object.values(ScoringSystem).includes(scoringSystem)) {
      return NextResponse.json(
        { error: 'Invalid scoring system' },
        { status: 400 }
      );
    }

    if (!maxPlayers || maxPlayers < 3 || maxPlayers > 6) {
      return NextResponse.json(
        { error: 'Max players must be between 3 and 6' },
        { status: 400 }
      );
    }

    // Create the session
    const result = GameManager.createSession(
      adminName.trim(),
      gameType,
      scoringSystem,
      maxPlayers
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
