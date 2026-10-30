# myFlix Angular Client

## Project overview

This repository contains the Angular browser client for myFlix. It communicates with a separately maintained Movie API; the backend owns JWT authentication, account authorization and persistence.

## Architecture and integration contracts

- `src/main.ts` bootstraps the NgModule application in `src/app/app.module.ts`. Routes are defined in `src/app/app-routing.module.ts`.
- `src/app/fetch-api-data.service.ts` is the shared API layer; `src/app/api-models.ts` defines the client-side API models. Preserve the self-only `/users/:Username` and `/users/:Username/movies/:MovieID` contracts and backend field casing such as `Username`, `Birthday` and `FavoriteMovies`.
- Login session data uses the existing `user`, `Username` and `token` local-storage keys. Client-side session checks are not an authorization boundary.
- `src/app/movie-favorites.service.ts` coordinates page-scoped favourite state and serialized mutations across Library, Detail and Profile.
- Environment files define the API origin. Keep the Angular output directory in `angular.json` aligned with the static asset directory and SPA fallback in `wrangler.jsonc`.

## Working principles

Preserve established application behaviour, routes and integration contracts unless the authorized task requires a change. Verify assumptions against current source and configuration.
