'use client';

import { io, Socket } from 'socket.io-client';
import type { Card } from '@/types/game';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(serverUrl: string = 'http://localhost:3000'): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server:', this.socket?.id);
        this.isConnected = true;
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        this.isConnected = false;
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Game-specific socket events
  joinRoom(sessionId: string, playerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('join-room', { sessionId, playerId });

      this.socket.once('joined-room', () => {
        console.log(`Joined room ${sessionId} as player ${playerId}`);
        resolve();
      });

      this.socket.once('error', (error) => {
        console.error('Failed to join room:', error);
        reject(new Error(error.message || 'Failed to join room'));
      });
    });
  }

  leaveRoom(sessionId: string, playerId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', { sessionId, playerId });
    }
  }

  startGame(sessionId: string, adminPlayerId: string) {
    if (this.socket) {
      this.socket.emit('start-game', { sessionId, adminPlayerId });
    }
  }

  placeBid(sessionId: string, playerId: string, bid: number) {
    if (this.socket) {
      this.socket.emit('place-bid', { sessionId, playerId, bid });
    }
  }

  playCard(sessionId: string, playerId: string, card: Card) {
    if (this.socket) {
      this.socket.emit('play-card', { sessionId, playerId, card });
    }
  }

  broadcastToRoom(sessionId: string, event: string, payload: any) {
    if (this.socket) {
      this.socket.emit('broadcast-to-room', { sessionId, event, payload });
    }
  }

  // Event listeners
  onPlayerConnected(callback: (data: { playerId: string }) => void) {
    if (this.socket) {
      this.socket.on('player-connected', callback);
    }
  }

  onPlayerDisconnected(callback: (data: { playerId: string }) => void) {
    if (this.socket) {
      this.socket.on('player-disconnected', callback);
    }
  }

  onGameStarting(callback: (data: { adminPlayerId: string }) => void) {
    if (this.socket) {
      this.socket.on('game-starting', callback);
    }
  }

  onBidPlaced(callback: (data: { playerId: string; hasBid: boolean }) => void) {
    if (this.socket) {
      this.socket.on('bid-placed', callback);
    }
  }

  onCardPlayed(callback: (data: { playerId: string; card: Card }) => void) {
    if (this.socket) {
      this.socket.on('card-played', callback);
    }
  }

  onPlayerReadyUpdate(callback: (data: { playerId: string }) => void) {
    if (this.socket) {
      this.socket.on('player-ready-update', callback);
    }
  }

  onGameError(callback: (data: { message: string; code: string }) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  removeListener(event: string, callback?: Function) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  get connected() {
    return this.isConnected && this.socket?.connected;
  }

  get socketId() {
    return this.socket?.id;
  }
}

// Export a singleton instance
export const socketService = new SocketService();
export default socketService;
