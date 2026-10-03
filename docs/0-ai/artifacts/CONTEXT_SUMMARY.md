---
artifactId: CONTEXT_SUMMARY
packId: "2026-10-03T13:01:52Z"
generatedAt: "2026-10-03T13:01:52Z"
generator: "prompt--artifact--generate-context-summary.md"
---

# Angular myFlix — Warm Editorial

## Structure

Angular 16 NgModule browser application, TypeScript, RxJS, template-driven forms,
HttpClient, Sass, Angular Material dialog, and Karma/Jasmine. SRC_TREE inventories
37 non-test source files across 13 directories below src/.
Angular templates/styles are included; static assets and specs are excluded.

## Routing and shell

AppRoutingModule defines five pages: /login, /signup, /movies,
/movies/:movieId, and /profile. Root and /welcome redirect to /login.
AppComponent owns the shared header/navigation, skip link, and single main
landmark. Navigation changes with local token/username presence; the backend
remains the authorization boundary. The guest wordmark and Logout lead to Login.
Every routed page receives heading focus; loading responses preserve search focus.

## Authentication and API

FetchApiDataService centralizes typed requests and safe errors. Environment files
select localhost:8080 in development and the existing Render API in production.
Login stores user, token, and Username in localStorage and routes to /movies.
Signup has required username/password/email, optional Birthday, persistent success,
and no automatic login. The backend authorizes self-only /users/:Username routes
with the Bearer JWT. Username is a selector; JWT identity remains valid on rename.

## Movie pages and favorites

MovieLibraryComponent loads catalog and membership independently, filters titles
locally, and renders reusable MovieCard components. Cards contain real metadata,
poster fallback, two-line title/three-line excerpt, routed View Details, and favorite
pressed/busy controls. MovieDetailComponent resolves catalog IDs, cancels replaced
route requests, and displays full synopsis, optional genre description and director
biography inline. Loading, failure, not-found, and membership states remain distinct.

MovieFavoritesService is provided per page, loads fresh membership, serializes
mutations, persists authoritative returned users, and exposes userChanges to Profile.
It is not global state. Failure preserves membership and provides safe inline retry
feedback; leaving a page cancels its subscriptions.

## Profile and deletion

UserProfileComponent shows semantic account data, an always-visible update form,
shared h3 favorite cards, then Danger Zone. Catalog failure does not hide account
information. Missing Birthday is omitted; unresolved movie IDs have explicit feedback.
Password remains required for every update with a five-character minimum. Successful
updates persist the returned user/username, retain token, reset the draft/password,
and reset submitted validation. Favorite responses preserve unsaved drafts.
Account actions and favorite mutations avoid overlapping full-user responses.

DeleteAccountDialogComponent uses Material naming/description, Cancel-first focus,
focus trapping/restoration, safe Escape cancellation, pending guards, and safe retry
feedback. Only successful deletion clears session keys and navigates to /login.
Native confirmation and old movie-detail dialogs are removed.

## Visual system and supporting configuration

_design-tokens.scss and styles.scss define the Warm Editorial palette, shared
surfaces/forms/actions, visible focus, and reduced-motion rules. Plus Jakarta Sans
is declared with system fallbacks; no fonts are bundled/downloaded. Content caps at
1440px with gutters 16/32/48px at 640/1024px. Grid columns are 1/2/3/4 at
480/768/1024px; Detail columns start at 768px and Profile account columns at 1024px.

The runtime icon is src/favicon.svg. docs/design/DESIGN.md is visual authority;
docs/design/assets/myflix-icon-source.png is unchanged reference artwork.
Historical TypeDoc output/tooling is retired. angular.json defaults to production
builds with base href /; npm run deploy retains /myFlix-Angular-client/ for static
GitHub Pages deployment. dist is ignored. Local integration validation is opt-in,
uses disposable backend state, and is separate from the normal unit suite.

This pack describes the uncommitted working tree, not a deployed or committed build.
