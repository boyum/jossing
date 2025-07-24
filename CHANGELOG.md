# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **Polling Frequency**: Increased real-time update polling from 2 seconds to 1 second for more responsive multiplayer experience
  - Updated `useGamePolling` hook default interval: `2000ms` → `1000ms`
  - Updated `GameStore.startPolling` default interval: `2000ms` → `1000ms`
  - Improved game responsiveness for player actions, AI turns, and state changes

### Technical
- Updated documentation to reflect current polling-based architecture (replaced outdated Socket.IO references)
- Added polling configuration details to `DEVELOPMENT_PLAN.md` and `TECHNICAL_SPEC.md`
- Enhanced code comments to document polling intervals and serverless compatibility
