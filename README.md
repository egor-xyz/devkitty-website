# devkitty.app

The website for [Devkitty](https://devkitty.app/), a native macOS workspace for Git, GitHub and your terminals.

Built with Vite, React, Tailwind CSS 4 and motion. The home page, `/privacy/`, `/terms/` and the extension pages are separate HTML entries (see `vite.config.ts`).

## Develop

```sh
pnpm install
pnpm dev          # local dev server
pnpm build        # fetches the latest release, type-checks, builds to dist/
pnpm preview      # serve dist/
pnpm lint:check   # eslint
pnpm typecheck    # tsc
```

Downloads and the changelog come from the public [devkitty-releases](https://github.com/egor-xyz/devkitty-releases) repository. `scripts/fetch-releases.mjs` (run before every build) bakes the latest release into `src/content/releases.generated.json`; the page refreshes it live in the browser.

The site deploys to GitHub Pages from `main` (`.github/workflows/release.yml`), and rebuilds daily so a new release reaches the baked page.

## License

The website source code is [MIT licensed](./LICENSE). The Devkitty name, app icon, logo and screenshots are not covered by the MIT license: all rights reserved.
