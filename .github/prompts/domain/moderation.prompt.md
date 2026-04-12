---
description: "Work on chat, report, or media-state moderation flows for an active session"
name: "Moderation Task"
argument-hint: "Describe the chat, reporting, or participant-safety change"
---

Implement the requested moderation or in-session interaction behavior.

Requirements:
- preserve current validation rules unless the task explicitly changes product policy
- keep transient media-state sync separate from persisted moderation data
- route MongoDB writes through `sessionService.js`
- update the relevant flow docs when the contract changes
