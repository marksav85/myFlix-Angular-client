---
artifactId: CONTEXT_SUMMARY
packId: "2026-10-09T14:02:02Z"
generatedAt: "2026-10-09T14:02:02Z"
generator: "prompt--artifact--generate-context-summary.md"
---

# Angular myFlix — Warm Editorial

## Structure

Angular 16 NgModule browser application with TypeScript, RxJS, template-driven
forms, HttpClient, SCSS, and Angular Material confirmation dialog. SRC_TREE
inventories 37 non-test source files across 11 directories below src/.
Angular templates/styles and index.html are included; tests/static assets are
excluded. One source snapshot includes all 37 inventoried files.
AppModule declares routed views and shared components; main.ts bootstraps it.

## Routing and shell

AppRoutingModule defines /login, /signup, /movies, /movies/:movieId, and /profile.
Root and /welcome redirect to /login. There are no route guards or wildcard route.
AppComponent supplies navigation, a skip link and a single main landmark.
Navigation and routed account/movie views check stored token/username presence.
These component-level checks do not validate the JWT or replace backend authorization.

## Authentication and API

FetchApiDataService centralizes typed requests, trailing-slash normalization,
encoded route parameters, Bearer JWT headers and generic safe errors.
Development selects src/environments/environment.development.ts via Angular file
replacement and uses http://localhost:8080. Production uses environment.ts and
https://api.myflix.marksavilledesigns.com. The API origin is embedded at build time;
changes require rebuilding and redeploying. Backend CORS must allow the frontend.
Login stores user, token and Username in localStorage and navigates to /movies.
Signup does not automatically log in. Logout clears those three session keys.
API 401/403 responses do not automatically clear the session or restore it.
Self-only /users/:Username and favorite routes rely on backend JWT authorization.

## Movie pages and favorites

MovieLibraryComponent independently loads catalogue/account state and filters
movie titles locally without case sensitivity. Shared MovieCard components show
metadata, poster fallbacks, routed details and favorite controls.
MovieDetailComponent resolves the route ID from the catalogue and displays full
synopsis, genre/director information and optional inline descriptions/biography.
MovieFavoritesService is provided per Library, Detail and Profile page. It loads
fresh account state, serializes favorite mutations and persists returned users.
It exposes pending/error state and userChanges; subscriptions end on page teardown.

## Profile and deletion

UserProfileComponent shows account data, an integrated update form, shared favorite
cards and Danger Zone. Catalogue failure does not hide account data. Birthday is
optional; unresolved favorite IDs receive feedback. Updates require a password of
at least five characters, even for other-field changes. A returned username change
updates the selector without forcing logout; the stored token remains.
Favorite responses preserve unsaved profile drafts. Saving and deletion controls
avoid overlapping account mutations. DeleteAccountDialogComponent uses Material
focus management, Cancel-first focus, pending guards and retry feedback.
Only successful deletion clears session keys and navigates to /login.

## Design and tooling

src/_design-tokens.scss and src/styles.scss define Warm Editorial colors, semantic
surfaces/actions, focus styling and reduced-motion support. Shared content is capped
at 1440px; responsive grids and layouts adapt to viewport width.
Plus Jakarta Sans is declared with system fallbacks; no font files are downloaded.
src/favicon.svg is the runtime icon; docs/design/assets/myflix-icon-source.png is
reference artwork. docs/design/DESIGN.md is the durable visual specification.
README.md documents application behavior, local setup, checks and deployment.
Current npm scripts are ng, start, build, watch, test, test:integration and lint.
Karma/Jasmine tests and Angular ESLint are configured. Optional local integration
validation uses the sibling movie-api and an isolated temporary MongoDB database;
it does not use production. Unit tests do not require the backend.
GitHub Pages script/builder/dependency and unused Prettier script/config are removed.
.editorconfig, ESLint and VS Code configuration are retained. No formatting npm
script or declared Prettier dependency remains.

## Cloudflare Workers deployment

Cloudflare Workers serves Angular static assets; the browser calls the separate
Express REST API on Contabo using Docker/Caddy, backed by MongoDB Atlas.
Worker myflix-angular serves https://angular.myflix.marksavilledesigns.com and
https://myflix-angular.marksav85.workers.dev. Related React client:
https://react.myflix.marksavilledesigns.com.
Owner-verified dashboard settings are documented in README.md: repository
marksav85/myFlix-Angular-client, production branch refactor/portfolio-update, root /,
build npm ci && npm run build -- --configuration production, asset output
dist/my-flix-angular-client/, Node 18.20.8, npm 10.9.2,
SKIP_DEPENDENCY_INSTALL=1 and compatibility date 2026-10-08.
The deployment command selects node@22 and wrangler@4 with npm exec, then deploys
those assets to myflix-angular. PROJECT_OVERVIEW records the exact command.
Configuration is dashboard-managed; no application-owned Wrangler config is tracked.
Production base href is /. Browser routes require SPA fallback to index.html;
the exact Cloudflare fallback configuration remains unverified.

## Generation boundary

Baseline: branch refactor/portfolio-update, commit 2b40d964d70031fa2fbff0525fe8998624b3ed0c.
The input working tree was clean. Repository content and artifact consistency are
checked in this generation; application tests, security checks and production
settings were not newly verified. Historical validation is not a current result.
