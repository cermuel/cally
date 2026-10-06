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

## Input Validation

Do not rely on native HTML form submission or browser validation in new or edited UI. Use explicit Vue event handlers and the project's validation helpers instead of `<form>`, `required`, or other browser-managed validation behavior.

Show field-level validation through the shared input components' `error` props. For controls without an `error` prop, set `aria-invalid` and render the error message beside the control.

## Preserve API Response Shapes

Use API response objects directly throughout the application. Do not create mapping or normalization helpers such as `mapPublicMeeting`, `mapPublicEvent`, or `mapPublicProfile`, and do not introduce parallel view-model types that rename API fields.

Keep display-only transformations at the UI boundary. For example, format dates, times, durations, and fallback labels in the component that renders them rather than reshaping the response after fetching it.
