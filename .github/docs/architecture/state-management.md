# Pinia State Management Rules (Apps Manager)

## Rule 1. Single Source of Truth
- **NEVER** instantiate localized reactive states for structural page data inside Vue files. (e.g., `const currentData = ref({})`).
- **ALWAYS** compute or `storeToRefs` structural data from `useProjectStore()`.
- Local `ref`/`reactive` is **strictly designed for local UI components** (e.g., Modals overlapping, toggle states (`isOpen`), internal UI processing counters).

## Rule 2. Mutation Isolation
Do not manually mutate `pageData` properties deep in nested DOM without bubbling (`emit`).
If a block is updated (e.g., SEO plugin configuration changes), bubble the result upwards using `emit('updateDataPlugin', newBlock)` or dispatch a direct Pinia action (`projectStore.setComponentConfig`).

## Rule 3. Action Pattern
Store functions inside Pinia `defineStore()` manage complex side-effects (API fetch + state set).
- E.g. `const setHistoryItem = (payload) => { ... }` ensures undo/redo loops remain pristine.

## Rule 4. Permissions Mapping
Use predefined getters explicitly.
```javascript
const { isAdmin, isSEO, isDeveloper } = storeToRefs(useProjectStore());
```
Hide all sensitive editing tools wrapping templates with `v-if="isAdmin"`.
