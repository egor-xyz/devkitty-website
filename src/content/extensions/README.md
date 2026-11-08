# Extensions registry

One JSON file per extension. Adding one needs no component, config or sitemap edit.

1. Create `src/content/extensions/<id>.json` (the id is the file name, kebab-case, and becomes the public URL `/extensions/<id>/`: never rename it).
2. Add `public/extensions/<id>/icon.svg`: an original 24-unit line icon, `stroke="currentColor"`, `stroke-width="1.75"`. Do not use SF Symbols.
3. Optional screenshots: WebP files in `public/extensions/<id>/`, at most 200 KB each, real app UI with mock data only. List them under `screenshots`. The site is light only and shows the app in its sunset (dark) theme, so ship the `-dark` file only, e.g. `shot-1-dark.webp`. Without screenshots the page is text only. Never add placeholder or invented images.
4. Run `pnpm build`. It validates every file (the error names the file), checks that the icon and screenshots exist, writes `dist/extensions/<id>/index.html`, and adds the page to `dist/sitemap.xml`. The home section and `/extensions/` pick the entry up from the registry.

Only list extensions that ship in the released app. Check `isAvailableInApp` in the app's catalogue and verify every claim against the app's parity notes and changelog.

```json
{
  "id": "example",
  "name": "Example",
  "tagline": "One line, at most 90 characters.",
  "icon": "/extensions/example/icon.svg",
  "group": "Toolbar",
  "status": "new",
  "minBuild": 283,
  "defaultOn": false,
  "order": 70,
  "settingsPath": "Settings › Extensions",
  "screenshots": [
    { "src": "/extensions/example/shot-1-dark.webp", "alt": "…", "width": 1520, "height": 1036 }
  ],
  "sections": [
    { "heading": "…", "body": "…", "bullets": ["…"], "shot": 0 }
  ]
}
```

- `group`: `Terminal`, `Image Tools`, `Widgets`, `Toolbar` or `Development` (the app's order).
- `status`: `new`, `beta`, `stable` or `coming-soon`. A coming-soon entry needs `minBuild: null`.
- `minBuild`: the first build that has it, or `null` when that is not verified (the page then says "Included in the current release").
- `defaultOn`: whether the app enables it on a fresh install. When `false` the page says where to turn it on (`settingsPath`).
- `order`: lower comes first inside its group (and on the home section, which shows the first 8).
- `shot` in a section is an index into `screenshots`.
