const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server: SocketIOServer } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handler(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : '*',
      methods: ['GET', 'POST']
    }
  });

  // In-memory storage for socket connections
  const playerSockets = new Map(); // playerId -> socketId
  const socketPlayers = new Map(); // socketId -> playerId

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a game session room
    socket.on('join-room', async (data) => {
      try {
        const { sessionId, playerId } = data;
        
        // Store the socket mapping
        playerSockets.set(playerId, socket.id);
        socketPlayers.set(socket.id, playerId);

        // Join the room
        await socket.join(sessionId);
        
        // Notify other players
        socket.to(sessionId).emit('player-connected', { playerId });

        // Send confirmation to the player
        socket.emit('joined-room', { sessionId, playerId });

        console.log(`Player ${playerId} joined room ${sessionId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room', code: 'JOIN_ERROR' });
      }
    });

    // Leave a game session room
    socket.on('leave-room', async (data) => {
      try {
        const { sessionId, playerId } = data;
        
        // Remove socket mapping
        playerSockets.delete(playerId);
        socketPlayers.delete(socket.id);
        
        socket.to(sessionId).emit('player-disconnected', { playerId });
        await socket.leave(sessionId);
        
        console.log(`Player ${playerId} left room ${sessionId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Start game
    socket.on('start-game', async (data) => {
      try {
        const { sessionId, adminPlayerId } = data;
        
        // Notify all players that the game is starting
        io.to(sessionId).emit('game-starting', { adminPlayerId });
        
        console.log(`Game starting in room ${sessionId} by ${adminPlayerId}`);
      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', { message: 'Failed to start game', code: 'START_GAME_ERROR' });
      }
    });

    // Place bid
    socket.on('place-bid', async (data) => {
      try {
        const { sessionId, playerId, bid } = data;
        
        // Notify all players about the bid (without revealing the bid amount)
        io.to(sessionId).emit('bid-placed', { playerId, hasBid: true });
        
        console.log(`Player ${playerId} placed bid in room ${sessionId}`);
      } catch (error) {
        console.error('Error placing bid:', error);
        socket.emit('error', { message: 'Failed to place bid', code: 'BID_ERROR' });
      }
    });

    // Play card
    socket.on('play-card', async (data) => {
      try {
        const { sessionId, playerId, card } = data;
        
        // Notify all players about the card played
        io.to(sessionId).emit('card-played', { playerId, card });
        
        console.log(`Player ${playerId} played card in room ${sessionId}:`, card);
      } catch (error) {
        console.error('Error playing card:', error);
        socket.emit('error', { message: 'Failed to play card', code: 'CARD_PLAY_ERROR' });
      }
    });

    // Player ready status
    socket.on('player-ready', (data) => {
      const { sessionId, playerId } = data;
      socket.to(sessionId).emit('player-ready-update', { playerId });
    });

    // Broadcast message to room
    socket.on('broadcast-to-room', (data) => {
      const { sessionId, event, payload } = data;
      io.to(sessionId).emit(event, payload);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const playerId = socketPlayers.get(socket.id);
      if (playerId) {
        playerSockets.delete(playerId);
        socketPlayers.delete(socket.id);
        
        // Notify rooms about disconnection
        socket.broadcast.emit('player-disconnected', { playerId });
      }
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port} with Socket.IO`);
    });
});
