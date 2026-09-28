---
name: cally-component-architecture
description: Organize Cally's Nuxt and Vue application code into clear feature components, composables, constants, utilities, and API modules. Use when creating or refactoring pages, layouts, components, helpers, or feature folders, especially when deciding whether UI such as sidebars, navigation rows, forms, cards, and dialogs should be separate components.
---

# Cally Component Architecture

Use responsibility boundaries to organize code. Do not split files solely because they are long, and do not leave distinct interface regions embedded in a page or layout shell.

## Place UI by feature

Put feature-specific UI in `components/ui/<feature>/` and name each file by its role. Nuxt prefixes the auto-import with the directory path:

- `components/ui/app/Sidebar.vue` becomes `<UiAppSidebar />`.
- `components/ui/app/SidebarItem.vue` becomes `<UiAppSidebarItem />`.
- `components/ui/auth/Card.vue` becomes `<UiAuthCard />`.

Use `components/shared/` only for genuinely cross-feature primitives. Check for an existing shared primitive before adding one.

Do not add feature components flat under `components/`. Feature component folders do not need barrel files because Nuxt auto-imports them.

Use canonical Tailwind utilities. Treat every `suggestCanonicalClasses` diagnostic from Tailwind IntelliSense as an error and apply the suggested canonical form before finishing a change. Prefer named scale utilities over equivalent arbitrary values and current logical inset names such as `inset-s-*` and `inset-e-*`.

## Keep composition boundaries small

Pages and layout shells should primarily compose components and connect top-level state.

Extract a component when a region:

- has its own semantic purpose, such as a sidebar, navbar, form, dialog, or data table;
- owns interaction or accessibility behavior;
- repeats with the same visual and behavioral contract, such as a navigation item;
- can change independently from its parent.

Keep small, one-off markup inline when extracting it would only create a pass-through wrapper.

Prefer a small public component contract. Pass domain values and user intent through props and events; do not mirror an entire parent's internal state without need.

## Separate behavior from presentation

Put reusable or substantial reactive Vue behavior in `composables/use<Feature>.ts`. A composable may own lifecycle hooks, watchers, persistence, browser integration, and a cohesive state machine.

Keep behavior together when splitting it would scatter one interaction across several pass-through helpers. For example, sidebar resize, collapse, persistence, and responsive state belong in one sidebar composable.

Put code elsewhere according to what it is:

- static feature configuration in `constants/`;
- pure domain transformations in `utils/`;
- request and response code in `utils/api/`;
- shared domain contracts in `types/` when more than one module needs them.

A helper in `utils/` should be pure and framework-independent. If it reads refs, watches routes, or uses Vue lifecycle hooks, it is a composable.

## Avoid abstraction noise

Every extracted file must represent a real concept. Do not add one-call wrappers, trivial getters, speculative generic helpers, duplicate DTOs, or interfaces with only one implementation and no boundary value.

Prefer direct typed access over defensive coercion. Validate external data once at the boundary, then use precise internal types.

Keep locally used types beside their implementation. Move a type to `types/` only when it is a shared contract rather than an implementation detail.

## Refactor safely

When reorganizing existing UI:

1. Preserve behavior and appearance before polishing further.
2. Identify the composition root, meaningful visual regions, repeated units, and cohesive stateful behavior.
3. Move static configuration first, then behavior, then leaf components, then container components.
4. Keep existing user changes outside the feature untouched.
5. Run the production build and fix all template, auto-import, and TypeScript errors.
6. Exercise important interactions in a browser when the refactor touches gestures, focus, responsive behavior, or animation.

The resulting structure should make it obvious where to change layout, presentation, configuration, and behavior without tracing unrelated files.
