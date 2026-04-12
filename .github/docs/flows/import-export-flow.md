# Import / Export JSON Flow

This document describes the new JSON export flow added on top of the existing gallery and service import flows in the Apps Manager builder.

## Scope

Primary implementation files:

- `components/SlideEditPageLayer.vue`
- `utils/import-export.ts`
- `utils/file.ts`
- `constants/import-export.ts`

Reference flow docs:

- `docs/flows/gallery-flow.md`
- `docs/flows/service-flow.md`

---

## 1) UI Entry Points

### 1.1 Gallery

In `SlideEditPageLayer.vue`, the gallery toolbar now shows:

- `Import Gallery`
- `Export Gallery`

The export button uses the same visibility rule as the import button:

- `projectStore.dataTransformModel.gallery.type === 'category'`
- `gallery.wrapper` exists
- `gallery.wrapper_item` exists
- current block matches `gallery.block._block_name`

### 1.2 Service

In `SlideEditPageLayer.vue`, the service toolbar now shows:

- `Import Service Item`
- `Export Service Item`

The export button uses the same visibility rule as the existing service import flow:

- `projectStore.dataTransformModel.service` exists
- `service.page_path` includes `props.currentPath`
- `props.isParentComponent === true`

---

## 2) Shared Helper Layout

To avoid keeping mapping logic inside the component, shared helper code was extracted into:

- `utils/import-export.ts`
  - `getProjectExportSuffix()`
  - `reorderKeys()`
  - `buildGalleryExportPayload()`
  - `buildServiceExportPayload()`
  - service export mapping helpers
- `utils/file.ts`
  - `downloadJsonFile()`

Default values used by export are centralized in:

- `constants/import-export.ts`
  - `DEFAULT_EXPORT_FILE_SUFFIX`
  - `DEFAULT_GALLERY_EXPORT_SHORT_URL`
  - `DEFAULT_SERVICE_EXPORT_STATUS`
  - `DEFAULT_SERVICE_EXPORT_BACKGROUND_COLOR`
  - `DEFAULT_SERVICE_EXPORT_PRICE`

This keeps `SlideEditPageLayer.vue` focused on:

- UI visibility
- runtime transform-model resolution
- validation
- calling helper utilities

---

## 3) Gallery Export Flow

### 3.1 Trigger

1. User clicks `Export Gallery`.
2. `handleExportGallery()` runs.
3. The component reads gallery runtime config from `getConfigGallery()`.

### 3.2 Validation

Export is blocked if any of these are missing:

- `keyParent`
- `keyChild`
- `nameTitleKeyParent`

If the current gallery array is empty, the editor shows `Gallery data not found`.

### 3.3 Payload Mapping

`buildGalleryExportPayload()` maps the current block data into the external JSON structure shaped like `gallery-17173.json`.

Generated payload fields:

- `cat_id`: sequential number starting from `1`
- `cat_name`: mapped from the category title field resolved by `transform_model.gallery.category`
- `cat_shorturl`: derived from page path basename, fallback to slugified category name, final fallback `gallery`
- `meta_title`: same as `cat_name`
- `meta_description`: same as `cat_name`
- additional mapped category-level fields (for example `cat_image`, `cat_image_alt`) are forwarded when the gallery transform model defines them and the editor data contains a value
- `item_gallery[].id`: sequential number starting from `1`
- `item_gallery[].image_alt`: taken from current block item
- `item_gallery[].image`: resolved through `getURL()` so exported links are absolute / publicly accessible
- gallery export skips item images whose source value is neither a `data:image/...` URL nor an `http` URL

### 3.4 Download

After mapping succeeds:

- `downloadJsonFile(payload, \`gallery-<projectId>.json\`)` is called
- success toast: `Export gallery success`

If project id is unavailable, helper fallback is `gallery-data.json`.

---

## 4) Service Export Flow

### 4.1 Trigger

1. User clicks `Export Service Item`.
2. `handleExportServiceItem()` runs.
3. The component resolves runtime keys via `getConfigServiceItem()`.

### 4.2 Validation

Export is blocked if any of these are missing:

- service block name
- product list key (`wrapper`)
- category title key

The component then filters `data.value.content_blocks` by service block name.  
If no service block exists on the page, the editor shows `Service item data not found`.

### 4.3 Payload Mapping

`buildServiceExportPayload()` maps service blocks into the external JSON structure shaped like `service-13716.json`.

Main mapping rules:

- root service blocks become top-level JSON categories
- nested `second_cat` / `third_cat` become `category_children`
- service price text stored in the editor (for example `$35 & Up`) is parsed back into:
  - `price`
  - `price_sell`
  - `price_sale`
  - `price_more`
- when a base amount is recoverable, export writes the same numeric value to both `price` and `price_sell`
- image URLs are exported through `getURL()`
- image filename fields are derived from the stored image value

Generated payload fields:

- `id`: sequential number for each category and service item
- `status`: default `1`
- `background_color`: default `null`
- `price` shape defaults from `DEFAULT_SERVICE_EXPORT_PRICE`

### 4.4 Download

After mapping succeeds:

- `downloadJsonFile(payload, \`service-<projectId>.json\`)` is called
- success toast: `Export service item success`

If project id is unavailable, helper fallback is `service-data.json`.

---

## 5) Known Data Limitations

The editor does not preserve every original third-party field after import.  
Because of that, export intentionally regenerates some values:

- original third-party ids are not restored; sequential ids are generated
- gallery `meta_title` / `meta_description` are derived from category title
- service `price_sell` / `price_more` are reconstructed from the formatted text stored in the editor
- service `image_full_url` points to the current public asset URL, not necessarily the original source URL

This is expected behavior for the current implementation.

---

## 6) Quick Debug Checklist

- [ ] `transform_model.gallery` exists when testing gallery export
- [ ] `transform_model.service` exists when testing service export
- [ ] current block matches the configured gallery block name
- [ ] current page contains service blocks matching `service.block._block_name`
- [ ] `getURL()` returns valid public URLs for exported images
- [ ] `utils/import-export.ts` remains pure and does not depend on Vue component state directly
