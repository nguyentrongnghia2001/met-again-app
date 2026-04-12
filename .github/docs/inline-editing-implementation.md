# Inline Editing Flow - Detailed Implementation Guide

## 📌 Overview

Inline editing cho phép người dùng chỉnh sửa content trực tiếp trên preview website mà không cần mở form panel. Để thực hiện điều này, chúng ta sử dụng 3 công nghệ chính:

1. **postMessage API** - Giao tiếp cross-iframe
2. **newzen-connector** - Library inline editing trong preview
3. **Toolbar Button** - UI để trigger edit

---

## 🏗️ Architecture

```
┌──────────────────────────────────┐
│   APPS MANAGER (Editor)          │
│                                  │
│  SlideEditPage.vue              │
│  • Listens: window.addEventListener('message')
│  • Handler: TEMPLATE_EDIT_INLINE_BLOCK_WITH_TOOLBAR
│  • Action: Updates pageData via setNestedValue()
│  • Update: postMessage UPDATE to iframe
│                                  │
└──────────────────────────────────┘
              ↑↓
         postMessage
              ↑↓
┌──────────────────────────────────┐
│  BASE-SOURCE-TEMPLATE (iframe)   │
│                                  │
│  newzen-connector instance       │
│  • setupEditableElement()        │
│  • Shows toolbar on hover        │
│  • Emits TEMPLATE_EDIT_INLINE... │
│    when toolbar clicked          │
│                                  │
│  HTML Element (content_blocks[0].title)
│  • Class: .editable-field       │
│  • Class: .editable-field--hover │
│  • Contains: .editable-toolbar-button
│                                  │
└──────────────────────────────────┘
```

---

## 📋 Step-by-Step Implementation

### Phase 1: Setup in Base-Source-Template

#### 1.1 Install newzen-connector

**File**: `base-source-template/package.json`
```json
{
  "dependencies": {
    "newzen-connector": "file:../newzen-connector"
  }
}
```

**Nuxt Config**: `nuxt.config.ts`
```typescript
export default defineNuxtConfig({
  build: {
    transpile: ['newzen-connector']
  }
})
```

#### 1.2 Initialize newzen-connector

**File**: `base-source-template/composables/useNewzenPage.ts`
```typescript
import NewzenConnector from 'newzen-connector'

export const useNewzenPage = () => {
  const connector = new NewzenConnector({
    dataCmsBindAttribute: 'data-cms-bind'
  })

  // Setup editable elements on component mount
  const setupEditableElements = (el: HTMLElement) => {
    const editableElements = el.querySelectorAll('[data-cms-bind]')
    editableElements.forEach(elem => {
      connector.setupEditableElement({
        element: elem,
        dataCmsBind: elem.getAttribute('data-cms-bind') || '',
        fieldPath: elem.getAttribute('data-field-path') || ''
      })
    })
  }

  return {
    connector,
    setupEditableElements
  }
}
```

#### 1.3 Add Attributes to Template

**File**: `base-source-template/components/BlogHero.vue` (example component)
```vue
<template>
  <section
    class="hero"
    :data-cms-bind="`#content_blocks.${blockIndex}`"
    :data-field-path="`title`"
  >
    <h1 class="editable-field">{{ content_blocks[blockIndex].title }}</h1>
    <p class="editable-field">{{ content_blocks[blockIndex].description }}</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  content_blocks: Array<any>
  blockIndex: number
}>()

const { setupEditableElements } = useNewzenPage()
onMounted(() => {
  setupEditableElements(document.querySelector('.hero') as HTMLElement)
})
</script>
```

**HTML Output**:
```html
<h1 class="editable-field" data-cms-bind="#content_blocks.0" data-field-path="title">
  Welcome to My Site
</h1>
```

---

### Phase 2: Styling - newzen-connector/src/style.css

```css
/* Base editable field styles */
.editable-field {
  position: relative;
  outline: 2px dashed transparent;
  outline-offset: 2px;
  transition: all 0.2s ease;
  overflow: visible;  /* Important: allow toolbar to show */
  cursor: pointer;
}

/* Hover state */
.editable-field--hover {
  outline: 2px dashed #3b82f6;
  background-color: rgba(59, 130, 246, 0.05);
}

