# State Management Rules

This project does not currently use Pinia or another global client store. State ownership is split by runtime boundary.

## 1. Browser-local state

Keep the following inside the component or composable that directly owns the browser API:
- `MediaStream`
- `RTCPeerConnection`
- permission prompts and device errors
- DOM refs for local and remote video elements
- transient UI flags such as modal visibility or input text

`useMediaDevices()` is the current example of this pattern.

## 2. Feature-level client state

The future call screen will likely own:
- queue status
- current `sessionId`
- partner identity metadata returned by the server
- local chat history
- reconnect and error banners

Until there is a real need for a shared store, keep this state close to the feature that renders it. Avoid introducing a global store just to mirror socket events.

## 3. Server runtime state

`MatchmakingService` is the source of truth for live session coordination:
- which sockets are registered
- who is queued
- who is paired
- which live session id a socket belongs to
- each participant's last known media flags

Do not duplicate this state in Express globals, module-level side tables, or Mongo documents.

## 4. Persisted state

MongoDB stores serializable records only:
- `Session` documents for lifecycle timestamps, end reasons, and counters
- `Report` documents for moderation actions

Persisted state is append/update oriented. It does not drive the live matchmaking loop.

## 5. Rules for future shared client state

If a shared store is introduced later:
1. Store only serializable application state.
2. Do not put `MediaStream`, `RTCPeerConnection`, or raw socket instances into the store.
3. Keep one owner for each piece of state to avoid race conditions between callbacks and watchers.
4. Let the server-issued `sessionId` remain the canonical identifier for a live match.

## 6. Reset behavior

When a session ends or a socket disconnects, reset state in this order:
1. clear feature-level session metadata
2. remove socket listeners tied to the old session
3. close the peer connection
4. stop or repurpose local media tracks as needed by the UX

This ordering prevents stale events from mutating a new session.
