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
  features/       Self-contained product areas (discover/, shortlist/, listing-detail/), each with its own
                  components/, hooks/, and types.ts, exposed through index.ts
  components/
    ui/           Generic, app-agnostic primitives (Button, Badge, Card, Icon, ...)
    listing/      Listing pieces shared by several features (facts, price, photo)
    layout/       App shell: header, navigation, account menu
  hooks/          Reusable hooks not tied to a feature (useSwipe, useKeyboardShortcuts)
  lib/            Pure helpers (cn, formatting, listing display rules)
  types/          Domain models shared across features (Listing, User)
  styles/         Design tokens (theme.css) mirrored from Figma
  assets/         Brand mark
```

## Conventions

- **Design tokens first.** Colors, type sizes, and shadows live in `src/styles/theme.css` and are
  used as Tailwind utilities (`bg-brand`, `text-muted`, `text-label`, `shadow-card`). Avoid
  hard-coded hex values in components.
- **Icons by name.** Icons come from [Lucide](https://lucide.dev/icons/) (the set the Figma file
  uses). Register one in `components/ui/icons.ts` and render it with `<Icon name="..." />`; it
  takes its color from the text color (`className="text-brand"`) and its size from `size`.
- **Filters live in the URL** (`/?beds=1&beds=2&city=Burnaby`, parsed in `lib/filters.ts`) so they survive
  reloads and can be shared; the Discover loader passes them to `GET /api/listings`.
- **Browser storage until accounts exist.** The shortlist (`localStorage`) and Discover's pass/like
  history (`sessionStorage`) are built on `lib/createStorageStore.ts`; swap
  `features/shortlist/shortlistStore.ts` for API calls when accounts land.
- **Features import from `components/`, `hooks/`, `lib/`, and `types/` — never from other
  features.** Pages import features through their `index.ts`.
- **No sample content.** Listings and photos come from the Craigslist scraper (`data-collector/`)
  through `GET /api/listings`; user details come from the signed-in account. Don't commit
  placeholder photos or personal data.
- **Logic in hooks, markup in components.** Stateful behavior (swiping, deck state) lives in hooks
  so components stay presentational.
