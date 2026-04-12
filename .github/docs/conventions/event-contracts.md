# Event Contract Rules

## Current Event Families

- `app:*`: general application errors
- `match:*`: queue and pairing actions
- `queue:*`: queue feedback
- `session:*`: lifecycle and moderation actions
- `signal:*`: WebRTC signaling relay
- `chat:*`: text chat between matched peers
- `media:*`: microphone and camera state sync
- `report:*`: confirmation of submitted moderation reports

## Shared Rule

Until the repository has a shared package for event constants, every event change must update both:
- `client/src/constants/socketEvents.js`
- `server/src/socket/events.js`

Treat a mismatch here as a breaking API change.

## Payload Rules

- Include `sessionId` on events that relate to a specific live match whenever the receiver may need to reject stale messages.
- Keep payloads JSON-serializable.
- Do not send browser-only objects such as `MediaStream`, `RTCSessionDescription`, or `RTCIceCandidate` instances without serializing them first.

## Acknowledgement Rules

Current socket handlers use a simple acknowledgement contract:

```js
{ ok: true, ...extraData }
{ ok: false, message: "Human-readable reason" }
```

Preserve this shape unless the protocol is intentionally being versioned.

## Adding A New Event

1. Add the constant on both client and server.
2. Document who emits it and who listens to it.
3. Decide whether it needs an acknowledgement.
4. Decide whether it mutates live runtime state, persisted state, or both.
5. Update the relevant flow doc in `.github/docs/flows/`.
