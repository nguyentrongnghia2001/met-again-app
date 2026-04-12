# Service Item Management Flow

This document outlines how the **Service Block** is managed, imported, and transformed inside the Apps Manager builder (primarily referenced in `SlideEditPageLayer.vue`).

## 1. Data Structure & Transform Model
Service items rely on custom configuration defined in `transform_model.json` under the `service` key.
* **Wrapper**: The array that holds the service list (e.g., `list_service`).
* **Category/Parent block**: Defines category keys (`title`, `image`, `description_simple`).
* **Product/Item block**: Defines individual service items (`label`, `price`, `description`).
* **Key Reverse Mode**: Certain templates alternate layouts using a boolean toggle (e.g., `is_show_switch_price` or `reverse_column`).

## 2. JSON Import Flow (From 3F / Third-Party)
1. **User Action**: Clicks "Import Service JSON" emitting `@change="handleJsonServiceItem"`.
2. **Parsing Model**: The file reader parses the uploaded array.
3. **Data Mapping (`_mapCategoryServiceToConfig`)**: 
   - Each imported object iterates over `list_service`.
   - Formats prices (`$xx.xx plus string`).
   - Recursively maps `second_cat` and `third_cat` (sub-categories of services).
   - Generates image proxy endpoints via `API.saveImageFrom3FUrl`.
4. **State Push**: Valid objects are appended to `data.value.content_blocks`.
5. **Autosave History**: Deep watch catches the mutation and queues `projectStore.setHistoryItem()`.

## 3. Multiple Selection & Deletion
* Editor supports deleting multiple services at once.
* It verifies whether the block is a service using `parsedDataTransformModel.value?.service?.block?._block_name`.
* If true, enables the `selectAllServiceItem` toggle to collect matched blocks and splice them out safely.

## 4. AI Generator Rules
When writing features or refactoring service components:
* Always read from `projectStore.dataTransformModel` to resolve runtime keys. Never hardcode keys like `list_service` or `product_price` if they are defined in the `transform_model`. 
* Use `getValueByKey` or `findFieldConfigDeep` when determining the correct structure for a service component.
