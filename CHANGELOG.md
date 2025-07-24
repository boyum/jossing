# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **Minimum Players**: Reduced minimum player requirement from 3 to 2 players
  - Updated frontend validation in GameLobby and play page components
  - Updated backend validation in simple-db and API routes
  - Updated player count options in GameSetup component to include 2 players
  - Updated documentation and UI text to reflect 2-6 player support
- **Default Max Players**: Ensured consistent default of 6 players across all components
  - Updated GameSetup component default from 4 to 6 players
  - Updated game-api-service default from 4 to 6 players
  - Updated play page UI to dynamically show max players from session data
  - Updated AI player addition limits to respect session's max players setting
- **Polling Frequency**: Increased real-time update polling from 2 seconds to 1 second for more responsive multiplayer experience
  - Updated `useGamePolling` hook default interval: `2000ms` → `1000ms`
  - Updated `GameStore.startPolling` default interval: `2000ms` → `1000ms`
  - Improved game responsiveness for player actions, AI turns, and state changes

### Fixed
- **Start Game Bug**: Fixed issue where clicking "Start Game" button had no effect
  - Fixed gamePhase enum mapping mismatch between database (uppercase) and TypeScript types (lowercase)
  - Added immediate game state refresh after starting a game
  - Start button now properly transitions the game from lobby to playing phase
- **Add AI Players**: Fixed issue where adding AI players to a session had no effect
  - Implemented actual AI player creation in database via `addAIPlayer` function in simple-db
  - Added GameManager integration for AI player addition
  - Updated API endpoint to use GameManager instead of returning placeholder response
  - AI players are now properly added to sessions with generated names and difficulty tracking
- **Remove AI Players**: Added ability to remove AI players from sessions before game starts
  - Implemented `removeAIPlayer` function with admin validation and position reordering
  - Added DELETE API endpoint `/sessions/{sessionId}/remove-ai` for AI player removal
  - Added "Remove" buttons for AI players in the lobby (admin only)
  - AI players can be removed individually, allowing fine-tuned team composition

### Technical
- Updated documentation to reflect current polling-based architecture (replaced outdated Socket.IO references)
- Added polling configuration details to `DEVELOPMENT_PLAN.md` and `TECHNICAL_SPEC.md`
- Enhanced code comments to document polling intervals and serverless compatibility
