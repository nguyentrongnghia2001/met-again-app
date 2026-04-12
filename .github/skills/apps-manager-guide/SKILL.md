---
name: apps-manager-guide
description: Comprehensive guide for developing in the Apps Manager platform, including architecture, patterns, and troubleshooting.
---

# Apps Manager - GitHub Copilot Agent Skills

## Project Context
This is an **Apps Manager** (App Builder) platform built with **Nuxt 3**, **Vue 3**, **TypeScript**, and **Pinia**. It enables users to build and manage applications through a metadata-driven UI with real-time collaboration via MQTT.

## Core Architecture Principles

### 1. Metadata-Driven UI Pattern
The system is **configuration-driven**, not hardcoded. The editor dynamically renders based on blueprints/configurations stored in the database.

**Key Rule**: When adding new features, **extend the configuration schema**, don't hardcode UI elements.

```typescript
// ❌ DON'T: Hardcode specific fields
if (key === 'title') return <input type="text" />
if (key === 'description') return <textarea />

// ✅ DO: Use configuration-driven rendering
const config = handleGetFieldConfig(key)
return renderFieldByConfig(config)
```

### 2. Single Source of Truth: Pinia Store
All project state lives in `stores/project.ts`. Never duplicate state in local component refs.

```typescript
// ❌ DON'T: Create local state for persistent data
const projectData = ref({})

// ✅ DO: Use the store
const projectStore = useProjectStore()
const projectData = computed(() => projectStore.projectInfo)
```

### 3. History Tracking
All data mutations must be tracked for undo/redo functionality.

```typescript
import { HistoryType } from '@/constants';

// ✅ Always track changes
projectStore.setHistoryItem({
  path: 'data/pages/home.json',
  type: HistoryType.Modified, // or HistoryType.New ("create")
  file: newData,
  file_type: 'pages',
  name: 'home.json',
})
```

## Common Development Patterns

### Adding New Editable Fields

**Step 1**: Update the configuration schema (usually in database or config files)
**Step 2**: Ensure `utils/get-config.ts` can resolve the field type
**Step 3**: The UI will automatically render based on config

```typescript
// The SlideEditPageLayer component will automatically handle new fields
// if they're properly defined in the config
const fieldConfig = handleGetFieldConfig(key)
```

### Working with Recursive Structures

Use `SlideEditPageLayerChild` for nested objects:

```vue
<SlideEditPageLayerChild
  v-model="data[key]"
  :field-config="fieldConfig"
  @update:modelValue="handleUpdate"
/>
```

### Handling Permissions

Always check role-based permissions before rendering sensitive features:

```vue
<template>
  <UButton 
    v-if="projectStore.isAdmin || projectStore.isSEO"
    @click="editSEOSettings"
  >
    Edit SEO
  </UButton>
</template>

<script setup lang="ts">
const projectStore = useProjectStore()
// Available permission getters:
// - isAdmin, isSEO, isDeveloper, isContentWriter, isDesigner
</script>
```

### Proper Event Propagation

Ensure all v-model updates propagate correctly:

```vue
<script setup lang="ts">
const props = defineProps<{ modelValue: any }>()
const emit = defineEmits(['update:modelValue', 'updateDataPlugin'])

const data = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('updateDataPlugin', value) // For plugin integrations
  }
})
</script>
```

## Component Development Guidelines

### UI Components
- **Use Nuxt UI components first**: `UButton`, `UInput`, `UFormGroup`, `USelectMenu`
- **Tailwind for styling**: Prefer utility classes over custom CSS
- **Responsive by default**: Use `overflow-y-auto`, responsive breakpoints

```vue
<template>
  <UFormGroup label="Title" description="Page title">
    <UInput v-model="title" placeholder="Enter title" />
  </UFormGroup>
</template>
```

### Icons
Use the `defaultBlockIcon` map or config-defined icons:

```typescript
// ❌ DON'T: Hardcode random icons
const icon = 'i-heroicons-star'

// ✅ DO: Use config or default map
const icon = blockConfig.icon || defaultBlockIcon[blockType]
```

### File Operations
Track all file operations in history:

