# System Architecture

## Runtime Topology

```text
Vue 3 + Vite client
- media permissions and local tracks
- future WebRTC peer orchestration
- socket.io-client control channel
            |
            v
Express HTTP server + Socket.IO server
- /health endpoint
- event handler registration
- matchmaking and relay rules
            |
            v
MongoDB
- Session documents
- Report documents
```

## Layer Responsibilities

### 1. Client layer
- `client/src/composables/useMediaDevices.js` owns camera and microphone permission requests, track toggling, and local stream cleanup.
- `client/src/composables/useVideoChat.js` owns socket listeners, active session state, WebRTC setup, chat, reporting, and teardown.
- `client/src/services/socket.js` creates the Socket.IO client connection.
- `client/src/constants/socketEvents.js` mirrors the server event names.
- `client/src/components/*` stays presentational and emits user intent upward.

### 2. Transport layer
- `server/src/server.js` boots Express, connects MongoDB, starts Socket.IO, and handles shutdown.
- `server/src/socket/registerSocketHandlers.js` maps socket events to service methods and standard acknowledgement payloads.
- `server/src/socket/events.js` is the server-side event contract definition.

### 3. Domain layer
- `server/src/services/matchmakingService.js` owns active runtime state:
  - registered sockets
  - queue membership
  - partner pairing
  - session ids attached to live sockets
  - last known media flags
- This state is intentionally in-memory. A server restart clears the active queue and active sessions.

### 4. Persistence layer
- `server/src/services/sessionService.js` writes session and report data through Mongoose.
- `server/src/models/Session.js` stores session lifecycle metadata and aggregate counters.
- `server/src/models/Report.js` stores moderation reports tied to a session.

## Key Design Rules

1. Socket handlers should translate transport events into service calls, not implement business rules inline.
2. `MatchmakingService` should remain the only owner of live pairing state.
3. MongoDB is an audit and analytics store for sessions and reports, not a live queue coordinator.
4. Client and server event constants must stay aligned until a shared package exists.
5. Browser resources such as streams and peer connections must be explicitly cleaned up on session end and unmount.

## Extension Points

- To add a new socket feature, update both event constant files, register the handler, and decide whether it mutates runtime state, persisted state, or both.
- To add new session metadata, extend the Mongoose models and `sessionService.js` first, then surface the fields through socket flows if needed.
- To add frontend call behavior, compose around `useMediaDevices()` and `useVideoChat()` rather than creating parallel connection helpers.