/* Editing state */
.editable-field--editing {
  outline: 2px solid #3b82f6;
  padding: 0.25rem;
  background-color: rgba(59, 130, 246, 0.1);
}

/* Toolbar button */
.editable-toolbar-button {
  position: absolute;
  top: -32px;        /* Display above element */
  left: 0;
  width: 28px;
  height: 28px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  z-index: 1000;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.editable-toolbar-button:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.editable-toolbar-button:active {
  transform: scale(0.95);
}
```

---

### Phase 3: NewzenConnector Class

**File**: `newzen-connector/src/index.ts`

```typescript
import { NEWGEN_MESSAGE, TYPE_SERVICE } from './constants'

export default class NewzenConnector {
  private toolbarMap = new WeakMap<HTMLElement, HTMLElement>()
  private activeElement: HTMLElement | null = null

  constructor(options?: any) {
    this.setupGlobalListeners()
  }

  /**
   * Setup editable element with inline editing capability
   */
  setupEditableElement(config: {
    element: HTMLElement
    dataCmsBind: string
    fieldPath: string
  }) {
    const { element, dataCmsBind, fieldPath } = config

    // Add CSS class
    element.classList.add('editable-field')

    // Store data attributes
    element.setAttribute('data-cms-bind', dataCmsBind)
    element.setAttribute('data-field-path', fieldPath)

    // Hover event
    element.addEventListener('mouseenter', () => {
      element.classList.add('editable-field--hover')
      this.createToolbarButton(element, dataCmsBind, fieldPath)
    })

    // Remove hover state
    element.addEventListener('mouseleave', () => {
      element.classList.remove('editable-field--hover')
      this.removeToolbarButton(element)
    })

    // Click to start editing
    element.addEventListener('click', (e) => {
      e.stopPropagation()
      element.classList.add('editable-field--editing')
      this.activeElement = element
    })

    // Blur (finish editing)
    element.addEventListener('blur', () => {
      element.classList.remove('editable-field--editing')
      this.activeElement = null
    })
  }

  /**
   * Create toolbar button that appears above element
   */
  private createToolbarButton(
    editableElement: HTMLElement,
    dataCmsBind: string,
    fieldPath: string
  ) {
    // Check if already exists
    if (this.toolbarMap.has(editableElement)) {
      return
    }

    const toolbar = document.createElement('button')
    toolbar.className = 'editable-toolbar-button'
    toolbar.innerHTML = '✏️'
    toolbar.setAttribute('title', `Edit ${fieldPath}`)

    // On click: emit event to parent
    toolbar.addEventListener('click', (e) => {
      e.stopPropagation()
      const newValue = editableElement.innerText
      this.emitInlineEdit(
        dataCmsBind,
        newValue,
        fieldPath,
        NEWGEN_MESSAGE.TEMPLATE_EDIT_INLINE_BLOCK_WITH_TOOLBAR
      )
    })

    // Prevent blur when clicking toolbar
    toolbar.addEventListener('mousedown', (e) => {
      e.preventDefault()
    })

    // Append inside editableElement (will use absolute positioning to appear above)
    editableElement.appendChild(toolbar)

    // Track in WeakMap for cleanup
    this.toolbarMap.set(editableElement, toolbar)
  }

  /**
   * Remove toolbar button and cleanup
   */
  private removeToolbarButton(editableElement: HTMLElement) {
    const toolbar = this.toolbarMap.get(editableElement)
    if (toolbar) {
      toolbar.remove()
      this.toolbarMap.delete(editableElement)
    }
  }

  /**
   * Generic emit function for inline edits
   */
  private emitInlineEdit(
    dataCmsBind: string,
    value: any,
    fieldPath: string,
    messageType: string = NEWGEN_MESSAGE.TEMPLATE_EDIT_INLINE_BLOCK_WITH_TOOLBAR
  ) {
    try {
      window.parent.postMessage(
        {
          type: messageType,
          data: {
            dataCmsBind,
            fieldPath,
            value
          }
        },
        '*'
      )
    } catch (error) {
      console.error('Error emitting inline edit:', error)
    }
  }

  /**
   * Parse dataCmsBind to extract block index
   * Input: "#content_blocks.0" → Output: { blockIndex: 0 }
   */
  static parseDataBinding(binding: string) {
    const match = binding.match(/#content_blocks\.(\d+)/)
    if (!match) return null
    return {
      blockIndex: parseInt(match[1], 10)
    }
  }

  /**
   * Global listeners setup
   */
  private setupGlobalListeners() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'newzen:update') {
        const data = JSON.parse(event.data.data)
        // Update component data here
        // This will trigger re-render
      }
    })
  }
}
```

---

### Phase 4: Handler in Apps Manager

**File**: `apps-manager/components/SlideEditPage.vue`

```typescript
import NewzenConnector from 'newzen-connector'

