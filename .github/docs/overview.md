# 📚 Apps Manager Documentation Overview

Welcome to the AI-optimized documentation structure for the Apps Manager workspace.

## 🏛️ Architecture (`/docs/architecture/`)
- `system.md`: Explains the high-level builder logic, metadata-driven component rendering, and Nuxt 3 integration points.
- `state-management.md`: Rules for Pinia usage, source of truth strictness, history tracking, and global data mapping.

## 🔀 Flows (`/docs/flows/`)
- `data-mutation.md`: Merges API integration and internal service logic (create/update/delete/history tracking flow).
- `service-flow.md`: Explains the Service Block structure, JSON import logic (3F data), and multiple deletion for items.
- `import-export-flow.md`: Documents the new gallery/service JSON export flow, shared helper utilities, and export payload defaults.
- `plugin-flow.md`: Explains plugin installation, system data merging, and rule logic.
- `gallery-flow.md`: Focuses on uploading, processing, and associating media in the builder.

## 📏 Conventions (`/docs/conventions/`)
- `vue3-composition.md`: Defines strict rules for script setup, refs vs reactive, and event emissions.
- `nuxt3-standards.md`: Explicitly dictates usage of Nuxt auto-imports, server directory usage, and module structures.
