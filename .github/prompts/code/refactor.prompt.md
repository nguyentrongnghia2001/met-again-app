---
description: "Refactor Vue, Socket.IO, or service-layer code safely around the current realtime architecture"
name: "Refactor Realtime Flow"
argument-hint: "Describe the file or flow to refactor and the goal"
---

Refactor the requested code with behavior safety as the first priority.

Required rules:
- keep event contracts stable unless the task explicitly includes a protocol change
- preserve the separation between socket handlers, `MatchmakingService`, and `sessionService`
- on the frontend, keep browser APIs and cleanup logic close to the feature that owns them
- update `.github/docs/` if the refactor changes the intended architecture or flow

Expected output:
1. main code smell or maintenance problem
2. applied refactor steps
3. summary of changed files and why
