---
description: "Refactor Vue/Nuxt code safely with Pinia and metadata-driven architecture"
name: "Refactor Vue/Nuxt"
argument-hint: "Nêu file hoặc component cần refactor + mục tiêu"
agent: "frontend"
---

Refactor code theo yêu cầu người dùng, ưu tiên an toàn hành vi và readability.

Yêu cầu bắt buộc:
- Giữ nguyên behavior hiện tại (không đổi output UI/API nếu không được yêu cầu).
- Tuân thủ [Vue 3 conventions](../../docs/conventions/vue3-composition.md).
- Tuân thủ [Nuxt 3 standards](../../docs/conventions/nuxt3-standards.md).
- Không tách state ra local nếu thuộc global flow; dùng Pinia đúng theo [state-management](../../docs/architecture/state-management.md).
- Ưu tiên tận dụng Nuxt UI component đang có trong dự án.

Đầu ra mong muốn:
1. Nêu vấn đề chính trong code hiện tại.
2. Áp dụng refactor theo từng bước nhỏ, có thể kiểm chứng.
3. Tóm tắt file đã sửa và lý do.

