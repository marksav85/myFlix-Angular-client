# myFlix — Angular client

A deployed Angular myFlix portfolio client for browsing movies, managing
favorites, and managing user accounts.

**[Live Angular app](https://angular.myflix.marksavilledesigns.com)** ·
[Workers URL](https://myflix-angular.marksav85.workers.dev) ·
[React client](https://react.myflix.marksavilledesigns.com) ·
[API](https://api.myflix.marksavilledesigns.com)

Cloudflare Workers serves the Angular frontend as static assets. The browser
communicates with the separate Express REST API hosted on Contabo using Docker
and Caddy, backed by MongoDB Atlas.

## Stack and structure

Built with Angular 16, Angular Material, TypeScript, Angular Router,
template-driven forms, HttpClient, RxJS, and SCSS.

- `src/main.ts` / `src/app/app.module.ts`: application bootstrap and NgModule.
- `src/app/app-routing.module.ts`: browser routes and redirects.
- `src/app/`: authentication, navigation, library, detail, profile, and shared cards.
- `src/app/fetch-api-data.service.ts`: API requests and Bearer headers.
- `src/app/movie-favorites.service.ts`: page-scoped favorite state and mutations.
- `src/environments/`: development and production API configuration.
- `src/styles.scss` / `src/_design-tokens.scss`: shared styles and semantic tokens.

## Features and routes

- `/login` and `/signup`: routed authentication forms with reciprocal links.
  `/` and the historical `/welcome` URL redirect to `/login`.
- `/movies`: responsive movie cards and client-side, case-insensitive title search.
- `/movies/:movieId`: catalog-resolved detail page with full synopsis, genre,
  director, and optional inline genre description/director biography.
- `/profile`: account information, integrated update form, shared favorite cards,
  and a final Danger Zone with account-deletion confirmation.

## Authentication and session behavior

Protected API requests use Bearer JWT authentication. Login persists the returned
user, username selector, and JWT in `localStorage` under `user`, `Username`, and
`token`. Signup does not automatically log in. Logout clears application
session keys and returns to `/login`. The backend remains responsible for
JWT authorization and self-only account access; client session checks are not
an authorization boundary. Library, Detail, and Profile use component-level
checks for stored session values; there are no route guards. API `401`/`403`
responses do not automatically clear the session or trigger session recovery.

Signup validation has been verified in production. All fields are required
except date of birth:

- Username: at least 5 ASCII alphanumeric characters (`A–Z`, `a–z`, `0–9`),
  with no spaces or symbols.
- Password: at least 8 characters and at most 72 UTF-8 bytes, with no complexity
  requirements.
- Confirm password: required and must match; used only for client-side validation
  and never sent to the API.
- Email: a valid email address.
- Birthday: optional, a valid `YYYY-MM-DD` date that is not in the future;
  omitted from registration requests when blank.

Backend validation errors, including duplicate usernames, appear beside the
relevant fields.

Favorites use server-returned membership and persist the returned user.
Mutations are guarded and serialized within each page; entering Library,
Detail, or Profile loads fresh account state. Profile updates require a
Password of at least 5 characters, including when only other fields change.
Entering the current password keeps it; entering a new password replaces it.
A returned username change updates the local selector without forcing logout.
Only successful account deletion clears the session and navigates to Login;
failure retains the account/session and permits retry.

## Local development

Install locked dependencies with `npm ci`, start the local `movie-api` backend,
and run `npm start`. The Angular development server uses `http://localhost:4200`.
The backend must allow the frontend origin through its CORS configuration.

The root package does not declare Node/npm engines. The locked Angular CLI
metadata declares Node `^16.14.0 || >=18.10.0` and npm
`^6.11.0 || ^7.5.6 || >=8.0.0`. Historical local validation used Node 22.23.2 /
npm 10.9.8; this is not a new Node requirement. The confirmed Cloudflare build
uses Node 18.20.8 / npm 10.9.2, as documented below.

API origins are environment-configured:

| Mode | Configuration | API origin |
| --- | --- | --- |
| Development | `src/environments/environment.development.ts` | `http://localhost:8080` |
| Production | `src/environments/environment.ts` | `https://api.myflix.marksavilledesigns.com` |

`npm start` selects the development configuration, whose Angular file replacement
substitutes `environment.development.ts` for `environment.ts`. Development builds
use the same replacement; production builds use `environment.ts` directly.
The API URL is embedded in the browser bundle at build time: changing it requires
rebuilding and redeploying. A Worker runtime variable alone cannot change an
existing bundle. The API service
normalizes trailing slashes and adds the current Bearer token. The backend
retains `/users/:Username` and `/users/:Username/movies/:MovieID` as self-only
routes; there is no `/users/me` or user-list request. No backend credentials
belong in this public client.

## Commands and quality checks

| Command | Purpose |
| --- | --- |
| `npm start` | Development server (`ng serve`) |
| `npm run ng -- --help` | Angular CLI help |
| `npm run watch` | Rebuild on changes using the development configuration |
| `npm run lint` | Angular/TypeScript/template lint |
| `npm test -- --watch=false --browsers=ChromeHeadless` | Complete Karma/Jasmine unit suite; requires Chrome |
| `npm run build` | Production build into `dist/my-flix-angular-client/` |
| `npm run build -- --configuration development` | Development build |
| `npm run test:integration` | Opt-in disposable local backend HTTP validation |

Unit tests use Karma/Jasmine and cover components, routing, session behavior,
and API-service requests. Linting checks TypeScript and Angular templates,
including template accessibility rules. `npm run build` uses the default
production configuration; `npm run build -- --configuration production` selects
it explicitly.

The integration runner uses the sibling `../movie-api` with an isolated temporary
MongoDB database on localhost port 8080. Both repositories need their locked
dependencies installed and an existing cached MongoDB binary; downloads are
disabled. It does not read the backend `.env`, contact production, or reuse an
existing database/listener. `MYFLIX_BACKEND_PATH` and `MYFLIX_MONGOD_BINARY` may
select another backend checkout or existing binary. Ordinary unit tests do
not require the backend. See [the runner](scripts/validate-integration.cjs).

## Design

The Warm Editorial design system uses a parchment canvas, ivory surfaces,
burgundy actions, and a separate destructive color treatment. It shares the
myFlix product structure with the React client while retaining its own theme.

The durable visual specification is [docs/design/DESIGN.md](docs/design/DESIGN.md).
The canonical favicon is `src/favicon.svg`; unchanged reference artwork lives
at `docs/design/assets/myflix-icon-source.png`. Runtime typography declares
Plus Jakarta Sans with system fallbacks; no font files are bundled/downloaded.
The canonical AI context pack lives under `docs/0-ai/artifacts/` and is generated
through the repository playbook artifact controller. Historical TypeDoc output
and tooling were retired because they were stale and had no active workflow.

## Cloudflare Workers deployment

The Angular client is deployed to Worker **`myflix-angular`**, serving the custom
domain and Workers URL linked above. Cloudflare Workers Builds manages the build
and deployment workflow. The tracked [wrangler.jsonc](wrangler.jsonc) configures
Worker `myflix-angular`, compatibility date `2026-10-08`, static assets directory
`./dist/my-flix-angular-client`, and
`assets.not_found_handling: "single-page-application"`.

The following settings are dashboard-verified:

| Setting | Value |
| --- | --- |
| Worker | `myflix-angular` |
| GitHub repository | [marksav85/myFlix-Angular-client](https://github.com/marksav85/myFlix-Angular-client) |
| Production branch | `master` |
| Root directory | `/` |
| Build command | `npm ci && npm run build -- --configuration production` |
| Asset output | `dist/my-flix-angular-client/` |
| Build Node.js | `18.20.8` |
| Build npm | `10.9.2` |
| `SKIP_DEPENDENCY_INSTALL` | `1` |
| Compatibility date | `2026-10-08` |

The exact Cloudflare deployment command is:

```sh
npm exec --yes --package=node@22 --package=wrangler@4 -- wrangler deploy --assets ./dist/my-flix-angular-client --name myflix-angular --compatibility-date 2026-10-08
```

The build runs with Node 18; the deployment command explicitly invokes Node 22
for Wrangler. `SKIP_DEPENDENCY_INSTALL=1` skips Cloudflare's automatic dependency
installation because the build command installs locked dependencies with
`npm ci`.

The production build uses base href `/` and publishes the generated static
assets from `dist/my-flix-angular-client/`. Angular Router uses browser paths,
so SPA fallback serves `index.html` for unmatched paths, allowing Angular to
resolve routes such as `/login`, `/signup`, `/profile`, and `/movies/:movieId`
on direct navigation and browser refresh. Cloudflare Workers Builds successfully
deployed this configuration from `master`; browser refreshes on application
routes have been verified working in production. Existing static assets continue
to be served normally, and API requests use the separate API origin.
