# Met Again Documentation Overview

This directory is the project context layer for the Met Again random video chat MVP. Use it when changing realtime behavior, media flows, or Mongo-backed session metadata.

## Architecture (`/docs/architecture/`)
- `system.md`: High-level workspace topology, layer boundaries, and where each responsibility lives.
- `state-management.md`: State ownership rules across browser-local state, in-memory server state, and persisted Mongo documents.

## Conventions (`/docs/conventions/`)
- `vue3-composition.md`: Vue 3 + Vite patterns for composables, media handling, cleanup, and socket-driven UI.
- `backend-socket-standards.md`: Folder boundaries and coding rules for Express, Socket.IO, and Mongoose changes.
- `event-contracts.md`: Naming, payload, and acknowledgement rules for socket events.

## Flows (`/docs/flows/`)
- `matchmaking-flow.md`: Queue join, pairing, next-partner, and disconnect behavior.
- `signaling-flow.md`: Offer/answer/ICE relay and when to mark a session as connected.
- `moderation-flow.md`: Chat, media state sync, and report submission behavior.
- `persistence-flow.md`: How sessions and reports are written and updated in MongoDB.

## Implementation Notes
- `webrtc-client-implementation.md`: Recommended client-side orchestration using the existing media and socket primitives.

## Current Focus
- Keep the local MVP stable first.
- Preserve cleanup semantics before adding auth, moderation tooling, or horizontal scaling.
