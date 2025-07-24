import { db } from '../src/lib/db';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection by counting sessions
    const sessionCount = await db.gameSession.count();
    console.log(`✅ Database connected! Found ${sessionCount} existing sessions.`);
    
    // Test creating a simple session
    const testSessionId = 'TEST01';
    
    // Clean up any existing test session first
    try {
      await db.gameSession.delete({ where: { id: testSessionId } });
    } catch (e) {
      // Ignore if doesn't exist
    }
    
    const session = await db.gameSession.create({
      data: {
        id: testSessionId,
        adminPlayerId: 'test-admin-123',
        gameType: 'UP_AND_DOWN',
        scoringSystem: 'CLASSIC',
        maxPlayers: 6,
        currentSection: 0,
        gamePhase: 'WAITING',
      },
    });
    
    console.log(`✅ Session created successfully: ${session.id}`);
    
    // Test creating a player
    const player = await db.player.create({
      data: {
        id: 'test-player-123',
        sessionId: testSessionId,
        name: 'Test Player',
        isAdmin: true,
        position: 1,
        totalScore: 0,
        isConnected: true,
      },
    });
    
    console.log(`✅ Player created successfully: ${player.name}`);
    
    // Clean up test data
    await db.player.delete({ where: { id: player.id } });
    await db.gameSession.delete({ where: { id: session.id } });
    
    console.log('✅ Database test completed successfully!');
    console.log('🎉 Session joining should now work properly.');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await db.$disconnect();
  }
}

testDatabase();
