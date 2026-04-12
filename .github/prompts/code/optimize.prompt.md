---
description: "Optimize realtime or media performance without changing product behavior"
name: "Optimize Realtime"
argument-hint: "Describe the slow area, symptoms, and performance goal"
---

Optimize the requested area without changing the intended behavior.

Focus areas:
- reduce duplicate socket listeners or unnecessary reconnect work
- limit repeated WebRTC setup and teardown churn
- keep media and session cleanup deterministic
- avoid adding complexity unless the current bottleneck justifies it

Expected output:
1. main bottleneck
2. applied optimization
3. how to measure or verify the improvement