// Window message listener
window.addEventListener('message', async (event) => {
  if (!pageData.value) return

  switch (event.data.type) {
    // NEW: Handle inline edit with toolbar
    case NEWZEN_MESSAGE.TEMPLATE_EDIT_INLINE_BLOCK_WITH_TOOLBAR: {
      const { dataCmsBind, fieldPath, value } = event.data.data

      // Parse dataCmsBind to get blockIndex
      const parsed = NewzenConnector.parseDataBinding(dataCmsBind)
      if (!parsed) {
        toast.add({
          title: 'Error',
          description: 'Invalid data binding format',
          color: 'red'
        })
        return
      }

      const { blockIndex } = parsed

      // Update nested value in pageData
      if (pageData.value?.content_blocks?.[blockIndex]) {
        // setNestedValue helper updates nested object properties
        setNestedValue(pageData.value.content_blocks[blockIndex], fieldPath, value)

        // Show feedback
        toast.add({
          title: '✏️ Updated',
          description: `${fieldPath} has been saved`,
          color: 'green'
        })
      } else {
        toast.add({
          title: 'Error',
          description: `Block at index ${blockIndex} not found`,
          color: 'red'
        })
      }
      break
    }

    // Existing handlers
    case NEWZEN_MESSAGE.TEMPLATE_DOWN_BLOCK: { ... }
    case NEWZEN_MESSAGE.TEMPLATE_UP_BLOCK: { ... }
    case NEWZEN_MESSAGE.TEMPLATE_DELETE_BLOCK: { ... }
    case NEWZEN_MESSAGE.TEMPLATE_EDIT_BLOCK: { ... }
  }
})

/**
 * Helper: Set nested property in object
 * Example: setNestedValue(obj, 'author.name', 'John')
 */
function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

/**
 * Helper: Get nested property from object
 */
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}
```

---

## 🔄 Complete Data Flow Example

### Scenario: User edits article title inline

```
1. Preview loads base-source-template with article

2. User hovers over "My Article Title"
   → setupEditableElement() adds .editable-field class
   → Shows toolbar button (✏️) positioned above title
   → Class added: .editable-field--hover

3. User clicks toolbar button
   → Click handler fires
   → Gets current text: "My Article Title"
   → Calls emitInlineEdit() with:
     {
       type: 'newzen:template:editInlineBlockWithToolbar',
       data: {
         dataCmsBind: '#content_blocks.0',
         fieldPath: 'title',
         value: 'My Article Title'
       }
     }

4. Apps Manager receives postMessage
   → Parses dataCmsBind: blockIndex = 0
   → Calls setNestedValue():
     pageData.value.content_blocks[0].title = 'My Article Title'
   → Shows toast: "✏️ Updated"

5. Watch triggers on pageData change
   → Calls handlePostMessageToIframe()
   → Sends UPDATE message to iframe:
     {
       type: 'newzen:update',
       data: JSON.stringify(pageData.value)
     }

6. Preview receives UPDATE
   → Updates component data
   → Re-renders with new title
   → User sees changes immediately

7. History tracked
   → setHistoryItem() creates entry
   → "Save" button becomes enabled
   → User clicks Save
   → API.editPage() sends to backend
   → Backend updates base-source-template files

8. Deployment
   → Backend rebuilds site
   → Sends notification to frontend
   → Preview reloads with new content
```

---

## 💾 Data Structure Example

### Base-Source-Template Page Data

```yaml
# pages/home.yml (stored in backend)
title: "My Website"
seo:
  page_description: "Welcome to my site"
  canonical_url: "https://example.com"
  featured_image: "hero.jpg"
