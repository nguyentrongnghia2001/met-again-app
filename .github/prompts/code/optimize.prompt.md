---
description: "Optimize Vue/Nuxt performance without changing product behavior"
name: "Optimize Performance"
argument-hint: "Nêu vùng chậm (component/page), triệu chứng, mục tiêu"
agent: "frontend"
---

Tối ưu hiệu năng cho phần người dùng yêu cầu.

Ưu tiên kỹ thuật:
- Giảm re-render không cần thiết (computed/watch hợp lý, tách logic nặng).
- Tận dụng `v-memo`/`v-once` khi phù hợp.
- Tránh deep watch quá rộng nếu có thể khoanh vùng key.
- Giữ nguyên behavior hiện tại và API contract.

Đầu ra mong muốn:
1. Điểm nghẽn chính.
2. Thay đổi tối ưu đã thực hiện.
3. Cách đo/check trước-sau (nếu có thể).
