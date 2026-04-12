# Persistence Flow

## Session Lifecycle In MongoDB

The database stores session metadata for audit and analytics, not live queue coordination.

### 1. Session creation

When two sockets are matched, `createSessionRecord()` creates a `Session` document with:
- two participant socket ids
- `status: "matched"`
- `startedAt`
- zeroed counters

### 2. Connected timestamp

When a client later emits `session:connected`, `markSessionConnected()` updates:
- `status` to `"connected"`
- `connectedAt` to the current time

The update only happens if the session exists and has not already been marked connected.

### 3. Session end

When a session is closed through skip or disconnect, `endSessionRecord()` sets:
- `status` to `"ended"`
- `endedAt`
- `endedReason`

The update only happens once per session.

## Counters

- `incrementSessionMessageCount()` increments `messageCount` for every accepted chat message.
- `createSessionReport()` increments `reportsCount` when a moderation report is stored.

## Report Records

Each `Report` document stores:
- the `sessionId`
- the reporter socket id
- the reported socket id
- a short required reason
- optional details
- `createdAt`

## Important Limitation

If the server crashes, active in-memory sessions may disappear before `endedAt` is written. Any features that require durable live session recovery will need an architectural change beyond the current MVP design.
