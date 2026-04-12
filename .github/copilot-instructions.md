# Apps Manager - GitHub Copilot Agent Rules

## Project Tech Stack
- **Framework**: Nuxt 3 (SSR/SSG), Vue 3 (Composition API)
- **State Management**: Pinia
- **Styling**: Tailwind CSS, Nuxt UI
- **Language**: TypeScript

## Core Architecture Principles
1. **Metadata-Driven UI Pattern**: The system is configuration-driven. The editor dynamically renders based on blueprints/configurations stored in the database. When adding features, extend the schema, don't hardcode UI elements.
2. **Single Source of Truth**: All project state lives in the Pinia store (`stores/project.ts`). Never duplicate state in local component refs unless it is purely for local UI toggles.
3. **History Tracking**: All data mutations must be tracked for undo/redo. Use `projectStore.setHistoryItem()`.

## Editor Features
- **Routing**: Follows Nuxt file-based routing.
- **Real-Time**: MQTT is used for collaborative editing. Handle connection states (connecting, connected).

Please refer to the detailed context paths when working on specific domains:
- Architecture: `.github/docs/architecture/`
- Conventions: `.github/docs/conventions/`
- Flows: `.github/docs/flows/`
