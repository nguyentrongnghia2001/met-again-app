---
description: "Generate a Vue 3 component that follows the current Vite and realtime UI conventions"
name: "Generate Vue Component"
argument-hint: "Describe the component, props, events, and UI behavior"
agent: "frontend"
---

Create a new Vue component that fits the current project conventions.

Requirements:
- use Vue 3 Composition API with explicit imports
- keep browser API ownership clear if the component touches media or sockets
- avoid new dependencies unless the task requires them
- prefer props and emitted events over hidden shared state

Expected output:
1. complete component code
2. short usage notes
