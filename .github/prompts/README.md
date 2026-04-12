# Prompts Guide (AI-Ready)

Thư mục `.github/prompts` chứa các prompt template có thể gọi trực tiếp trong chat bằng lệnh `/`.

## Cách dùng nhanh

1. Mở chat Copilot/Cursor trong workspace.
2. Gõ `/` để mở danh sách prompt.
3. Chọn prompt theo nhu cầu (Refactor, Fix Bug, Generate Component...).
4. Nhập mô tả task cụ thể theo `argument-hint`.

## Các prompt sẵn có

### Code
- `/Refactor Vue/Nuxt`
- `/Fix Bug`
- `/Optimize Performance`

### Generate
- `/Generate Component`
- `/Generate Composable`
- `/Generate Service`

### Domain
- `/Booking Task`
- `/Gallery Task`

## Ví dụ câu lệnh thực tế

- `/Refactor Vue/Nuxt Refactor components/SlideEditPageLayer.vue: tách logic upload gallery thành composable, giữ nguyên behavior.`
- `/Fix Bug Sửa bug delete multiple không hoạt động khi wrapper key là list_iframe.`
- `/Generate Component Tạo component Modal xác nhận xoá nhiều section, dùng @nuxt/ui.`
- `/Generate Service Tạo API method getPluginStoreList với typing rõ request/response.`
- `/Gallery Task Tối ưu flow upload nhiều ảnh, hiển thị progress và toast lỗi rõ ràng.`

## Lưu ý

- Prompt là task đơn lẻ, nên mô tả càng cụ thể càng tốt.
- Nếu cần workflow nhiều bước phức tạp, ưu tiên dùng `skills` hoặc `agents`.
