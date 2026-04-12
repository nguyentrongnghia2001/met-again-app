---
description: "Fix bug in Vue/Nuxt with root-cause analysis and minimal side effects"
name: "Fix Bug"
argument-hint: "Mô tả bug, file liên quan, expected behavior"
agent: "frontend"
---

Hãy sửa bug theo mô tả người dùng với hướng tiếp cận root-cause.

Checklist thực thi:
- Tái hiện lỗi từ mô tả và xác định nguyên nhân gốc.
- Chỉ sửa đúng phạm vi cần thiết, tránh thay đổi không liên quan.
- Ưu tiên tương thích với metadata-driven UI và Pinia flow.
- Nếu liên quan plugin/block, kiểm tra `_block_name`, wrapper key và history tracking.

Đầu ra mong muốn:
1. Root cause ngắn gọn.
2. Các thay đổi đã áp dụng.
3. Cách verify nhanh (manual/test).
