---
description: "Implement booking-related UI/data flow in Nuxt with existing project patterns"
name: "Booking Task"
argument-hint: "Mô tả tính năng booking cần làm (UI + data + validation)"
agent: "frontend"
---

Thực hiện task thuộc domain booking.

Yêu cầu:
- Bám theo pattern hiện có trong project (metadata/config trước, hardcode sau).
- Nếu có lịch/chọn ngày, ưu tiên `v-calendar` và `dayjs`.
- Nếu có save data, đảm bảo history tracking và flow Pinia nhất quán.
- Tránh phá vỡ route/data structure hiện hữu.