content_blocks:
  - type: "hero"
    title: "Welcome to My Site"      # ← Editable field
    description: "This is a hero"    # ← Editable field
    image: "hero.jpg"
    button_text: "Get Started"       # ← Editable field
    button_url: "/products"
  
  - type: "features"
    title: "Our Features"            # ← Editable field
    items:
      - name: "Feature 1"            # ← Editable field
        description: "Description"   # ← Editable field
```

### Component Template

```vue
<!-- components/MediaHero.vue -->
<template>
  <section
    class="hero-section"
    :data-cms-bind="`#content_blocks.${blockIndex}`"
  >
    <div class="content">
      <h1
        class="editable-field"
        :data-field-path="'title'"
        @mounted="setupEditable"
      >
        {{ content_blocks[blockIndex].title }}
      </h1>
      
      <p
        class="editable-field"
        :data-field-path="'description'"
        @mounted="setupEditable"
      >
        {{ content_blocks[blockIndex].description }}
      </p>

      <button
        class="editable-field"
        :data-field-path="'button_text'"
        @mounted="setupEditable"
      >
        {{ content_blocks[blockIndex].button_text }}
      </button>
    </div>
    
    <img
      :src="content_blocks[blockIndex].image"
      :alt="content_blocks[blockIndex].title"
    />
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  content_blocks: any[]
  blockIndex: number
}>()

const { connector, setupEditableElements } = useNewzenPage()

const setupEditable = (el: HTMLElement) => {
  const dataCmsBind = `#content_blocks.${props.blockIndex}`
  const fieldPath = el.getAttribute('data-field-path') || ''

  connector.setupEditableElement({
    element: el,
    dataCmsBind,
    fieldPath
  })
}

onMounted(() => {
  // Setup all editable fields in this section
  const section = document.querySelector('.hero-section')
  if (section) {
    setupEditableElements(section)
  }
})
</script>
```

---

## 🎯 Message Flow Diagram

```
Preview (iframe)                    Apps Manager (parent)
     │                                     │
     │ User hovers element                 │
     ├─ Show toolbar button               │
     │                                     │
     │ User clicks toolbar                │
     │ (✏️ button)                        │
     │                                     │
     │ emitInlineEdit() called            │
     │                                     │
     │ postMessage {                       │
     │   type: 'newzen:template:         │
     │   editInlineBlockWithToolbar',    │
     │   data: {                          │
     │     dataCmsBind: '#content_...',  │
     │     fieldPath: 'title',           │
     │     value: 'New Title'            │
     │   }                                │
     ├────────────────────────────────────>│
     │                                     │
     │                          parseDataBinding()
     │                          setNestedValue()
     │                          pageData updated
     │                                     │
     │                          showToast('Updated')
     │                                     │
     │<─── postMessage UPDATE pageData ───│
     │     {                              │
     │       type: 'newzen:update',      │
     │       data: stringified pageData   │
     │     }                              │
     │                                     │
     └─ Update component state            │
     └─ Re-render preview                │
```

---

## 🐛 Debugging Checklist

- [ ] `data-cms-bind` attribute present on HTML element
- [ ] `data-field-path` attribute correct
- [ ] `.editable-field` class applied
- [ ] Toolbar styles loaded (overflow: visible)
- [ ] postMessage event received in chrome devtools
- [ ] parseDataBinding() returns correct blockIndex
- [ ] setNestedValue() updates correct path
- [ ] Watch triggered and UPDATE message sent
- [ ] Preview component reactivity working

---

## 🚀 Next Steps

1. **Enable for all block types**
   - Add `data-cms-bind` & `data-field-path` to all components
   - Setup editable elements on mount

2. **Add inline save trigger**
   - Option 1: Auto-save after edit
   - Option 2: Save button in toolbar
   - Option 3: Manual Save in left panel

3. **Rich text editing**
   - Instead of plain text, use ContentEditable
   - Or open modal with rich text editor

4. **Nested object editing**
   - For objects like `seo: { description: '...' }`
   - Use fieldPath like: 'seo.description'
   - setNestedValue() handles this already

5. **Array editing**
   - For items in arrays: 'features.0.title'
   - Parse and update correctly

---

End of Inline Editing Implementation Guide
