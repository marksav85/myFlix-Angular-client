# Development Handbook

## Project context and scope

This repository is the browser client for myFlix. It presents movie browsing, account and favourite workflows in Angular and sends HTTP requests to a separately maintained Movie API. The API owns account persistence, JWT validation and authorization; this client has no database layer.

The handbook records the current implementation and its important constraints. The public-facing project overview is in the [README](../README.md). The backend is a separate project, so backend implementation and hosting details are outside this repository's source of truth.

## Architecture and navigation

The application is bootstrapped from [`src/main.ts`](../src/main.ts) into the NgModule declared in [`src/app/app.module.ts`](../src/app/app.module.ts). `AppComponent` provides the navigation shell, skip link and router outlet. [`src/app/app-routing.module.ts`](../src/app/app-routing.module.ts) maps routes to page components:

| Route              | Page or behavior                                       |
| ------------------ | ------------------------------------------------------ |
| `/`                | Redirects to `/login`                                  |
| `/welcome`         | Legacy redirect to `/login`                            |
| `/login`           | Login form                                             |
| `/signup`          | Registration form                                      |
| `/movies`          | Movie library and title search                         |
| `/movies/:movieId` | Movie details resolved by ID from the movie collection |
| `/profile`         | Account, favourites, profile editing and deletion      |

The navigation bar changes its links based on whether `token` and `Username` are present in browser storage. Page components also check for session values before loading protected data. These checks control presentation and request flow; they are not route guards or an authorization boundary. The backend must enforce authentication and ownership.

Movie detail currently requests the movie collection and selects the matching `_id`. This supports direct URLs without relying on navigation state or a title lookup. The library's title search is performed in the client against the loaded collection.

## Components, services and data flow

Feature components and their templates and SCSS live together under `src/app/`. The main responsibilities are:

- `UserLoginFormComponent` and `UserRegistrationFormComponent` submit credentials and registration data.
- `NavigationBarComponent` presents guest or signed-in navigation and clears the local session on logout.
- `MovieLibraryComponent` loads the catalog, filters titles and presents reusable `MovieCardComponent` cards.
- `MovieDetailComponent` resolves a routed movie ID from the catalog and presents the selected movie.
- `UserProfileComponent` loads account and catalog data, edits account details, shows favourites and opens the delete-confirmation dialog.
- `DeleteAccountDialogComponent` handles the confirmed deletion request and displays its error state.

[`FetchApiDataService`](../src/app/fetch-api-data.service.ts) is the HTTP/API layer. It builds endpoint URLs from the configured origin, attaches Bearer headers to protected requests, maps response data to the client models, and normalizes most request failures to a safe generic error. Registration is the exception: HTTP 400 and 422 responses retain their details so the form can show duplicate-username or field-level validation feedback.

[`MovieFavoritesService`](../src/app/movie-favorites.service.ts) owns page-scoped favourite membership and mutation state. Library, Detail and Profile each provide an instance. It loads the current user, tracks pending and failed mutations, and publishes returned user changes to the page. The API service remains responsible for HTTP calls; the favourite service coordinates user-facing state and mutation order.

The API shapes are defined in [`src/app/api-models.ts`](../src/app/api-models.ts). `User` includes backend-cased fields such as `Username`, optional `Birthday` and `FavoriteMovies`; `Movie` includes nested `Genre` and `Director` models and optional image/featured fields. Registration, login and profile payloads use separate TypeScript types.

## Movie API integration and session contract

The API origins are defined in the environment files; `angular.json` replaces the
production file with the development file for development builds. The selected
origin is compiled into the browser bundle, so changing it requires a new frontend
build.

| Build mode  | Configuration                                                                  | API origin                                  |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| Development | [`environment.development.ts`](../src/environments/environment.development.ts) | `http://localhost:8080`                     |
| Production  | [`environment.ts`](../src/environments/environment.ts)                         | `https://api.myflix.marksavilledesigns.com` |

The API service uses these endpoint contracts:

| Operation                                  | Request                                                               |
| ------------------------------------------ | --------------------------------------------------------------------- |
| Register / log in                          | `POST /users`; `POST /login`                                          |
| Browse movies                              | `GET /movies`                                                         |
| API title, director and genre lookups      | `GET /movies/:title`, `/movies/director/:name`, `/movies/genre/:name` |
| Read, update or delete the current account | `GET`, `PUT` or `DELETE /users/:Username`                             |
| Add or remove a favourite                  | `POST` or `DELETE /users/:Username/movies/:MovieID`                   |

The UI's movie-detail route uses the collection endpoint and ID matching; the title, director and genre service methods are available for API lookups and are covered by service/integration tests. The client must preserve the backend's route and field casing. Account operations use the stored username selector; they do not use a user-list or `/users/me` route.

