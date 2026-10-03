# myFlix — Angular client

An Angular movie-library portfolio application for the sibling `movie-api`
backend. It shares a product structure with the React myFlix client and uses
the Warm Editorial theme: parchment canvas, ivory surfaces, burgundy actions,
and a separate destructive color treatment.

Built with Angular 16, TypeScript, Angular Router, template-driven forms,
HttpClient, RxJS, Sass, and Angular Material's accessible confirmation dialog.

## Application

- `/login` and `/signup`: routed authentication forms with reciprocal links.
  `/` and the historical `/welcome` URL redirect to `/login`.
- `/movies`: responsive movie cards and client-side, case-insensitive title search.
- `/movies/:movieId`: catalog-resolved detail page with full synopsis, genre,
  director, and optional inline genre description/director biography.
- `/profile`: account information, integrated update form, shared favorite cards,
  and a final Danger Zone with account-deletion confirmation.

Login persists the returned user, username selector, and Bearer JWT in
localStorage. Signup does not automatically log in. Logout clears application
session keys and returns to `/login`. The backend remains responsible for
JWT authorization and self-only account access; client session checks are not
an authorization boundary.

Favorites use server-returned membership and persist the returned user.
Mutations are guarded and serialized within each page; entering Library,
Detail, or Profile loads fresh account state. Profile updates require a
Password of at least 5 characters, including when only other fields change.
Entering the current password keeps it; entering a new password replaces it.
A returned username change updates the local selector without forcing logout.
Only successful account deletion clears the session and navigates to Login;
failure retains the account/session and permits retry.

## Local setup

Install locked dependencies with `npm ci`, start the local `movie-api` backend,
and run `npm start`. The Angular development server uses `http://localhost:4200`.
The backend must allow the frontend origin through its CORS configuration.

The root package does not declare Node/npm engines. The locked Angular CLI
metadata declares Node `^16.14.0 || >=18.10.0` and npm
`^6.11.0 || ^7.5.6 || >=8.0.0`; final validation used Node 22.23.2 / npm 10.9.8.
These are tool metadata and the tested local versions, not an Angular upgrade.

API origins are environment-configured:

| Mode | Configuration | API origin |
| --- | --- | --- |
| Development | `src/environments/environment.development.ts` | `http://localhost:8080` |
| Production | `src/environments/environment.ts` | `https://movie-api-mreb.onrender.com` |

Development serving/builds use the Angular file replacement. The API service
normalizes trailing slashes and adds the current Bearer token. The backend
retains `/users/:Username` and `/users/:Username/movies/:MovieID` as self-only
routes; there is no `/users/me` or user-list request. No backend credentials
belong in this public client.

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Development server |
| `npm run lint` | Angular/TypeScript/template lint |
| `npm test -- --watch=false --browsers=ChromeHeadless` | Complete Karma/Jasmine unit suite; requires Chrome |
| `npm run build` | Production build into `dist/my-flix-angular-client/` |
| `npm run build -- --configuration development` | Development build |
| `npm run test:integration` | Opt-in disposable local backend HTTP validation |
| `npm run deploy` | Existing GitHub Pages deployment command with subpath base href |

The integration runner uses the sibling `../movie-api` with an isolated temporary
MongoDB database on localhost port 8080. Both repositories need their locked
dependencies installed and an existing cached MongoDB binary; downloads are
disabled. It does not read the backend `.env`, contact Render, or reuse an
existing database/listener. `MYFLIX_BACKEND_PATH` and `MYFLIX_MONGOD_BINARY` may
select another backend checkout or existing binary. Ordinary unit tests do
not require the backend. See [the runner](scripts/validate-integration.cjs).

## Design and deployment

The durable visual specification is [docs/design/DESIGN.md](docs/design/DESIGN.md).
The canonical favicon is `src/favicon.svg`; unchanged reference artwork lives
at `docs/design/assets/myflix-icon-source.png`. Runtime typography declares
Plus Jakarta Sans with system fallbacks; no font files are bundled/downloaded.
The canonical AI context pack lives under `docs/0-ai/artifacts/` and is generated
through the repository playbook artifact controller. Historical TypeDoc output
and tooling were retired because they were stale and had no active workflow.

The default production build has base href `/`. The existing deployment script
sets `/myFlix-Angular-client/` for GitHub Pages; the relative favicon URL resolves
under either base. Static hosting must support Angular route fallback to the
application entry page. API hosting and authorization remain separate from
frontend static hosting. This describes repository configuration, not a claim
that the current working tree has been deployed.
