---
name: met-again-guide
description: Workspace guide for the Met Again random video chat MVP, including architecture, flows, and common extension patterns.
---

# Met Again Workspace Guide

Use this guide when working on realtime pairing, WebRTC signaling, session persistence, or moderation flows in this repository.

## Project Snapshot

- Frontend: Vue 3 + Vite
- Backend: Express + Socket.IO + Mongoose
- Product shape: random one-to-one video chat MVP
- Live runtime state: in memory inside `server/src/services/matchmakingService.js`
- Persisted state: MongoDB `Session` and `Report` documents

## Read These First

- `.github/copilot-instructions.md`
- `.github/docs/overview.md`
- `.github/docs/architecture/system.md`
- `.github/docs/architecture/state-management.md`

## Core Rules

1. **Do not confuse live state with persisted state**
   - queue membership, partner pairing, and active session ownership are in memory
   - MongoDB stores audit metadata and counters
2. **Treat socket events as a contract**
   - keep `client/src/constants/socketEvents.js` and `server/src/socket/events.js` aligned
   - preserve the `{ ok, message? }` acknowledgement shape unless intentionally changing the protocol
3. **Keep the layers narrow**
   - `registerSocketHandlers.js` wires transport to services
   - `MatchmakingService` owns live domain behavior
   - `sessionService.js` owns Mongoose reads and writes
4. **Keep browser-only objects local**
   - `MediaStream`, `RTCPeerConnection`, and DOM refs belong in composables or feature components

## Common Task Playbooks

### Add a new socket event

1. Add the constant on both client and server.
2. Decide whether the event changes live state, persisted state, or both.
3. Register the handler in `registerSocketHandlers.js`.
4. Implement or extend the relevant service method.
5. Update the matching flow doc in `.github/docs/flows/`.

### Extend session data

1. Update `server/src/models/Session.js` or `server/src/models/Report.js`.
2. Update `server/src/services/sessionService.js`.
3. Only then surface the new data through socket flows or HTTP routes.

### Extend the client call flow

1. Start from `client/src/composables/useMediaDevices.js`.
2. Extend `client/src/composables/useVideoChat.js` for new realtime behavior.
3. Use `client/src/services/socket.js` for the control channel.
4. Keep one owner for the active `RTCPeerConnection`.
5. Ignore stale signaling payloads whose `sessionId` no longer matches.
6. Clean up listeners, peer connections, and tracks on session end.

## Common Pitfalls

- assuming MongoDB can recover active sessions after a restart
- updating only one event constant file and forgetting the other
- registering duplicate socket listeners during reconnects
- leaving media tracks or peer connections alive after `session:ended`
- emitting `session:connected` too early, before the call is truly established

## Useful File Map

- `server/src/server.js`: bootstrap and shutdown
- `server/src/socket/registerSocketHandlers.js`: transport edge
- `server/src/services/matchmakingService.js`: live queue and session logic
- `server/src/services/sessionService.js`: Mongo persistence
- `client/src/composables/useMediaDevices.js`: local media permissions and toggles
- `client/src/services/socket.js`: Socket.IO client factory

## When To Update Docs

Update `.github/docs/` whenever you change:
- the meaning of a socket event
- the owner of a piece of state
- the order of session lifecycle steps
- the persistence rules for sessions or reports
