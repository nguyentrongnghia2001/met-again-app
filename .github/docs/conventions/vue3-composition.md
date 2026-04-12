# Vue 3 Composition API & AI Component Generation Rules

## 1. Script Setup Pattern
All component templates must enforce the strict usage of `<script setup lang="ts">`.
* **DO NOT** use `defineComponent` wrapped functions or the Options API.
* Always enforce static typings (`defineProps<{ id: number }>`).

## 2. Reactivity Primitives
* **`ref`**: Preferred default for strings, numbers, arrays, and standard objects meant to track top-level changes or when assigning via `.value`.
* **`reactive`**: Only use `reactive` when implementing forms holding closely coupled states to evade repetitive `.value` access. Use cautiously as reassignment breaking reactivity arrays/objects is commonly miswritten.

## 3. Emitting Events
Do not define manual Vue contexts. Rely strictly on `defineEmits`.
```typescript
const emit = defineEmits<{
  (e: 'updateDataPlugin', data: Record<string, any>): void
  (e: 'remove'): void
}>()
```

## 4. Nuxt Composables Support
Avoid manually injecting `import { ref, computed } from 'vue'` lines. Nuxt implicitly auto-imports all core Vue primitives.

## 5. Performance Guidelines
* Large lists should use virtual-scroll mechanisms.
* `v-once` or `v-memo` for complex static configurations inside UI iterations.
* Never instantiate heavyweight components within aggressive Vue `watch` functions without debouncing logic.
