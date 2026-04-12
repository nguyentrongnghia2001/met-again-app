---
description: "Work on gallery/media flows including upload, mapping, and bulk actions"
name: "Gallery Task"
argument-hint: "Mô tả task gallery (upload, edit, delete nhiều item, import JSON)"
agent: "frontend"
---

Thực hiện task domain gallery/media.

Yêu cầu:
- Tương thích logic upload hiện tại và key mapping trong transform model.
- Hỗ trợ thao tác bulk (select all/delete multiple) nếu có.
- Đảm bảo phản hồi UI rõ (loading/success/error toast).
- Không phá vỡ cấu trúc dữ liệu hiện có trong `content_blocks`.
