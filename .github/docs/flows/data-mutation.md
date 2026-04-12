# Data Flow & API Mutators

## 1. Single API Fetch Pattern
All interaction fetching maps back to the core `composables/api.ts` module.
- `GET /project/collection/read` → Pre-fill Page state.
- `POST /project/collection/edit` → Save state diff payload.
- All requests use an abstracted service layer (`API.X()`). Do not define ad-hoc requests inside `.vue` files.

## 2. Unidirectional Data Mutation Flow
1. **User Action**: The User edits a value in `SlideEditPageLayer`.
2. **Local Component Broadcast**: `SlideEditPageLayer` emits `@update:modelValue`.
3. **Store Proxy**: The Store (Pinia/projectStore) captures the modification.
4. **History Delta Engine**: The Store evaluates `watch(pageData, { deep: true })`.
    - If `newData !== originData`: Call `projectStore.setHistoryItem()` adding it to the unsaved queue.
    - If `newData === originData`: Call `projectStore.removeHistoryItem()` (undo optimization).
5. **Persist (API Update)**: Only when the User clicks "Save" does the payload containing `changedHistoryList` items flush to the backend (`API.editPage()`).
6. **Backend CI/CD**: The Backend serializes `.yml`/`.json` content into the file system of the project template builder.

## 3. MQTT Real-Time Edge Cases
- When users edit components, broadcast delta payloads via MQTT.
- Other active clients receive the MQTT ping, calling `projectStore.updateFromRemote(delta)` updating local reactive objects safely avoiding local loopbacks.
