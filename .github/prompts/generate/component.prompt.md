---
description: "Generate a Vue 3 component for Nuxt 3 using project conventions"
name: "Generate Component"
argument-hint: "Mô tả component cần tạo, props, events, UI behavior"
agent: "frontend"
---

Tạo component mới theo chuẩn dự án.

Bắt buộc:
- Dùng `<script setup lang=\"ts\">`.
- Ưu tiên `@nuxt/ui` components trước khi custom UI.
- Props/Emits typed rõ ràng.
- Không thêm dependency mới nếu chưa cần thiết.
- Nếu có state chung, đọc từ Pinia thay vì duplicate local.

Đầu ra mong muốn:
1. Component code hoàn chỉnh.
2. Giải thích ngắn cách dùng component (props/events).