```typescript
import { HistoryType } from '@/constants';

// Moving a file
projectStore.changeHistoryItemPath({ path_file: oldPath, to_path_file: newPath, file_type: 'file' })

// Removing from history (e.g. after delete)
projectStore.removeHistoryPath({ path: filePath, file_type: 'file' })

// Creating/editing a file
projectStore.setHistoryItem({
  path: filePath,
  type: HistoryType.New, // or HistoryType.Modified
  file: data,
  file_type: 'pages',
  name: 'filename.json',
})
```

## Key Files Reference

| File/Folder | Purpose |
|-------------|---------|
| `components/SlideEditPageLayer.vue` | Core editor component - renders dynamic forms |
| `components/SlideEditPageLayerChild` | Handles recursive nested structures |
| `stores/project.ts` | Central state management for projects |
| `utils/get-config.ts` | `findFieldConfigDeep`, `normalizeInputsConfig` – config resolution |
| `composables/useMyFetch.ts` | API request wrapper |
| `pages/organization-[organizationId].vue` | Organization context & MQTT setup |

## Troubleshooting Checklist

### Field Not Showing in Editor
1. Check if field exists in the blueprint/config (database)
2. Verify `handleGetFieldConfig(key)` returns valid config
3. Check if field has proper permissions

### Permission Issues
1. Verify user's `logged_role` in `projectStore.projectInfo`
2. Check permission getters: `isAdmin`, `isSEO`, etc.
3. Ensure UI elements have proper `v-if` guards

### State Not Updating
1. Confirm using `projectStore` instead of local state
2. Check event propagation chain (`update:modelValue`)
3. Verify watchers are properly set up

### Build Errors
1. Check `projectStore.buildLog` for error messages
2. Verify `projectStore.buildStatus`
3. Look at terminal output for detailed errors

## Code Style & Best Practices

### TypeScript
- Avoid `any` where possible - use proper interfaces from `types/`
- Define prop types explicitly
- Use TypeScript generics for reusable components

```typescript
// ✅ Good
interface Props {
  modelValue: Record<string, any>
  fieldConfig: FieldConfig
}

// ❌ Avoid
const props: any
```

### Vue 3 Composition API
- Use `<script setup>` syntax
- Destructure with proper reactivity (`toRefs`, `computed`)
- Keep composables in `composables/` folder

```typescript
// ✅ Preferred setup
<script setup lang="ts">
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const projectStore = useProjectStore()
const computedValue = computed(() => props.modelValue)
</script>
```

### Naming Conventions
- Components: PascalCase (`SlideEditPage.vue`)
- Composables: camelCase with `use` prefix (`useMyFetch.ts`)
- Constants: UPPER_SNAKE_CASE (`ROLE_AUTH`)
- Types: PascalCase with descriptive names (`ProjectInfo`)

## Real-Time Features (MQTT)
- MQTT connection initialized in `organization-[organizationId].vue`
- Use for collaborative editing features
- Handle connection state properly (connecting, connected, disconnected)

```typescript
// MQTT message handling pattern
mqttClient.on('message', (topic, message) => {
  const data = JSON.parse(message.toString())
  // Handle real-time updates
  projectStore.updateFromRemote(data)
})
```

## Testing & Debugging

### Debug Mode
- Check console logs in browser DevTools
- Use Vue DevTools for component inspection
- Monitor Pinia store state changes

### Common Debug Points
1. `handleGetFieldConfig()` - field configuration resolution
2. `projectStore.setHistoryItem()` - history tracking
3. Event emission chain in `SlideEditPageLayer`

## Quick Reference Commands

```bash
# Development
pnpm run dev

# Build
pnpm run build

# Type checking
pnpm run type-check

# Linting
pnpm run lint
```

---

## Summary for AI Agents

When working on this codebase:
1. **Think configuration-first**: Extend schemas, don't hardcode
2. **Use the store**: All persistent state goes through Pinia
3. **Track history**: Every data mutation needs history tracking
4. **Check permissions**: Always verify user roles before rendering features
5. **Follow the pattern**: Look at existing components for reference
6. **Propagate events**: Ensure v-model updates flow correctly
7. **Use Nuxt UI**: Consistent component library usage

The system's power comes from its **metadata-driven architecture**. Understanding this principle is key to making effective changes.
