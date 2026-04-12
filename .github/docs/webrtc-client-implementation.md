# WebRTC Client Implementation Notes

This repository now contains the full browser-side MVP:
- `client/src/composables/useMediaDevices.js`
- `client/src/composables/useVideoChat.js`
- `client/src/services/socket.js`
- `client/src/constants/socketEvents.js`
- `client/src/components/*`

## Recommended Client Structure

Keep one feature-level composable responsible for:
- socket connection lifecycle
- queue and session state
- the active `RTCPeerConnection`
- remote stream handling
- chat and report actions

Keep `useMediaDevices()` focused on local stream concerns only.

## Suggested Sequence

1. Request media permissions before entering the queue.
2. Create the socket with `createSocket()` and connect it.
3. Emit `match:enqueue`.
4. On `match:found`:
   - create a fresh peer connection
   - attach local tracks
   - if `initiator` is true, create an offer and emit `signal:offer`
5. On incoming `signal:*` events:
   - verify the `sessionId`
   - apply remote descriptions or ICE candidates to the active peer connection
6. When the connection becomes stable, emit `session:connected`.
7. On `session:ended`:
   - close the peer connection
   - clear session state
   - optionally requeue if `autoRequeue` is true

## Suggested Peer Connection Ownership

Keep the peer connection in a `shallowRef`:

```js
const peerConnection = shallowRef(null);
```

This avoids unnecessary reactivity while still giving the UI a single owner for cleanup.

## Error Handling Guidelines

- Surface permission errors from `useMediaDevices()` directly in the UI.
- Treat socket acknowledgement failures as user-visible errors.
- Ignore stale signaling events from old sessions.
- Reset the peer connection before starting a new match.

## Current Product Assumption

The server trusts the client to tell it when a session is really connected via `session:connected`. If that assumption changes, update both the client implementation and `persistence-flow.md`.
