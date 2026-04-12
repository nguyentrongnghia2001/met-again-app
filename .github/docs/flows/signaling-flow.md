# Signaling Flow

## Goal

Relay WebRTC negotiation data between already matched peers while keeping session boundaries explicit.

## Match Found

After `match:found`, the client should:
1. create or reuse the local media stream
2. create the peer connection
3. branch on `initiator`

Recommended behavior:
- initiator creates the offer and emits `signal:offer`
- non-initiator waits for the offer, applies it, creates an answer, then emits `signal:answer`

## Relay Rules

The server does not negotiate WebRTC itself. `MatchmakingService.handleSignal()`:
- verifies the sender still has an active partner
- looks up the sender's current `sessionId`
- forwards the payload to the partner

The forwarded payload includes:
- `sessionId`
- `sourceSocketId`
- the serialized signaling data

## ICE Candidates

ICE candidates use the same relay pattern as offers and answers:
- sender emits `signal:ice-candidate`
- server forwards it only to the current partner

## Marking A Session As Connected

`session:connected` is a client-to-server hint that the WebRTC call is actually established.

Recommended client timing:
- emit it once the peer connection reaches a stable connected state, not immediately after `match:found`

The server currently updates `connectedAt` only if the session id matches the sender's active session.

## Stale Event Protection

Client code should ignore forwarded signaling payloads when:
- the `sessionId` does not match the active session
- the peer connection has already been closed
- a newer session has already started

This prevents late offers or ICE candidates from mutating a new match.
