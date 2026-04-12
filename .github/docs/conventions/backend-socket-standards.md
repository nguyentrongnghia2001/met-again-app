# Backend Socket Standards

## Folder Boundaries

- `server/src/app.js`: Express middleware and HTTP-only routes
- `server/src/server.js`: process bootstrap, DB connection, Socket.IO startup, graceful shutdown
- `server/src/socket/`: event constants and handler wiring
- `server/src/services/`: domain logic and persistence helpers
- `server/src/models/`: Mongoose schemas only

Keep those roles clear when adding features.

## Socket Handler Pattern

Handlers in `registerSocketHandlers.js` should:
1. receive the socket event
2. call a service method
3. return an acknowledgement payload when applicable
4. catch errors close to the transport edge

Do not embed Mongoose queries or queue mutations directly in the handler body.

## Service Layer Rules

`MatchmakingService` is allowed to:
- read and mutate live socket state
- emit domain events to relevant sockets
- coordinate queue and session transitions

`sessionService.js` is allowed to:
- create and update Mongo documents
- increment counters
- stay unaware of the live socket map

This separation keeps runtime behavior testable and prevents persistence logic from depending on connected sockets.

## Error Handling

- Throw meaningful errors from service methods when the client can act on them.
- Convert thrown errors into `{ ok: false, message }` acknowledgements in socket handlers.
- Use `EVENTS.APP_ERROR` only for async failures that cannot be expressed through the original acknowledgement path.

## Disconnect And Shutdown Rules

- Always unregister a socket through `matchmakingService.unregisterSocket(socket.id)`.
- End or detach the live session before deleting the socket from the in-memory map.
- Keep shutdown order consistent: stop Socket.IO, stop HTTP, disconnect MongoDB.
