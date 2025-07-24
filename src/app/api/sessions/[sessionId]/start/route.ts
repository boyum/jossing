import { NextRequest, NextResponse } from 'next/server';
import { GameManager } from '@/lib/game-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const body = await request.json();
    const { adminPlayerId } = body;

    // Validate input
    if (!adminPlayerId || typeof adminPlayerId !== 'string') {
      return NextResponse.json(
        { error: 'Admin player ID is required' },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Try to start the game
    const success = GameManager.startGame(sessionId.toUpperCase(), adminPlayerId);

    if (!success) {
      return NextResponse.json(
        { error: 'Unable to start game. You may not be the admin, or there may not be enough players.' },
        { status: 400 }
      );
    }

    // Get updated game state
    const gameState = GameManager.getGameState(adminPlayerId);

    return NextResponse.json({
      success: true,
      gameState
    });
  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
