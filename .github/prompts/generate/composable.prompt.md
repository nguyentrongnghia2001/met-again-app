---
description: "Generate a Nuxt composable with typed API and reusable logic"
name: "Generate Composable"
argument-hint: "Mô tả logic cần tách, input/output, nơi sử dụng"
agent: "frontend"
---

Tạo composable mới theo pattern Nuxt 3.

Yêu cầu:
- Đặt tên theo `useXxx`.
- Tách logic thuần khỏi component, tránh thao tác DOM trực tiếp.
- Có typing rõ cho params/returns.
- Dễ unit test và tái sử dụng.

Đầu ra mong muốn:
1. File composable hoàn chỉnh.
2. Ví dụ cách dùng trong component.
