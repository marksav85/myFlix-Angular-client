# myFlix — Angular client

An Angular portfolio application for discovering movies and managing an account. The client communicates with a separately maintained Movie API for authentication, catalog data, favourites, and profile operations.

**[Explore the live Angular app](https://angular.myflix.marksavilledesigns.com)** · [Workers URL](https://myflix-angular.marksav85.workers.dev) · [React client](https://react.myflix.marksavilledesigns.com) · [Movie API](https://api.myflix.marksavilledesigns.com)

## Features

- Register and sign in, with inline registration feedback.
- Browse a responsive movie library, search titles, and view movie details.
- Add or remove favourites and manage profile information.
- Update account details or delete an account through a confirmation flow.
- Navigate directly to movie and account pages with Angular Router.

## Technology

Angular 16, TypeScript, Angular Material, Angular Router, template-driven forms, HttpClient, RxJS, and SCSS. The frontend is served as static assets by Cloudflare Workers and uses a separate Express REST API. The backend owns authentication, authorization, and persistent account and movie data; frontend session checks do not enforce access control.

## Technical highlights

- A typed API layer applies Bearer authentication and uses build-time environment configuration for local and production API origins.
- A page-scoped favourites service serializes mutations so full-user API responses do not overwrite newer membership state.
- Registration validation, profile updates, and account deletion preserve useful error feedback and avoid clearing session state after failed operations.
- Shared SCSS design tokens and an Angular Material theme support the Warm Editorial visual system.

## Local quick start

Install the locked dependencies with `npm ci`, ensure the separate Movie API is available at `http://localhost:8080` with CORS enabled for the Angular development origin, then run `npm start` and open `http://localhost:4200`. The development client uses the local API; the production API origin is compiled into production builds.

## Testing

Maintained unit tests use Karma and Jasmine. Run `npm run lint` for linting, `npm run format:check` for formatting verification, and `npm test -- --watch=false --browsers=ChromeHeadless` for the unit suite. The opt-in [`test:integration` runner](scripts/validate-integration.cjs) exercises the API against a disposable local database and includes the Angular suite; see the [Operations Runbook](docs/operations-runbook.md) for its prerequisites and isolation details.

## Deployment

The client is configured for Cloudflare Workers static assets, with SPA routing enabled in [`wrangler.jsonc`](wrangler.jsonc). Cloudflare Workers Builds is the documented automated deployment path. Dashboard settings, manual deployment, and release checks are covered in the [Operations Runbook](docs/operations-runbook.md).

## Design and project documentation

The maintained visual specification is [docs/design-assets/DESIGN.md](docs/design-assets/DESIGN.md), with the [favicon](src/favicon.svg) and [reference artwork](docs/design-assets/myflix-icon-source.png). For implementation details, see the [Development Handbook](docs/development-handbook.md); for local operation, testing, deployment, and recovery, see the [Operations Runbook](docs/operations-runbook.md).
