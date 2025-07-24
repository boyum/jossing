# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **Minimum Players**: Reduced minimum player requirement from 3 to 2 players
  - Updated frontend validation in GameLobby and play page components
  - Updated backend validation in simple-db and API routes
  - Updated player count options in GameSetup component to include 2 players
  - Updated documentation and UI text to reflect 2-6 player support
- **Polling Frequency**: Increased real-time update polling from 2 seconds to 1 second for more responsive multiplayer experience
  - Updated `useGamePolling` hook default interval: `2000ms` → `1000ms`
  - Updated `GameStore.startPolling` default interval: `2000ms` → `1000ms`
  - Improved game responsiveness for player actions, AI turns, and state changes

### Fixed
- **Start Game Bug**: Fixed issue where clicking "Start Game" button had no effect
  - Fixed gamePhase enum mapping mismatch between database (uppercase) and TypeScript types (lowercase)
  - Added immediate game state refresh after starting a game
  - Start button now properly transitions the game from lobby to playing phase

### Technical
- Updated documentation to reflect current polling-based architecture (replaced outdated Socket.IO references)
- Added polling configuration details to `DEVELOPMENT_PLAN.md` and `TECHNICAL_SPEC.md`
- Enhanced code comments to document polling intervals and serverless compatibility
