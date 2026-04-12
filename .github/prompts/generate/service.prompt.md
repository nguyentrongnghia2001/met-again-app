---
description: "Generate API service methods following composables/api.ts conventions"
name: "Generate Service"
argument-hint: "Mô tả endpoint, request params/body, response shape"
agent: "backend"
---

Tạo service method mới theo chuẩn `composables/api.ts`.

Yêu cầu:
- Tên hàm rõ nghĩa theo action nghiệp vụ.
- Request/response typing rõ ràng.
- Xử lý lỗi nhất quán với các API hiện có.
- Không hardcode URL rời rạc ngoài cấu hình chung.

Đầu ra mong muốn:
1. Method code đầy đủ.
2. Ví dụ gọi method từ component/composable.
