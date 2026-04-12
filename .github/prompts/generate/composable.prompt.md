---
description: "Generate a reusable Vue composable for media, socket, or session logic"
name: "Generate Composable"
argument-hint: "Describe the logic to extract, inputs, outputs, and where it will be used"
agent: "frontend"
---

Create a composable that fits the current frontend architecture.

Requirements:
- name it with the `useXxx` pattern
- keep browser APIs and cleanup logic inside the composable when appropriate
- return explicit state and command functions
- make it easy to reason about session resets and stale-event handling

Expected output:
1. complete composable file
2. short example of how the feature should consume it
