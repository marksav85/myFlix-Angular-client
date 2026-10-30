# myFlix Angular Client — Working Instructions

## Project and architecture

This repository contains the Angular frontend for myFlix. The Movie API backend is maintained separately and is not part of this repository.

- Angular 16, TypeScript, Angular Material, RxJS, SCSS, and template-driven forms.
- `src/main.ts` bootstraps the NgModule-based application in `src/app/app.module.ts`.
- `src/app/app-routing.module.ts` defines login, signup, movie library, movie detail, and profile routes.
- Feature components live in `src/app/` in their own folders with TypeScript, HTML, SCSS, and (where present) Jasmine specs.
- `src/app/fetch-api-data.service.ts` owns Movie API HTTP requests and API models are in `src/app/api-models.ts`.
- `src/app/movie-favorites.service.ts` coordinates page-scoped favorite state and serialized favorite updates.
- Shared design tokens and global styles are in `src/_design-tokens.scss` and `src/styles.scss`.

Preserve the existing NgModule architecture, routes, API contract, session behavior, and component patterns unless the task explicitly authorizes a change.

## Coding conventions

- Follow the nearby Angular and TypeScript patterns. TypeScript is strict; use typed API models and keep backend field names such as `Username`, `Birthday`, and `FavoriteMovies` as defined by the API contract.
- Keep component templates and SCSS in their existing separate files. Angular component selectors use the `app-` prefix and kebab-case; attribute directives use the `app` prefix and camelCase, as enforced by ESLint.
- Use two-space indentation, UTF-8, final newlines, and single quotes in TypeScript, following `.editorconfig`. Respect established imports and naming in the affected files.
- ESLint checks TypeScript and Angular templates, including template accessibility rules. No Prettier configuration or formatting-check script is currently present; do not claim one exists or add formatter tooling without owner approval.
- Add comments only to explain non-obvious behavior, constraints, or decisions. Keep comments accurate; JSDoc is optional when it adds useful contract information.
- Make focused changes. Do not refactor unrelated code or introduce dependencies and abstractions without a concrete need and approval where required.

## Movie API and session

The production API origin is configured in `src/environments/environment.ts` as `https://api.myflix.marksavilledesigns.com`; development uses `http://localhost:8080` in `environment.development.ts`. Angular replaces the environment file for development builds. The API origin is compiled into the client bundle.

`FetchApiDataService` handles registration (`POST /users`), login (`POST /login`), movie reads (`/movies` and its title, director, and genre routes), and account operations. Protected requests send `Authorization: Bearer <token>` from `localStorage`. Account operations use the established self-only `/users/:Username` route; favorite mutations use `/users/:Username/movies/:MovieID`. Do not invent endpoints such as `/users/me` or a user-list route.

The API's account fields use the established capitalization, including `Birthday`. Login stores `user`, `Username`, and `token` in local storage; preserve existing session semantics and do not treat client-side checks as backend authorization. The backend remains responsible for authorization and ownership checks.

## Commands and validation

Commands are defined in the root `package.json`:

| Command | Use |
| --- | --- |
| `npm run lint` | Lint TypeScript and Angular HTML templates. |
| `npm test -- --watch=false --browsers=ChromeHeadless` | Run the Karma/Jasmine unit suite once; requires Chrome/ChromeHeadless. |
| `npm run test:integration` | Run the opt-in client/backend integration validation against an isolated local backend and disposable database. See `scripts/validate-integration.cjs`; it requires the separate backend checkout, installed dependencies, and a cached MongoDB binary. |
| `npm run build` | Create the default production build in `dist/my-flix-angular-client/`. |
| `npm run build -- --configuration development` | Create a development build using the localhost API configuration. |
| `npm start` | Start the Angular development server. |

Choose checks for the change. Prefer a focused check during implementation and consolidate broader validation. Do not run build, lint, and tests concurrently. Report checks that were not run. There is no configured format-check command.

Minimize CPU-intensive work: run significant Node/Angular tasks sequentially, avoid unnecessary watch processes and repeated ChromeHeadless launches, and do not start browser sessions, servers, or network operations unless the task requires them. Avoid unnecessary interactive browser or network permission prompts; do not skip essential validation silently.

## Deployment

`wrangler.jsonc` configures the `myflix-angular` Cloudflare Worker, serving `dist/my-flix-angular-client` as a single-page application. Cloudflare Workers Builds is the documented deployment workflow. Do not deploy or change production infrastructure without explicit owner authorization.

## Playbook reference

The MSD Projects Playbook is a separate repository at `/home/marksav85-x1/Development/projects--development/msd-projects-playbook`. Consult relevant documentation directly from that standalone checkout under its existing read-only YELLOW FLAG authorization. It is read-only from this Angular workspace. The former `playbook/` submodule has been removed; do not recreate it, copy the Playbook into this repository, or add a dependency on a nested checkout.

## Workspace, preservation, and approvals

- Modify only this active Angular repository. Treat the Movie API, myFlix React, and standalone Playbook repositories as separate repositories. Read external repositories only when the applicable YELLOW FLAG authorization covers the location and purpose; their read authorization never grants write access.
- Follow the Global Codex Workspace Safety policy. Never modify another Git repository from this workspace, including through scripts, automation, temporary clones, worktrees, or copied/generated files. Open a separate Codex session in the target repository for changes there.
- Preserve existing user changes. Do not reset, restore, stash, or discard unrelated work. Do not delete significant project material without explicit owner authorization.
- Do not commit, push, merge, change branches, deploy, or perform destructive Git operations without explicit owner authorization.
- External filesystem modifications require the applicable approval under the Global Codex Workspace Safety policy. Repository isolation still prohibits modifying another existing Git repository from this workspace.
