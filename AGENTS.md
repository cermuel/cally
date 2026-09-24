# Project Rules

## UI Component Organization

Feature-specific UI components belong under `components/ui/<feature>/`.

Name files by the component role so Nuxt's path-prefixed auto-import names stay predictable:

- `components/ui/auth/Card.vue` is used as `<UiAuthCard />`
- `components/ui/home/Input.vue` is used as `<UiHomeInput />`

Use this pattern for any new feature UI component before adding a flat component at the root of `components/`.
