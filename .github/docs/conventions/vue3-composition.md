# Vue 3 + Vite Frontend Conventions

## 1. Use explicit Vue imports

This project uses Vite, not Nuxt. Import Vue primitives explicitly and keep modules in plain JavaScript.

## 2. Keep browser APIs inside composables

Browser-specific logic should be wrapped in composables or feature-local helpers:
- `useMediaDevices()` for media permissions and track toggles
- `useVideoChat()` for socket listeners, peer connection setup, chat, and reporting
- device and permission errors close to the feature that renders them

Return state and command functions rather than mutating DOM directly from unrelated modules.

## 3. Make one place own socket listeners

For each screen or feature:
1. create or inject the socket
2. register listeners once
3. remove listeners on unmount or when replacing the socket

Avoid spreading the same event listeners across multiple components because it makes duplicate handling and stale session bugs much harder to debug.

## 4. Clean up aggressively

When a session ends:
- close the active `RTCPeerConnection`
- detach remote stream references
- clear session metadata before requeueing
- stop or reset local tracks according to the UX
- remove session-scoped socket listeners

## 5. Prefer simple serializable UI state

Use refs for:
- queue status
- session id
- messages
- error banners
- modal visibility

Do not put raw sockets, streams, or peer connections into a general-purpose shared store.

## 6. Follow the existing repository style

- JavaScript modules with ESM syntax
- double quotes
- semicolons
- small focused helpers over large monolithic components
