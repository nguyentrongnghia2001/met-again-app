# Met Again - GitHub Copilot Workspace Guide

## Project Tech Stack
- **Frontend**: Vue 3 + Composition API + Vite
- **Backend**: Express.js
- **Realtime signaling**: Socket.IO
- **Peer media**: WebRTC with `RTCPeerConnection`
- **Persistence**: MongoDB + Mongoose
- **Runtime**: Node.js 20+

## Core Architecture Principles
1. **Separate runtime state from persisted history**
   - Active queue membership, partner pairing, and transient media flags live in `server/src/services/matchmakingService.js`.
   - MongoDB stores session history and moderation records. It does not reconstruct live matchmaking state after a restart.
2. **Treat socket events as an API contract**
   - Keep `client/src/constants/socketEvents.js` and `server/src/socket/events.js` in sync.
   - Preserve the current acknowledgement shape: `{ ok, message?, ... }`.
3. **Keep transport, domain logic, and persistence separate**
   - `registerSocketHandlers.js` should stay thin and only translate socket events into service calls.
   - `MatchmakingService` owns queueing, partner lifecycle, and relay rules.
   - `sessionService.js` owns Mongoose writes and counters.
4. **Keep browser-only resources local on the client**
   - `MediaStream`, `RTCPeerConnection`, DOM refs, and socket listener cleanup belong in components or composables, not a server-style global singleton.
5. **Cleanup is part of the feature**
   - `next`, disconnect, stale signaling, and peer failure paths must close the old peer connection and clear server pairing state before a new search begins.

## Current Repository Status
- `client/src` contains the running UI, media permissions flow, chat, report form, and WebRTC orchestration.
- `server/src` contains Express bootstrapping, Socket.IO signaling, matchmaking, and MongoDB persistence.
- `.github` documents the current architecture and event contracts for future contributors.

## Where To Look First
- Architecture: `.github/docs/architecture/`
- Conventions: `.github/docs/conventions/`
- Flows: `.github/docs/flows/`
- Implementation notes: `.github/docs/webrtc-client-implementation.md`
