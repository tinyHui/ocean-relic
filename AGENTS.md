# Repository Guidelines

## Project Structure & Module Organization

- Source lives in `src/`, with `main.tsx` bootstrapping Preact and `app.tsx` hosting most UI logic; keep new features in feature-specific subfolders.
- Global styles stay in `src/app.css` and `src/index.css`; component-scoped assets go under `src/assets/` and import via Vite's module paths.
- Static files in `public/` are served verbatim at the web root (`/favicon.svg`, etc.); update this folder for SEO assets or manifest tweaks.
- Build and TypeScript behavior are configured by `vite.config.ts`, `tsconfig.app.json`, and `tsconfig.node.json`. Mirror their patterns when adding tooling.

## Build, Test, and Development Commands

- `npm run dev` — launches the Vite dev server with hot module reloading; use `--host` when testing on other devices.
- `npm run build` — type-checks via `tsc -b` and bundles production assets into `dist/`.
- `npm run preview` — serves the build output locally; run before publishing to confirm asset paths.

## Coding Style & Naming Conventions

- TypeScript + JSX with functional components and Preact hooks; avoid class components.
- Use 2-space indentation, trailing commas only where valid in TSX, and omit semicolons to match existing files.
- Name files in `src/` using `kebab-case` for styles (`app.css`), `camelCase` for utilities, and `PascalCase.tsx` for components.
- Keep components under ~150 lines; extract helpers into `src/lib/` if logic grows.
- Prefer relative imports within `src/` and absolute `/` imports only for assets exposed by Vite.

## Testing Guidelines

- Automated tests are not yet configured; when adding them, default to Vitest + @testing-library/preact and colocate specs as `*.test.tsx` beside the component.
- Cover user-visible state changes (hooks, props, routing) and mock fetches; aim for >80% branch coverage once the suite exists.
- Until the harness lands, rely on `npm run preview` smoke tests and document manual verification steps in PRs.

## Commit & Pull Request Guidelines

- Follow the existing history: concise, imperative subject lines (`Add hero carousel`, `Fix counter overflow`), <60 characters, capitalized, without trailing punctuation.
- Reference issues with `Fixes #123` in the body when applicable, and describe the intent plus risk surface in 1-2 sentences.
- PRs should include: summary of changes, testing evidence (commands + screenshots/GIFs for UI), notes on follow-up work, and reviewers for affected areas.
- Keep branches focused; rebase before requesting review to avoid merge commits in main.
