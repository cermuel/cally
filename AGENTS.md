# Project Rules

## Required Architecture Skill

Before creating or reorganizing Vue components, composables, helpers, constants, or feature folders, read and follow:

- `.agents/skills/cally-component-architecture/SKILL.md`

## UI Component Organization

Feature-specific UI components belong under `components/ui/<feature>/`.

Name files by the component role so Nuxt's path-prefixed auto-import names stay predictable:

- `components/ui/auth/Card.vue` is used as `<UiAuthCard />`
- `components/ui/home/Input.vue` is used as `<UiHomeInput />`

Use this pattern for any new feature UI component before adding a flat component at the root of `components/`.

Keep pages and layout shells focused on composition. Extract independently meaningful interface regions (for example, a sidebar) and repeated interactive units (for example, a sidebar item) into role-named components in the same feature folder.

Treat Tailwind IntelliSense's `suggestCanonicalClasses` diagnostics as errors. Use canonical Tailwind utilities in every new or edited class list.