Successful login stores the returned user, JWT and username selector in `localStorage` as `user`, `token` and `Username`. Registration does not create a session. Logout clears those three keys. Protected requests send `Authorization: Bearer <token>`. The backend remains responsible for validating the token and restricting account operations to the authenticated owner; client-side session state can be changed by the user and is not proof of authorization.

## Application workflows and implementation notes

### Registration and login

The forms use Angular template-driven forms. [`RegistrationValidationDirective`](../src/app/user-registration-form/registration-validation.directive.ts) provides password, confirmation and birthday validation for the signup form. Username validation is at least five ASCII letters or digits. Password validation measures the minimum of eight Unicode code points and the maximum of 72 UTF-8 bytes. Birthday is optional and, when supplied, must be a real `YYYY-MM-DD` date no later than today. The confirmation value is used only in the client and is not sent to the API.

On registration success, the password fields are cleared and a Login link is
shown; registration does not create a session. For HTTP 400/422 registration
failures, the form can display safe field-specific messages; other failures use a
general message. Login writes local session data and navigates to Movies only
after a successful response. Failed login leaves existing session data unchanged.

### Browsing and favourites

Library, Detail and Profile load the movie catalog; Library filters titles
case-insensitively, while Detail selects a movie by ID from the fetched
collection. Missing movie, image or metadata states are rendered explicitly
rather than substituting another movie or exposing raw API errors.

Favourite membership is based on the server-returned `FavoriteMovies` array. Each page-scoped favourite service serializes mutations because each response contains a full user snapshot. `concatMap` prevents overlapping snapshots from racing, and `defer` checks membership when each queued operation begins. Successful responses replace the local user and membership; failures retain the prior state, clear pending status and expose an inline retryable error. Re-entering a page loads fresh user membership.

### Profile update and account deletion

Profile data and movie-catalog loading are handled separately so account information can remain available if the catalog fails. An update requires the form's username, email and password fields; the password must contain at least five characters. The form allows the current password to be reused or a new one to be supplied. A successful API response becomes the new authoritative user and refreshes the username selector. Failed updates retain the existing account/session and preserve the draft for retry.

Deletion requires confirmation in Angular Material's dialog. The dialog cannot be dismissed while a request is pending. Only a successful API response closes it as a confirmed deletion; the profile then clears the session and navigates to Login. A failed deletion remains in the dialog, displays a safe message and leaves account/session data intact. The API's deletion response is plain text.

## Styling and design system

Global styling and the Angular Material theme are set up in [`src/styles.scss`](../src/styles.scss). Shared palette, spacing, radius and font tokens are in [`src/_design-tokens.scss`](../src/_design-tokens.scss); feature-specific styling remains in component SCSS files. Angular Material is used for the account-deletion dialog, with the rest of the UI styled through the shared tokens and application classes. The maintained visual reference is [`docs/design-assets/DESIGN.md`](design-assets/DESIGN.md).

## Testing architecture and verification

Unit specs are colocated with application code under `src/app/`. They cover route configuration, forms and custom validation, API request contracts, navigation/session behavior, movie cards, Library and Detail state, profile coordination, and account deletion/error paths. [`tsconfig.spec.json`](../tsconfig.spec.json) includes these source specs.

The opt-in client/backend integration spec is [`tests/integration/client-backend.spec.ts`](../tests/integration/client-backend.spec.ts). [`scripts/validate-integration.cjs`](../scripts/validate-integration.cjs) starts the separate backend against a new in-memory MongoDB database, uses a random test JWT secret and disposable account, then runs the Angular specs with the integration spec included. It binds only to local loopback, does not load the backend `.env` or contact the production API, and verifies disposable-account cleanup. The runner requires an existing compatible MongoDB 8.2.6 executable and disables runtime downloads; exact local prerequisites and invocation belong in the Operations Runbook.

The most recent consolidated finalization run recorded 102 passing specs, a passing direct HTTP integration phase and successful disposable-account cleanup. Refresh this evidence after material application or test-runner changes.

## Constraints, issues and future work

- Frontend session checks and local-storage contents are presentation state only. Never rely on them for authorization or ownership enforcement.
- Keep the Angular build output aligned with the static asset directory and SPA fallback in [`wrangler.jsonc`](../wrangler.jsonc).
- The integration runner requires MongoDB 8.2.6, uses a version-checked cached executable or the `MONGOMS_SYSTEM_BINARY` override, and remains offline-only.
- No maintained roadmap or project decision log is present among the repository files reviewed. Do not infer future features or backend design from the Angular client alone.

Operational setup, detailed local commands, deployment, rollback and troubleshooting procedures belong in the Operations Runbook.
