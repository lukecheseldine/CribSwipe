# CribSwipe web

React 19 + TypeScript + Vite + Tailwind CSS v4, routed with React Router.

```sh
npm install
npm run dev      # local dev server
npm run lint
npm run build    # type-check + production build
npm run format
```

## Project structure

```
src/
  api/            Data access; maps API responses (scraper rows) into domain types
  app/            App root, router, and route paths
  pages/          One component per route; composes features, holds no UI details of its own
  features/       Self-contained product areas (e.g. discover/), each with its own
                  components/, hooks/, and types.ts, exposed through index.ts
  components/
    ui/           Generic, app-agnostic primitives (Button, Badge, Card, Icon, ...)
    layout/       App shell: header, navigation, account menu
  hooks/          Reusable hooks not tied to a feature (useSwipe, useKeyboardShortcuts)
  lib/            Pure helpers (cn, formatting, listing display rules)
  types/          Domain models shared across features (Listing, User)
  styles/         Design tokens (theme.css) mirrored from Figma
  assets/icons/   UI icons exported from Figma, registered by name in index.ts
```

## Conventions

- **Design tokens first.** Colors, type sizes, and shadows live in `src/styles/theme.css` and are
  used as Tailwind utilities (`bg-brand`, `text-muted`, `text-label`, `shadow-card`). Avoid
  hard-coded hex values in components.
- **Icons by name.** Add the SVG to `assets/icons/`, register it in `assets/icons/index.ts`, and
  render it with `<Icon name="..." />`.
- **Features import from `components/`, `hooks/`, `lib/`, and `types/` — never from other
  features.** Pages import features through their `index.ts`.
- **No sample content.** Listings and photos come from the Craigslist scraper (`data-collector/`)
  through `GET /api/listings`; user details come from the signed-in account. Don't commit
  placeholder photos or personal data.
- **Logic in hooks, markup in components.** Stateful behavior (swiping, deck state) lives in hooks
  so components stay presentational.
