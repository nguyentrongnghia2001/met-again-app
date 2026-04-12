# Editor Architecture

## 1. High-Level Meta-Driven Architecture
Unlike traditional web interfaces, Apps Manager uses a metadata-driven UI engine.
- Data doesn’t dictate layout structure directly.
- **Blueprints/Config**: Components pull configurations from `projectStore.componentConfig`.
- **Render Engine**: Components (like `SlideEditPageLayer.vue`) iterate over `content_blocks` dynamically loading UI controls instead of hardcoded DOM elements.

## 2. Nuxt 3 File Structure Usage
- UI Pages live under `pages/`. E.g., `pages/organization-[organizationId]/projects/[id]/index.vue`.
- Shared core UI modules live in `components/`. (e.g., Modals, Layouts, Tools).
- Complex Logic is factored explicitly into `composables/`.
- All global memory blocks go into `stores/` (Pinia).

## 3. Core Component Strategy
When building an editing block:
1. Fetch field config: `handleGetFieldConfig(key)`.
2. Do not render literal `<textarea>` or `<input>`, map types based on config via dynamic block structures.
3. Every component updates directly emit standard V-model updates (`@update:modelValue`) to traverse back to the Single Source of Truth (`pageData` mapping in Pinia).
