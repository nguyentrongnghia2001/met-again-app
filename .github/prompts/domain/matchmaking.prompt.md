---
description: "Work on queueing, pairing, and session lifecycle behavior for the video chat flow"
name: "Matchmaking Task"
argument-hint: "Describe the queue or session behavior to add, fix, or change"
---

Implement the requested matchmaking behavior.

Requirements:
- preserve the rule that live queue and partner state are owned by `MatchmakingService`
- keep disconnect and requeue logic deterministic
- update persistence only when session metadata changes
- document any protocol changes in `.github/docs/flows/matchmaking-flow.md`
