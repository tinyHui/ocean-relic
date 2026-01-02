# Repository Guidelines

## Project Structure & Module Organization

- Source code resides in `src/`, with `main.tsx` bootstrapping the React app and `app.tsx` managing core UI composition. New feature logic lives within dedicated subfolders by domain.
- Imports should use the `@/` alias that points to `src/` (configured in Vite + TS) to avoid brittle relative paths.
- Global styles are defined in `src/app.css` and `src/index.css`; assets meant for individual components are placed in `src/assets/` and imported using Vite's built-in paths.
- Static resources in `public/` are made directly accessible at the web root (e.g. `/favicon.svg`). Update files here for SEO or manifest changes.
- Build and TypeScript settings are managed in `vite.config.ts`, `tsconfig.app.json`, and `tsconfig.node.json`. Follow their conventions when extending development tooling.

## Build, Test, and Development Commands

- `npm run dev` — starts the Vite dev server with hot reloading. Use `--host` to test on multiple devices.
- `npm run build` — runs a TypeScript project check and outputs bundled app files to `dist/`.
- `npm run preview` — serves the production build locally to verify final asset paths.

## Coding Style & Naming Conventions

- Use TypeScript + JSX in functional React components with React or React hooks. Avoid class components.
- Adopt 2-space indentation. Use trailing commas only where allowed in TSX, and omit semicolons to match current code style.
- Naming: Use `kebab-case` for stylesheets (`app.css`), `camelCase` for utility modules, and `PascalCase.tsx` for React components.
- Try to keep components under ~150 lines; place shared helpers in `src/lib/` if logic grows.
- Use relative imports inside `src/` and absolute imports only for assets Vite exposes at the root.

## Testing Guidelines

- Automated tests are not hooked up by default. When adding them, standardize on Vitest + @testing-library/react and colocate as `*.test.tsx` files next to the component.
- Test user-facing state changes (hooks, props, routing) and mock fetches. Once in place, strive for >80% branch coverage.
- Pending a full test harness, rely on `npm run preview` manual smoke tests, and document verification steps in PRs.

## Board Table Simulator

### App Goal

- Render a responsive, square game table where users can drag any token or tile, snapping pieces to the nearest valid cell, with no collision or board rule enforcement.

### High-Level Architecture

- The app is built on React and Framer Motion. State and game logic are managed in hooks and context, with drag/animation powered by Framer Motion and interact.js.
- The `useBoardPieces` hook loads `grid_info.json`, expands rectangles into usable cell data, shuffles and assigns assets for tiles and tokens, and provides handlers for bringing pieces to front and drag-drop snapping.
- The main `BoardScene` component observes the viewport to preserve a square aspect ratio, paints the board background, and renders each piece using a `DraggablePiece` component. Tile flipping and entry/exit animations use Framer Motion.
- Shared logic such as grid math, shuffling, and helpers lives in `src/lib/` to keep the UI logic in components simple and maintainable.

### Folder Structure Highlights

- `src/features/board/` contains board-specific React components, animation settings, types, image assets, and the `useBoardPieces` hook for game state.
- `src/features/drag/` implements the generic `DraggablePiece` component, combining Framer Motion with interact.js for drag and snap features.
- `src/lib/` centralizes data utilities (`grid.ts`, `shuffle.ts`, `math.ts`) for logic reused across features.

### Drag & Snap Logic

- Each token type (`PlayerToken`, `OxygenToken`, `TileToken`) lives in `src/features/board/components/tokens/` and wraps a Framer Motion surface with `reactablejs`, so interact.js controls dragging directly per component.
- Dragging uses interact.js snap modifiers pointed at every coordinate from `grid_info.json`, ensuring the tokens magnetize to the nearest grid center regardless of board scale. React state converts the snapped on-screen offset back to board units before updating game state.
- Grid cells still mount as invisible dropzones, satisfying the table-top requirement and keeping future cross-highlight logic simple.
- While dragging, Framer Motion animates active tokens with scaling, shadows, and smooth movement; no collision rules are applied.

### Deck & Flip Logic

- Tile fronts load from `src/assets/path-tiles/`, get shuffled, and feed three queues (one per deck). Only the top tile of each deck is rendered (back-side up) until it leaves the deck.
- Dragging a deck tile immediately spawns the next back if the queue still has tiles. Dropping flips the moving tile to its front once, revealing its permanent face on the board.

### Token Supply Logic

- Player tokens render side-by-side inside the preparation lane and stay draggable across the board.
- The oxygen supply shows a single token at a time; picking it up clones another supply token so the pool is effectively infinite while only one is visible.

### Grid Region Interpretation

- The grid logic (in `src/lib/grid.ts`) parses `grid_info.json`, converting rectangles to `GridCell` points, subdividing areas for player and oxygen tokens to discrete snap zones.
- The resulting `GridSummary` exposes an array for each region and a combined list for universal snapping logic, regardless of piece type.
