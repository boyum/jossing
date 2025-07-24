// app/api/game/[sessionId]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { GameManager } from '@/lib/game-manager';

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const gameState = GameManager.getGameState(playerId);
    
    if (!gameState) {
      return NextResponse.json(
        { error: 'Game not found or player not in game' },
        { status: 404 }
      );
    }

    return NextResponse.json(gameState);
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle game actions (bid, play card, etc.)
export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { action, playerId, data } = body;

    let success = false;

    switch (action) {
      case 'bid':
        success = GameManager.placeBid(playerId, data.bid);
        break;
      
      case 'playCard':
        success = GameManager.playCard(playerId, data.card);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Action failed' },
        { status: 400 }
      );
    }

    // Return updated game state
    const gameState = GameManager.getGameState(playerId);
    return NextResponse.json({ success: true, gameState });

  } catch (error) {
    console.error('Error handling game action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
