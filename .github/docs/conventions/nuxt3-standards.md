# Nuxt 3 AI Generation Standards

## 1. Directory Structure Roles
* `components/`: UI level logic only. Complex processing should be hoisted to parent components or Pinia store.
* `composables/`: Reusable processing (factories, logic hooks). E.g., `useUpload.ts`. Files must NOT directly mutate Document Elements (DOM).
* `layouts/`: Shared wrappers (`default.vue`, etc.).

## 2. Data Fetching Pattern
* Direct REST fetching must leverage `composables/api.ts` which returns responses in Nuxt API format wrapper.
* Do not call `fetch()` directly in custom logic bypassing user authentication payloads and Base URLs.

## 3. Auto-imports Strict Usage
Do **not** generate redundant import files in agent outputs:
```typescript
// ❌ WRONG
import { useRoute, useRouter } from 'vue-router'

// ✅ CORRECT: Rely on Auto-imports
const route = useRoute()
const router = useRouter()
```
