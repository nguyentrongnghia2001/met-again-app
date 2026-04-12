---
description: "Fix a Vue, Node, or Socket.IO bug with root-cause analysis and minimal side effects"
name: "Fix Bug"
argument-hint: "Describe the bug, affected files, and expected behavior"
---

Fix the reported bug with a root-cause-first approach.

Execution checklist:
- reproduce or reason from the current code path before changing behavior
- keep the fix as small as possible
- preserve the socket acknowledgement contract and event names unless the task explicitly changes them
- if the bug touches realtime flows, verify whether it belongs in the client UI, `MatchmakingService`, or `sessionService`

Expected output:
1. short root cause summary
2. applied fix
3. quick verification steps
