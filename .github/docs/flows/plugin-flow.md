# Plugin Install & Runtime Data Flow

## Scope

Luồng này được xác minh theo:

- Template production: `C:\Dtsmart\fix-web-app-manager\10018-8403`
- Plugin folder: `C:\Dtsmart\fix-web-app-manager\10018-8403\plugin`
- Editor: `C:\Dtsmart\apps-manager`

---

## A) Luồng cài thêm plugin từ Apps Manager

```text
User click "Add Plugin"
	-> pages/.../plugins/index.vue (open ModalPlugin)
	-> ModalPlugin.vue gọi API.getPluginStoreList(project_id, name)
	-> User click Install
	-> API.installPlugin(project_id, plugin_identity)
	-> Refresh API.getPluginProjectList(project_id)
	-> Refresh API.getProjectComponentConfig(project_id)
	-> projectStore.setComponentConfig(...)
	-> pluginStore.setPluginSystem(...system plugins...)
	-> Side menu Plugins Settings được cập nhật
```

### API call chain

1. `GET /project/plugin-store`
2. `POST /project/project-plugin/install`
3. `GET /project/project-plugin`
4. `GET /project/project-component`

### Kết quả mong đợi

- Plugin mới xuất hiện trong bảng plugins project.
- Nếu plugin có `system`, sẽ xuất hiện route cấu hình trong menu **Plugins Settings**.
- Plugin block xuất hiện trong danh sách **Add new section** của editor (`SlideEditPageLayer`).

---

## B) Luồng uninstall / upgrade / change status

### Uninstall

```text
plugins/index.vue
	-> confirm modal
	-> API.unInstallPlugin(project_id, plugin_identity)
	-> refresh plugin list + component config
```

### Upgrade

```text
plugins/index.vue
	-> confirm modal
	-> API.upgrateVersionPlugin(project_id, plugin_identity)
	-> refresh plugin list + component config
```

### Change status

```text
plugins/index.vue
	-> toggle status
	-> API.changeStatusPlugin(project_id, plugin_identity, status)
	-> refresh plugin list + component config
```

---

## C) Luồng edit plugin system data (`plugin/plugin_system_data.json`)

Route: `pages/organization-[organizationId]/projects/[id]/plugins/[name].vue`

```text
Open /plugins/:name
	-> API.getConfigPluginSystem(project_id)
	-> API.getDataSystemPlugin(project_id)
	-> lấy block _block_name === :name
	-> mount SlideEditPageLayer (is-plugin = true)
	-> user edit form
	-> emit updateDataPlugin
	-> update dataChange.content_blocks
	-> setHistoryItem(path="plugin/plugin_system_data.json")
```

Khi data quay về đúng origin snapshot:

- gọi `removeHistoryItem(...)` cho file `plugin/plugin_system_data.json`

Khi data khác origin:

- gọi `setHistoryItem(...)` để đưa vào hàng đợi save.

---

## D) Luồng add plugin block vào page content

Trong `components/SlideEditPageLayer.vue`:

```text
blockContentItems
	= projectStore.componentConfig
		.filter(item is block-capable && !is_plugin_old)

User click "Add new section"
	-> handleAddContentBlock(item)
	-> content_blocks.push({
			 _block_name: item.sub_path.replace('.yml', ''),
			 ...item.json.blueprint
		 })
	-> watch deep -> setHistoryItem
```

Sau khi save thành công, backend ghi vào `content/*.yml`.

Template runtime sẽ render block plugin nhờ:

```vue
<component :is="block._block_name" ... />
```

### D.1 Cấu hình để bật delete multiple item (tham chiếu iframe-plugin)

Trong editor `SlideEditPageLayer.vue`, danh sách key được phép delete nhiều item lấy từ:

- `transform_model.wrapper` (global, từ `transform_model.json`), và
- `json.transform_model.wrapper` của plugin (khi đang edit plugin).

Nghĩa là muốn dùng **Delete selected** cho một list, cần đảm bảo key mảng trong `blueprint` trùng với `wrapper` đã config.

#### Mẫu đúng (iframe-plugin)

Từ `plugin/iframe-plugin/index.yml`:

```yml
blueprint:
	list_iframe:
		- label: Video 1
			link: https://...

transform_model:
	wrapper: 'list_iframe'
```

=> `list_iframe` sẽ nằm trong `listKeyCanDeleteMultiply`, từ đó UI cho phép delete nhiều item.

#### Mẫu tương ứng ở `transform_model.json` (global blocks)

```json
{
	"coupon": {
		"wrapper": "data_coupon"
	},
	"banner": {
		"wrapper": "banner_items"
	}
}
```

=> Các key như `data_coupon`, `banner_items` cũng được phép delete multiple nếu tồn tại trong model.

#### Checklist cấu hình nhanh

- [ ] Trong `index.yml`, field list là mảng (vd: `list_iframe: []`).
- [ ] `transform_model.wrapper` trùng chính xác key list trong `blueprint`.
- [ ] Nếu là block global, `transform_model.json` có `wrapper` tương ứng.
- [ ] Key không bị lệch tên/sai case (vd `list_iframe` khác `listIframe`).
- [ ] Dữ liệu runtime thực tế có key đó trong `modelValue`.

