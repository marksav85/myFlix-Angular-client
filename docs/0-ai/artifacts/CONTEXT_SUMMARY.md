---
artifactId: CONTEXT_SUMMARY
packId: "2026-09-26T22:22:20Z"
generatedAt: "2026-09-26T22:22:20Z"
generator: "prompt--artifact--generate-context-summary.md"
---

# myFlix Angular client context

## Project type

An existing Angular 16 browser client for browsing movies and managing an authenticated user's profile and favourites. It is an NgModule-based application, bootstrapped from `src/main.ts` with `AppModule`.

## Routing model

Routes are registered directly in `AppModule` with `RouterModule.forRoot`. The application has routes for `/welcome`, `/movies`, and `/profile`; the empty path redirects to `/welcome`. `AppRoutingModule` is imported but its own route array is empty.

## Source scope

The source root is `src/`. The generated source tree includes 12 non-test TypeScript files in 8 directories. Component HTML, SCSS, tests, and static assets are present in the repository but excluded from `SRC_TREE.json` by the generator's file-scope rule.

## Application structure

`AppComponent` is only a router outlet. `WelcomePageComponent` opens Angular Material dialogs for registration and login. `MovieCardComponent` renders the movie collection, shows movie detail dialogs, and adds or removes favourites. `UserProfileComponent` reads, updates, and deletes the current user. `NavigationBarComponent` provides movies, profile, and logout navigation. `MovieDetailsComponent` is the reusable dialog body.

## API and authentication

`UserRegistrationService` centralizes HTTP calls to `https://movie-api-mreb.onrender.com/`. It implements registration, login, movie listing, user retrieval and update, account deletion, and favourite add/remove requests. Login writes `user`, `token`, and `Username` to browser local storage. Protected requests build a `Bearer` authorization header from `token`.

## UI and styling

The application uses Angular Material components, template-driven forms (`FormsModule`), SCSS component styles, a global Material theme, and Google-hosted Roboto and Material Icons. There is no application state-management library; components keep local arrays and call the service directly.

## Tooling and deployment

Angular CLI provides serve and browser builds. The project uses Karma/Jasmine tests, angular-eslint linting, Prettier for HTML, TypeDoc output in `docs/`, and `angular-cli-ghpages` deployment with base href `/myFlix-Angular-client/`.

## Confirmed limitations to preserve during refactoring planning

The client has no environment-file configuration; the API URL is hard-coded in the service. API payloads are typed as `any`. Route definitions are duplicated structurally between `AppModule` and an otherwise empty `AppRoutingModule`. The committed TypeDoc HTML references an older source commit, so it should not be treated as current implementation documentation.
