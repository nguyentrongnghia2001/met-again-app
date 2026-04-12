# Matchmaking Flow

## Goal

Pair two idle sockets into a live session and keep queue behavior predictable when users skip, disconnect, or fail mid-session.

## Entry Points

- `match:enqueue` -> `matchmakingService.joinQueue(socket.id)`
- `match:next` -> `matchmakingService.nextPartner(socket.id)`
- socket disconnect -> `matchmakingService.unregisterSocket(socket.id)`

## Queue Join

1. The socket must already be registered in `registerSocketHandlers.js`.
2. `joinQueue()` rejects the request if the user already has an active partner.
3. Eligible sockets are added to the in-memory queue and immediately receive `queue:joined`.
4. `processQueue()` attempts to consume the queue in pairs.

## Pairing Logic

`processQueue()`:
1. filters out disconnected or ineligible sockets
2. shifts two socket ids from the queue
3. creates a `Session` document through `createSessionRecord()`
4. stores `partnerId`, `sessionId`, and `connecting` state in memory
5. emits `match:found` to both peers

The first peer receives `initiator: true`, which is intended to drive the first WebRTC offer.

## Next Partner Behavior

- If the user is already in a session, `nextPartner()` calls `leaveSession()` with `requeueSelf` and `requeuePartner` set to `true`.
- Both peers receive `session:ended`.
- Both peers can be re-enqueued automatically if they are still connected.

## Disconnect Behavior

When a socket disconnects:
1. the service tries to end the current live session
2. the remaining partner receives `session:ended`
3. the remaining partner can be requeued automatically
4. the disconnected socket is removed from both queue and client map

## Important Constraint

The queue and active partner map live only in memory. Restarting the server clears all live matchmaking state.