#### Các lỗi thường gặp

1. Có list trong `blueprint` nhưng thiếu `transform_model.wrapper` -> không hiện delete multiple.
2. `wrapper` trỏ sai key -> bấm delete multiple không tác động list mong muốn.
3. Chỉ sửa `index.yml` nhưng quên đồng bộ dữ liệu/response cấu hình mới -> UI còn stale.

---

## E) Runtime flow trong template `10018-8403`

## E.1 Plugin block theo page

- `pages/[...slug].vue` render toàn bộ `formattedPage.content_blocks` bằng `_block_name`.
- Ví dụ:
	- `contact-plugin`
	- `iframe-plugin`
	- `announcement`

## E.2 Plugin system toàn cục

- `app.vue` import `~/plugin/plugin_system_data.json`
- render `pluginData.content_blocks` bằng `_block_name` (ví dụ `seo`, `newzen-effect`).

## E.3 Plugin-specific data

- `plugin/data.json` được plugin component/trang manage-plugin đọc (ví dụ tenant ID giftcard/contact).

---

## F) File side-effects khi cài plugin (backend level)

Tối thiểu cần có (sau khi backend xử lý install):

1. `plugin/plugin.json` có entry plugin mới.
2. `plugin/<plugin-name>/` có:
	 - `index.vue`
	 - `index.yml`
	 - `plugin.json`
	 - optional: `system.yml`, `assets/`
3. Nếu plugin system: `plugin/plugin_system_data.json` có block cấu hình tương ứng.
4. `project-component` response chứa schema plugin để editor render.

---

## G) Checklist khi thêm plugin mới

- [ ] `plugin_identity` là duy nhất.
- [ ] `path_component` trỏ đúng `index.vue`.
- [ ] `path_component_library_block` trỏ đúng `index.yml`.
- [ ] Nếu plugin system: có `system` + `path_component_library_system`.
- [ ] `_block_name` trong content trùng component name runtime.
- [ ] Editor thấy plugin trong:
	- Add new section (block plugin)
	- Plugins Settings menu (system plugin)
- [ ] Chỉnh sửa plugin tạo history đúng file:
	- `plugin/plugin_system_data.json`

---

## H) Các điểm dễ lỗi

1. Mismatch `_block_name` và component name -> plugin không render.
2. Thiếu `path_component_library_block` -> không xuất hiện trong Add section.
3. Thiếu `system` object -> không xuất hiện trong Plugins Settings.
4. Không refresh `getProjectComponentConfig` sau install -> UI editor chưa thấy plugin mới.
5. Không track history file plugin -> bấm Save không đẩy thay đổi plugin system.

---

## J) Race conditions & consistency rules

### J.1 Double-click install / spam action

- Triệu chứng: cùng plugin bị gọi `installPlugin` nhiều lần liên tiếp.
- Khuyến nghị:
	- Disable nút thao tác trong lúc request pending.
	- Chỉ refresh danh sách sau response cuối cùng.
	- Backend nên idempotent theo `plugin_identity`.

### J.2 Stale component config

- Triệu chứng: install thành công nhưng Add section chưa có plugin.
- Nguyên nhân: chỉ refresh plugin project list mà quên refresh `project-component`.
- Fix chuẩn: luôn chạy cặp refresh:
	1. `getPluginProjectList`
	2. `getProjectComponentConfig`

### J.3 Editing plugin system sai block

- Triệu chứng: chỉnh `/plugins/:name` nhưng không thấy thay đổi runtime.
- Nguyên nhân: không map đúng `_block_name === :name` trong `content_blocks` của `plugin_system_data.json`.
- Fix chuẩn: assert block tồn tại trước khi mount form; nếu thiếu, báo lỗi rõ ràng.

---

## K) Save/Deploy integration (khi plugin data thay đổi)

Khi plugin system config đã vào `changedHistoryList`, luồng save tuân theo chuẩn chung của editor:

1. Duyệt `changedHistoryList`.
2. Gửi payload file thay đổi về backend.
3. Backend ghi file (`plugin/plugin_system_data.json`) và trigger pipeline build/deploy.
4. FE nhận trạng thái thành công, xoá item khỏi history.

Điểm cần kiểm thử:

- [ ] Save 1 thay đổi plugin duy nhất.
- [ ] Save đồng thời plugin + page content.
- [ ] Revert về origin -> history item bị remove đúng.

---

## L) Playbook vận hành nhanh (production support)

Khi có ticket “plugin không hiện/không update”, xử lý theo thứ tự:

1. Kiểm tra plugin đã có trong `project-plugin` list chưa.
2. Kiểm tra response `project-component` đã chứa schema plugin chưa.
3. Kiểm tra `_block_name` trong `content/*.yml` hoặc `plugin_system_data.json`.
4. Kiểm tra plugin status/is_plugin_old.
5. Kiểm tra history item path đúng file trước khi Save.
6. Kiểm tra runtime template có auto-import được component từ `~/plugin`.

Nếu fail ở bước nào, fix từ bước đó rồi mới test end-to-end lại từ đầu luồng.
