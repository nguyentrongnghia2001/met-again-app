# Gallery Flow (Show/Hide + Import)

## Scope

Tài liệu này mô tả luồng gallery trong editor dựa trên source thực tế:

- `components/SlideEditPageLayer.vue`
- `pages/organization-[organizationId]/projects/[id].vue`
- `C:\Dtsmart\fix-web-app-manager\10018-8403\transform_model.json`
- `C:\Dtsmart\fix-web-app-manager\10018-8403\component-library\components\gallery\home.yml`

Mục tiêu: làm rõ điều kiện hiển thị nút, hành vi import gallery, và mapping dữ liệu vào schema block.

---

## 1) Điều kiện nền để flow gallery hoạt động

Trong `[id].vue`:

1. Page load `transform_model.json` bằng API `readFile`.
2. Dữ liệu được set vào `projectStore.dataTransformModel`.

Trong `SlideEditPageLayer.vue`:

- `parsedDataTransformModelGallery` đọc từ `projectStore.dataTransformModel.gallery`.

Nếu thiếu `transform_model.json` hoặc parse lỗi -> flow gallery sẽ không bật đầy đủ.

---

## 2) Mapping gallery từ `transform_model.json`

Mapping đang dùng (template production):

- `block._block_name = gallery/home`
- `wrapper = gallery_items`
- `wrapper_item = items_gallery`
- `category.title.external_key = category_title`
- `page_path = content/gallery.yml`

Schema tham chiếu từ component library:

- `component-library/components/gallery/home.yml`
- blueprint có cấu trúc:
  - `gallery_items[]`
  - `gallery_items[].items_gallery[]`
  - item con chứa `image`, `image_alt`, `is_hot`, `priority`, `created_at`

---

## 3) Show/Hide button trong UI gallery

## 3.1 Nút `Import Gallery`

Điều kiện hiển thị (`isShowButtonImportGallery`):

- `gallery.type === 'category'`
- có `gallery.wrapper`
- có `gallery.wrapper_item`
- block hiện tại (`props.modelValue._block_name`) trùng `gallery.block._block_name`

=> Chỉ hiện ở đúng block gallery tương ứng (vd `gallery/home`).

## 3.2 Nút `Edit Page Gallery` và `Add Multiple Images`

Điều kiện:

- key đang render phải là `wrapper_item`
- `isShowBtnUploadMultiImage = true` (gallery type category + đúng block)
- `!isEditData`

## 3.3 Nhóm thao tác theo selection (Category / Delete / Edit)

Toolbar theo array item hiển thị khi:

- `(key === wrapperItem && isShowBtnUploadMultiImage) || listKeyCanDeleteMultiply.includes(key)`
- `selectedBlocks.length > 0`
- `!isEditData`

Trong đó:

- `Category` chỉ hiện khi `isShowBtnChangeTagGallery = true`
- `Delete` luôn hiện trong điều kiện selection
- `Edit` hiện khi key đúng `wrapper_item`

## 3.4 Nút `Add block` cho array

Nút `Add block` bị ẩn với key `wrapperItem` (để tránh phá flow gallery), trừ khi:

- `projectStore.isEditDataJson = true`

---

## 4) Flow import gallery từ file JSON

## 4.1 Trigger

- User click `Import Gallery`
- gọi `handleImportGalleryForm3f()`
- mở input file `#files-json` (`inputJsonGalleryRef.click()`)

## 4.2 Parse và validate

`handleJsonGallery()`:

1. lấy file JSON đầu tiên
2. parse qua `parseDataInJsonFile(file)`
3. validate data khác rỗng
4. lấy config bằng `getConfigGallery()` gồm:
   - `keyParent` = `wrapper` (vd `gallery_items`)
   - `keyChild` = `wrapper_item` (vd `items_gallery`)
   - `configItemGalleryParent` từ blueprint parent (đã bỏ key child)
   - `configItemGalleryChild` từ blueprint child item
   - `nameTitleKeyParent` map từ `external_key = category_title`

Nếu thiếu bất kỳ phần nào -> toast lỗi `Config import gallery invalid`.

## 4.3 Biến đổi dữ liệu import

Cho mỗi category trong JSON import:

1. map `gallery.item_gallery[]`
2. với mỗi ảnh:
   - gọi `getUrlImage(child.image)` -> `API.saveImageFrom3FUrl`
   - nếu thành công trả URL public
   - tạo item child:
     - kế thừa `configItemGalleryChild`
     - ghi đè `image`
     - ghi đè `image_alt`
3. tạo `dataItem` parent:
   - kế thừa `configItemGalleryParent`
   - set `[nameTitleKeyParent] = gallery.cat_name`
   - set `[keyChild] = galleryItems`
4. push vào `data.value[keyParent]`

Kết thúc: toast `Import gallery success`.

---

## 5) Flow upload nhiều ảnh gallery (manual)

Ngoài import JSON, gallery còn có flow upload nhiều ảnh local:

1. click `Add Multiple Images`
2. mở input `#files`
3. `handleFileUpload()` chạy:
   - lọc file <= `SIZE_ALLOW_UPLOAD_IMAGE`
   - upload batch (size 10) với `API.uploadAssetMultipleNotSaveFile`
   - tạo preview base64 tạm (`convertFileToBase64`)
   - async put S3 bằng `API.saveImageInS3`
   - khi có S3 URL thì `updateImageUrl()` cập nhật item
4. gọi `handleAddArrItem()` để chèn item vào đúng mảng wrapper
5. set `imagesUpdated`, `selectAllUploadedImages` để hỗ trợ thao tác hàng loạt sau upload

---

## 6) Flow edit/delete/category hàng loạt

- `handleEditLayer()`:
  - mở modal edit cho selected items
  - `savePopupEdit()` merge field thay đổi vào từng item đã chọn
- `handleDeleteSelected()`:
  - lọc item theo `selectedBlocks`
  - confirm modal
  - cập nhật mảng và reset selection
- `handleEditCategoryGallery()`:
  - mở modal đổi category cho các item đã chọn
  - submit -> emit `update-tag-gallery`

---

## 7) Tương quan với dữ liệu thực tế template

Từ `content/gallery.yml` có block:

- `_block_name: gallery/home`
- `gallery_items[]`
- `gallery_items[].items_gallery[]`

=> Khớp hoàn toàn với:

- `transform_model.gallery`
- blueprint `component-library/components/gallery/home.yml`
- logic import trong `SlideEditPageLayer.vue`

---

## 8) Checklist debug nhanh

- [ ] `projectStore.dataTransformModel` có `gallery` chưa?
- [ ] block đang edit có `_block_name` đúng `gallery/home`?
- [ ] `wrapper` + `wrapper_item` có tồn tại trong transform model?
- [ ] JSON import có `item_gallery` và link ảnh hợp lệ?
- [ ] `API.saveImageFrom3FUrl` có trả URL?
- [ ] Schema block trong `componentConfig` có đúng cấu trúc `gallery_items/items_gallery`?
