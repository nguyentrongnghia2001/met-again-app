---
description: "Generate a backend service helper for Socket.IO or Mongoose-backed flows"
name: "Generate Backend Service"
argument-hint: "Describe the use case, inputs, outputs, and whether it changes live state or persisted state"
agent: "backend"
---

Create a backend service method or module that follows the repository boundaries.

Requirements:
- keep socket transport details out of persistence helpers
- keep Mongoose writes inside service-layer helpers instead of handlers
- use clear names that describe the business action
- document any required event or schema updates

Expected output:
1. complete service code
2. where it should be wired into the existing flow
